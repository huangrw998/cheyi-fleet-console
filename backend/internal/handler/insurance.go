package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) ListInsurance(c *gin.Context) {
	q := h.DB.Model(&models.InsurancePolicy{})
	if v := c.Query("status"); v != "" && v != "all" {
		q = q.Where("status = ?", v)
	}
	if c.Query("expiring") == "true" {
		q = q.Where("end_date <= ?", daysFromNow(30))
	}
	var rows []models.InsurancePolicy
	if err := q.Preload("Vehicle").Preload("Vehicle.Model").Order("end_date ASC").Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取保险失败")
		return
	}
	ok(c, rows)
}
