package handler

import (
	"strings"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) Search(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		ok(c, gin.H{"models": []any{}, "vehicles": []any{}, "drivers": []any{}, "leases": []any{}})
		return
	}
	var modelRows []models.VehicleModel
	h.DB.Where("status = ? AND (name LIKE ? OR brand LIKE ?)", "active", like(q), like(q)).Limit(5).Find(&modelRows)
	var vehicles []models.Vehicle
	h.DB.Preload("Model").Preload("Store").Where("plate_no LIKE ? OR vin LIKE ?", like(q), like(q)).Limit(5).Find(&vehicles)
	var drivers []models.Driver
	h.DB.Where("name LIKE ? OR phone LIKE ?", like(q), like(q)).Limit(5).Find(&drivers)
	var leases []models.Lease
	h.DB.Preload("Driver").Preload("Vehicle").Where("lease_no LIKE ?", like(q)).Limit(5).Find(&leases)
	ok(c, gin.H{"models": modelRows, "vehicles": vehicles, "drivers": drivers, "leases": leases})
}
