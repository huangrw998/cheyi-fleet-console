package handler

import (
	"net/http"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type violationRequest struct {
	VehicleID  uint   `json:"vehicle_id"`
	DriverID   uint   `json:"driver_id"`
	OccurredAt string `json:"occurred_at"`
	Location   string `json:"location"`
	Reason     string `json:"reason"`
	FineCents  int64  `json:"fine_cents"`
	Points     int    `json:"points"`
	Note       string `json:"note"`
}

func (h *Handler) ListViolations(c *gin.Context) {
	q := h.DB.Model(&models.Violation{})
	if v := c.Query("status"); v != "" && v != "all" {
		q = q.Where("status = ?", v)
	}
	var rows []models.Violation
	if err := q.Preload("Vehicle").Preload("Vehicle.Model").Preload("Driver").Order("occurred_at DESC").Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取违章失败")
		return
	}
	ok(c, rows)
}

func (h *Handler) CreateViolation(c *gin.Context) {
	var req violationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写违章信息")
		return
	}
	if req.VehicleID == 0 || req.Reason == "" {
		fail(c, http.StatusBadRequest, "invalid_input", "车辆和违章原因不能为空")
		return
	}
	occurred := time.Now()
	if t, err := parseDate(req.OccurredAt); err == nil {
		occurred = t
	}
	v := models.Violation{
		VehicleID: req.VehicleID, DriverID: req.DriverID, OccurredAt: occurred,
		Location: req.Location, Reason: req.Reason, FineCents: req.FineCents,
		Points: req.Points, Status: "pending", Note: req.Note,
	}
	if err := h.DB.Create(&v).Error; err != nil {
		fail(c, http.StatusInternalServerError, "create_failed", "违章记录创建失败")
		return
	}
	h.DB.Preload("Vehicle").Preload("Driver").First(&v, v.ID)
	c.JSON(http.StatusCreated, gin.H{"data": v})
}

func (h *Handler) HandleViolation(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var v models.Violation
	if err := h.DB.First(&v, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "违章记录不存在")
		return
	}
	if v.Status == "handled" {
		fail(c, http.StatusConflict, "invalid_state", "该违章已处理")
		return
	}
	now := time.Now()
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&v).Updates(map[string]any{"status": "handled", "handled_at": now}).Error; err != nil {
			return err
		}
		if v.FineCents > 0 {
			var lease models.Lease
			if err := tx.Where("vehicle_id = ? AND status IN ?", v.VehicleID, []string{"active", "pending_return"}).First(&lease).Error; err == nil {
				b := models.Bill{
					BillNo: newCode("BILL"), LeaseID: lease.ID, Type: "violation",
					PeriodStart: now, PeriodEnd: now, AmountCents: v.FineCents,
					DueDate: now, Status: "pending", Note: v.Reason,
				}
				if err := tx.Create(&b).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "违章处理失败")
		return
	}
	h.DB.Preload("Vehicle").Preload("Driver").First(&v, id)
	ok(c, v)
}
