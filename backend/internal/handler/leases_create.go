package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type leaseCreateRequest struct {
	DriverID         uint   `json:"driver_id"`
	VehicleID        uint   `json:"vehicle_id"`
	StoreID          uint   `json:"store_id"`
	StartDate        string `json:"start_date"`
	EndDate          string `json:"end_date"`
	MonthlyRentCents int64  `json:"monthly_rent_cents"`
	DepositCents     int64  `json:"deposit_cents"`
	Note             string `json:"note"`
}

func (h *Handler) CreateLease(c *gin.Context) {
	var req leaseCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写完整的租约信息")
		return
	}
	start, err := parseDate(req.StartDate)
	if err != nil {
		fail(c, http.StatusBadRequest, "invalid_date", "起租日期不合法")
		return
	}
	end, err := parseDate(req.EndDate)
	if err != nil {
		fail(c, http.StatusBadRequest, "invalid_date", "到期日期不合法")
		return
	}
	if !end.After(start) {
		fail(c, http.StatusBadRequest, "invalid_date", "到期日期必须晚于起租日期")
		return
	}

	var driver models.Driver
	if err := h.DB.First(&driver, req.DriverID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_driver", "司机不存在")
		return
	}
	if driver.Status != "certified" && driver.Status != "returned" {
		fail(c, http.StatusConflict, "driver_unavailable", "该司机当前不可新增租约")
		return
	}
	var activeCount int64
	h.DB.Model(&models.Lease{}).Where("driver_id = ? AND status IN ?", driver.ID, []string{"pending_sign", "pending_pickup", "active", "pending_return"}).Count(&activeCount)
	if activeCount > 0 {
		fail(c, http.StatusConflict, "driver_has_lease", "该司机已有生效中的租约")
		return
	}

	var vehicle models.Vehicle
	if err := h.DB.Preload("Model").Preload("Store").First(&vehicle, req.VehicleID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_vehicle", "车辆不存在")
		return
	}
	if vehicle.Status != "available" {
		fail(c, http.StatusConflict, "vehicle_unavailable", "该车辆当前不可出租")
		return
	}
	storeID := req.StoreID
	if storeID == 0 {
		storeID = vehicle.StoreID
	}
	var store models.Store
	if err := h.DB.First(&store, storeID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_store", "门店不存在")
		return
	}
	rent := req.MonthlyRentCents
	deposit := req.DepositCents
	if rent <= 0 && vehicle.Model != nil {
		rent = vehicle.Model.MonthlyRentCents
	}
	if deposit <= 0 && vehicle.Model != nil {
		deposit = vehicle.Model.DepositCents
	}
	if rent <= 0 {
		fail(c, http.StatusBadRequest, "invalid_amount", "月租金额不合法")
		return
	}

	var lease models.Lease
	err = h.DB.Transaction(func(tx *gorm.DB) error {
		lease = models.Lease{
			LeaseNo: newCode("CY"), DriverID: driver.ID, VehicleID: vehicle.ID, StoreID: store.ID,
			StartDate: start, EndDate: end, MonthlyRentCents: rent, DepositCents: deposit,
			Status: "pending_sign", Note: req.Note,
		}
		if err := tx.Create(&lease).Error; err != nil {
			return err
		}
		if err := tx.Create(&models.LeaseEvent{LeaseID: lease.ID, Type: "created", Note: "租约创建，等待司机签约"}).Error; err != nil {
			return err
		}
		firstBill := models.Bill{
			BillNo: newCode("BILL"), LeaseID: lease.ID, Type: "rent",
			PeriodStart: start, PeriodEnd: start.AddDate(0, 1, 0),
			AmountCents: rent, DueDate: start, Status: "pending",
		}
		if err := tx.Create(&firstBill).Error; err != nil {
			return err
		}
		return tx.Model(&models.Vehicle{}).Where("id = ?", vehicle.ID).Update("status", "reserved").Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "create_failed", "租约创建失败")
		return
	}
	h.DB.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").Preload("Bills").Preload("Events").First(&lease, lease.ID)
	c.JSON(http.StatusCreated, gin.H{"data": lease})
}
