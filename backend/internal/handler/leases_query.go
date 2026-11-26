package handler

import (
	"net/http"
	"strings"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *Handler) ListLeases(c *gin.Context) {
	q := h.DB.Model(&models.Lease{})
	if v := c.Query("status"); v != "" && v != "all" {
		if v == "overdue" {
			q = q.Where("status = ? AND end_date < ?", "active", today())
		} else {
			q = q.Where("status = ?", v)
		}
	}
	if id, ok := queryUint(c, "store_id"); ok {
		q = q.Where("store_id = ?", id)
	}
	if v := strings.TrimSpace(c.Query("q")); v != "" {
		q = q.Joins("LEFT JOIN drivers ON drivers.id = leases.driver_id").
			Joins("LEFT JOIN vehicles ON vehicles.id = leases.vehicle_id").
			Where("(leases.lease_no LIKE ? OR drivers.name LIKE ? OR vehicles.plate_no LIKE ?)", like(v), like(v), like(v))
	}
	var total int64
	q.Count(&total)
	page, size := pageParams(c)
	var rows []models.Lease
	if err := q.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").
		Order("leases.created_at DESC").Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取租约失败")
		return
	}
	paginated(c, rows, page, size, total)
}

func (h *Handler) LeaseDetail(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var lease models.Lease
	if err := h.DB.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").
		Preload("Bills", func(db *gorm.DB) *gorm.DB { return db.Order("due_date ASC") }).
		Preload("Events", func(db *gorm.DB) *gorm.DB { return db.Order("created_at ASC") }).
		First(&lease, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "租约不存在")
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": lease})
}
