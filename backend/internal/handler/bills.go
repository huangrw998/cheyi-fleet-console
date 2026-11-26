package handler

import (
	"encoding/csv"
	"net/http"
	"strconv"
	"strings"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *Handler) ListBills(c *gin.Context) {
	q := h.DB.Model(&models.Bill{})
	if v := c.Query("status"); v != "" && v != "all" {
		q = q.Where("status = ?", v)
	}
	if v := c.Query("type"); v != "" && v != "all" {
		q = q.Where("type = ?", v)
	}
	if id, ok := queryUint(c, "lease_id"); ok {
		q = q.Where("lease_id = ?", id)
	}
	if v := strings.TrimSpace(c.Query("q")); v != "" {
		q = q.Joins("LEFT JOIN leases ON leases.id = bills.lease_id").
			Joins("LEFT JOIN drivers ON drivers.id = leases.driver_id").
			Joins("LEFT JOIN vehicles ON vehicles.id = leases.vehicle_id").
			Where("(bills.bill_no LIKE ? OR drivers.name LIKE ? OR vehicles.plate_no LIKE ?)", like(v), like(v), like(v))
	}
	var total int64
	q.Count(&total)
	page, size := pageParams(c)
	var rows []models.Bill
	if err := q.Preload("Lease").Preload("Lease.Driver").Preload("Lease.Vehicle").Preload("Lease.Vehicle.Model").
		Order("bills.due_date DESC").Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取账单失败")
		return
	}
	paginated(c, rows, page, size, total)
}

func (h *Handler) BillDetail(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var b models.Bill
	if err := h.DB.Preload("Lease").Preload("Lease.Driver").Preload("Lease.Vehicle").Preload("Lease.Vehicle.Model").First(&b, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "账单不存在")
		return
	}
	ok(c, b)
}

type payRequest struct {
	Method      string `json:"method"`
	PaidAt      string `json:"paid_at"`
	AmountCents int64  `json:"amount_cents"`
}

func (h *Handler) PayBill(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var b models.Bill
	if err := h.DB.First(&b, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "账单不存在")
		return
	}
	if b.Status != "pending" && b.Status != "overdue" {
		fail(c, http.StatusConflict, "invalid_state", "当前账单状态不允许收款")
		return
	}
	var req payRequest
	_ = c.ShouldBindJSON(&req)
	if req.Method == "" {
		req.Method = "bank"
	}
	paidAt := time.Now()
	if req.PaidAt != "" {
		if t, err := parseDate(req.PaidAt); err == nil {
			paidAt = t
		}
	}
	amount := b.AmountCents
	if req.AmountCents > 0 {
		amount = req.AmountCents
	}
	if err := h.DB.Model(&b).Updates(map[string]any{
		"status": "paid", "paid_at": paidAt, "paid_amount_cents": amount, "method": req.Method,
	}).Error; err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "收款登记失败")
		return
	}
	h.DB.Preload("Lease").Preload("Lease.Driver").Preload("Lease.Vehicle").First(&b, id)
	ok(c, b)
}

func (h *Handler) GenerateBills(c *gin.Context) {
	var leases []models.Lease
	if err := h.DB.Where("status = ?", "active").Find(&leases).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取租约失败")
		return
	}
	created := 0
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		for _, l := range leases {
			var latest models.Bill
			var nextStart time.Time
			if err := tx.Where("lease_id = ? AND type = ?", l.ID, "rent").Order("period_end DESC").First(&latest).Error; err == nil {
				nextStart = latest.PeriodEnd
			} else {
				nextStart = l.StartDate
			}
			if nextStart.Before(today()) {
				nextStart = today()
			}
			// Skip if a rent bill already exists for the period.
			var exists int64
			tx.Model(&models.Bill{}).Where("lease_id = ? AND type = ? AND period_start = ?", l.ID, "rent", nextStart).Count(&exists)
			if exists > 0 {
				continue
			}
			b := models.Bill{
				BillNo: newCode("BILL"), LeaseID: l.ID, Type: "rent",
				PeriodStart: nextStart, PeriodEnd: nextStart.AddDate(0, 1, 0),
				AmountCents: l.MonthlyRentCents, DueDate: nextStart, Status: "pending",
			}
			if err := tx.Create(&b).Error; err != nil {
				return err
			}
			created++
		}
		return nil
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "generate_failed", "账单生成失败")
		return
	}
	ok(c, gin.H{"created": created})
}

func (h *Handler) ExportBills(c *gin.Context) {
	var rows []models.Bill
	h.DB.Preload("Lease").Preload("Lease.Driver").Preload("Lease.Vehicle").Order("due_date DESC").Find(&rows)
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=cheyi-bills.csv")
	c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})
	w := csv.NewWriter(c.Writer)
	_ = w.Write([]string{"账单号", "类型", "司机", "车牌", "金额(元)", "到期日", "状态", "收款方式"})
	for _, b := range rows {
		driver, plate := "", ""
		if b.Lease != nil {
			if b.Lease.Driver != nil {
				driver = b.Lease.Driver.Name
			}
			if b.Lease.Vehicle != nil {
				plate = b.Lease.Vehicle.PlateNo
			}
		}
		_ = w.Write([]string{
			b.BillNo, b.Type, driver, plate,
			strconv.FormatFloat(float64(b.AmountCents)/100, 'f', 2, 64),
			dateString(b.DueDate), b.Status, b.Method,
		})
	}
	w.Flush()
}
