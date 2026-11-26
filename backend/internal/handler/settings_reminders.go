package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type remindersRequest struct {
	InsuranceDays string `json:"insurance_days"`
	MaintenanceKm string `json:"maintenance_km"`
	OverdueDays   string `json:"overdue_days"`
}

func (h *Handler) UpdateReminders(c *gin.Context) {
	var req remindersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "提醒规则不合法")
		return
	}
	values := []models.Setting{
		{Key: "reminder_insurance_days", Value: req.InsuranceDays},
		{Key: "reminder_maintenance_km", Value: req.MaintenanceKm},
		{Key: "reminder_overdue_days", Value: req.OverdueDays},
	}
	for _, v := range values {
		if err := h.DB.Save(&v).Error; err != nil {
			fail(c, http.StatusInternalServerError, "update_failed", "提醒规则保存失败")
			return
		}
	}
	ok(c, gin.H{"ok": true})
}
