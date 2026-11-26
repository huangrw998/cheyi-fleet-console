package handler

import (
	"net/http"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type leaseActionRequest struct {
	MileageKm       int    `json:"mileage_km"`
	DeductionsCents int64  `json:"deductions_cents"`
	Note            string `json:"note"`
}

func (h *Handler) SignLease(c *gin.Context) {
	h.leaseTransition(c, []string{"pending_sign"}, "pending_pickup", func(tx *gorm.DB, lease *models.Lease) error {
		now := time.Now()
		lease.SignedAt = &now
		if err := tx.Model(lease).Update("signed_at", now).Error; err != nil {
			return err
		}
		return tx.Model(lease).Update("status", "pending_pickup").Error
	}, "司机完成签约，等待交车")
}

func (h *Handler) HandoverLease(c *gin.Context) {
	var req leaseActionRequest
	_ = c.ShouldBindJSON(&req)
	h.leaseTransition(c, []string{"pending_pickup"}, "active", func(tx *gorm.DB, lease *models.Lease) error {
		if req.MileageKm <= 0 {
			req.MileageKm = 10000
		}
		if err := tx.Model(lease).Updates(map[string]any{"pickup_mileage": req.MileageKm, "status": "active"}).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Vehicle{}).Where("id = ?", lease.VehicleID).Updates(map[string]any{"status": "rented", "mileage_km": req.MileageKm}).Error; err != nil {
			return err
		}
		return tx.Model(&models.Driver{}).Where("id = ?", lease.DriverID).Update("status", "leased").Error
	}, "车辆已交付，租约开始")
}

func (h *Handler) ReturnLease(c *gin.Context) {
	var req leaseActionRequest
	_ = c.ShouldBindJSON(&req)
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var lease models.Lease
	if err := h.DB.First(&lease, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "租约不存在")
		return
	}
	if lease.Status != "active" {
		fail(c, http.StatusConflict, "invalid_state", "当前租约状态不允许退租")
		return
	}
	if req.MileageKm <= 0 {
		req.MileageKm = lease.PickupMileage + 10000
	}
	now := time.Now()
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&lease).Updates(map[string]any{
			"status": "returned", "return_mileage": req.MileageKm, "closed_at": now,
		}).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Vehicle{}).Where("id = ?", lease.VehicleID).Updates(map[string]any{
			"status": "available", "mileage_km": req.MileageKm,
		}).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Driver{}).Where("id = ?", lease.DriverID).Update("status", "certified").Error; err != nil {
			return err
		}
		if err := tx.Create(&models.LeaseEvent{LeaseID: lease.ID, Type: "returned", Note: "车辆已退回，完成验车结算"}).Error; err != nil {
			return err
		}
		if req.DeductionsCents > 0 {
			bill := models.Bill{
				BillNo: newCode("BILL"), LeaseID: lease.ID, Type: "damage",
				PeriodStart: now, PeriodEnd: now, AmountCents: req.DeductionsCents,
				DueDate: now, Status: "pending", Note: req.Note,
			}
			if err := tx.Create(&bill).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "return_failed", "退租办理失败")
		return
	}
	h.DB.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").Preload("Bills").Preload("Events").First(&lease, id)
	ok(c, lease)
}

func (h *Handler) CancelLease(c *gin.Context) {
	var req leaseActionRequest
	_ = c.ShouldBindJSON(&req)
	h.leaseTransition(c, []string{"pending_sign", "pending_pickup"}, "cancelled", func(tx *gorm.DB, lease *models.Lease) error {
		if err := tx.Model(lease).Update("status", "cancelled").Error; err != nil {
			return err
		}
		return tx.Model(&models.Vehicle{}).Where("id = ?", lease.VehicleID).Update("status", "available").Error
	}, "租约已取消，车辆释放")
}

func (h *Handler) leaseTransition(c *gin.Context, allowedFrom []string, to string, fn func(*gorm.DB, *models.Lease) error, eventNote string) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var lease models.Lease
	if err := h.DB.First(&lease, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "租约不存在")
		return
	}
	allowed := false
	for _, s := range allowedFrom {
		if lease.Status == s {
			allowed = true
			break
		}
	}
	if !allowed {
		fail(c, http.StatusConflict, "invalid_state", "当前租约状态不允许此操作")
		return
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := fn(tx, &lease); err != nil {
			return err
		}
		return tx.Create(&models.LeaseEvent{LeaseID: lease.ID, Type: to, Note: eventNote}).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "transition_failed", "操作失败，请重试")
		return
	}
	h.DB.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").Preload("Bills").Preload("Events").First(&lease, id)
	ok(c, lease)
}
