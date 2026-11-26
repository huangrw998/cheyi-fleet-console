package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) DriverDetail(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var d models.Driver
	if err := h.DB.First(&d, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "司机不存在")
		return
	}
	var leases []models.Lease
	h.DB.Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").Where("driver_id = ?", id).Order("created_at DESC").Find(&leases)
	var bills []models.Bill
	if len(leases) > 0 {
		ids := make([]uint, 0, len(leases))
		for _, l := range leases {
			ids = append(ids, l.ID)
		}
		h.DB.Preload("Lease").Where("lease_id IN ?", ids).Order("due_date DESC").Find(&bills)
	}
	var violations []models.Violation
	h.DB.Preload("Vehicle").Where("driver_id = ?", id).Order("occurred_at DESC").Find(&violations)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"driver": d, "leases": leases, "bills": bills, "violations": violations,
	}})
}

func (h *Handler) PatchDriver(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var d models.Driver
	if err := h.DB.First(&d, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "司机不存在")
		return
	}
	var req driverPatch
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "更新内容不合法")
		return
	}
	updates := map[string]any{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Phone != nil {
		updates["phone"] = *req.Phone
	}
	if req.LicenseNo != nil {
		updates["license_no"] = *req.LicenseNo
	}
	if req.LicenseExpiry != nil {
		if t, err := parseDate(*req.LicenseExpiry); err == nil {
			updates["license_expiry"] = t
		}
	}
	if req.Status != nil {
		if !driverStatuses[*req.Status] {
			fail(c, http.StatusBadRequest, "invalid_status", "司机状态不合法")
			return
		}
		updates["status"] = *req.Status
	}
	if req.Rating != nil {
		updates["rating"] = *req.Rating
	}
	if req.EmergencyContact != nil {
		updates["emergency_contact"] = *req.EmergencyContact
	}
	if req.Note != nil {
		updates["note"] = *req.Note
	}
	if len(updates) > 0 {
		if err := h.DB.Model(&d).Updates(updates).Error; err != nil {
			fail(c, http.StatusInternalServerError, "update_failed", "司机更新失败")
			return
		}
	}
	h.DB.First(&d, id)
	ok(c, d)
}

func (h *Handler) DriverLeases(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var leases []models.Lease
	h.DB.Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").Where("driver_id = ?", id).Order("created_at DESC").Find(&leases)
	ok(c, leases)
}
