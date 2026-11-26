package handler

import (
	"net/http"
	"strings"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type maintenanceRequest struct {
	VehicleID   uint   `json:"vehicle_id"`
	Type        string `json:"type"`
	ScheduledAt string `json:"scheduled_at"`
	CostCents   int64  `json:"cost_cents"`
	Vendor      string `json:"vendor"`
	MileageKm   int    `json:"mileage_km"`
	Description string `json:"description"`
}

type statusRequest struct {
	Status string `json:"status"`
	Note   string `json:"note"`
}

func (h *Handler) ListMaintenance(c *gin.Context) {
	q := h.DB.Model(&models.MaintenanceOrder{})
	if v := c.Query("status"); v != "" && v != "all" {
		q = q.Where("status = ?", v)
	}
	if v := c.Query("type"); v != "" && v != "all" {
		q = q.Where("type = ?", v)
	}
	if v := strings.TrimSpace(c.Query("q")); v != "" {
		q = q.Joins("LEFT JOIN vehicles ON vehicles.id = maintenance_orders.vehicle_id").
			Where("(maintenance_orders.order_no LIKE ? OR vehicles.plate_no LIKE ?)", like(v), like(v))
	}
	var rows []models.MaintenanceOrder
	if err := q.Preload("Vehicle").Preload("Vehicle.Model").Order("maintenance_orders.scheduled_at DESC").Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取维保工单失败")
		return
	}
	ok(c, rows)
}

func (h *Handler) CreateMaintenance(c *gin.Context) {
	var req maintenanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写完整的工单信息")
		return
	}
	var v models.Vehicle
	if err := h.DB.Preload("Model").First(&v, req.VehicleID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_vehicle", "车辆不存在")
		return
	}
	if v.Status == "rented" || v.Status == "reserved" {
		fail(c, http.StatusConflict, "vehicle_in_use", "在租或已锁定车辆不能直接创建维保工单")
		return
	}
	if req.Type == "" {
		req.Type = "maintenance"
	}
	scheduled := time.Now()
	if t, err := parseDate(req.ScheduledAt); err == nil {
		scheduled = t
	}
	order := models.MaintenanceOrder{
		OrderNo: newCode("MT"), VehicleID: req.VehicleID, Type: req.Type, Status: "scheduled",
		ScheduledAt: scheduled, CostCents: req.CostCents, Vendor: req.Vendor,
		MileageKm: req.MileageKm, Description: req.Description,
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		return tx.Model(&models.Vehicle{}).Where("id = ?", v.ID).Update("status", "maintenance").Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "create_failed", "工单创建失败")
		return
	}
	h.DB.Preload("Vehicle").Preload("Vehicle.Model").First(&order, order.ID)
	c.JSON(http.StatusCreated, gin.H{"data": order})
}

func (h *Handler) UpdateMaintenanceStatus(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var order models.MaintenanceOrder
	if err := h.DB.First(&order, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "工单不存在")
		return
	}
	var req statusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "状态不合法")
		return
	}
	valid := map[string]bool{"scheduled": true, "in_progress": true, "pending_acceptance": true, "completed": true, "cancelled": true}
	if !valid[req.Status] {
		fail(c, http.StatusBadRequest, "invalid_status", "工单状态不合法")
		return
	}
	updates := map[string]any{"status": req.Status}
	if req.Status == "completed" {
		now := time.Now()
		updates["completed_at"] = now
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&order).Updates(updates).Error; err != nil {
			return err
		}
		if req.Status == "completed" || req.Status == "cancelled" {
			var active int64
			tx.Model(&models.Lease{}).Where("vehicle_id = ? AND status IN ?", order.VehicleID, []string{"active", "pending_pickup", "pending_return"}).Count(&active)
			if active == 0 {
				if err := tx.Model(&models.Vehicle{}).Where("id = ?", order.VehicleID).Update("status", "available").Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "工单更新失败")
		return
	}
	h.DB.Preload("Vehicle").Preload("Vehicle.Model").First(&order, id)
	ok(c, order)
}
