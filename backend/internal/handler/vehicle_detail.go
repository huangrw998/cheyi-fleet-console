package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) VehicleDetail(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var v models.Vehicle
	if err := h.DB.Preload("Model").Preload("Store").First(&v, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "车辆不存在")
		return
	}
	var leases []models.Lease
	h.DB.Preload("Driver").Preload("Store").Where("vehicle_id = ?", id).Order("created_at DESC").Find(&leases)
	var maintenance []models.MaintenanceOrder
	h.DB.Where("vehicle_id = ?", id).Order("scheduled_at DESC").Find(&maintenance)
	var insurance []models.InsurancePolicy
	h.DB.Where("vehicle_id = ?", id).Order("end_date DESC").Find(&insurance)
	var violations []models.Violation
	h.DB.Preload("Driver").Where("vehicle_id = ?", id).Order("occurred_at DESC").Find(&violations)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"vehicle": v, "leases": leases, "maintenance": maintenance,
		"insurance": insurance, "violations": violations,
	}})
}

func (h *Handler) VehicleLeases(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var leases []models.Lease
	h.DB.Preload("Driver").Preload("Store").Where("vehicle_id = ?", id).Order("created_at DESC").Find(&leases)
	ok(c, leases)
}

func (h *Handler) VehicleMaintenance(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var rows []models.MaintenanceOrder
	h.DB.Where("vehicle_id = ?", id).Order("scheduled_at DESC").Find(&rows)
	ok(c, rows)
}

func (h *Handler) VehicleInsurance(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var rows []models.InsurancePolicy
	h.DB.Where("vehicle_id = ?", id).Order("end_date DESC").Find(&rows)
	ok(c, rows)
}

func (h *Handler) VehicleViolations(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var rows []models.Violation
	h.DB.Preload("Driver").Where("vehicle_id = ?", id).Order("occurred_at DESC").Find(&rows)
	ok(c, rows)
}
