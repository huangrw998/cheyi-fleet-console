package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) GetSettings(c *gin.Context) {
	var stores []models.Store
	h.DB.Order("id ASC").Find(&stores)
	var plans []models.PricingPlan
	h.DB.Order("id ASC").Find(&plans)
	var settings []models.Setting
	h.DB.Find(&settings)
	values := map[string]string{}
	for _, s := range settings {
		values[s.Key] = s.Value
	}
	var user models.User
	h.DB.First(&user, currentUserID(c))
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"stores": stores, "pricing_plans": plans, "profile": user,
		"reminders": gin.H{
			"insurance_days": values["reminder_insurance_days"],
			"maintenance_km": values["reminder_maintenance_km"],
			"overdue_days":   values["reminder_overdue_days"],
		},
		"company": gin.H{
			"name": values["company_name"], "contact": values["company_contact"], "address": values["company_address"],
		},
	}})
}
