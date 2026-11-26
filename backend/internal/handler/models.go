package handler

import (
	"net/http"
	"sort"
	"strings"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type modelView struct {
	models.VehicleModel
	FleetTotal     int     `json:"fleet_total"`
	FleetActive    int     `json:"fleet_active"`
	AvailableCount int     `json:"available_count"`
	Utilization    float64 `json:"utilization"`
}

func (h *Handler) enrichModels(rows []models.VehicleModel) []modelView {
	var vehicles []models.Vehicle
	h.DB.Select("id, model_id, status").Find(&vehicles)
	total := map[uint]int{}
	active := map[uint]int{}
	available := map[uint]int{}
	for _, v := range vehicles {
		total[v.ModelID]++
		if v.Status == "rented" {
			active[v.ModelID]++
		}
		if v.Status == "available" {
			available[v.ModelID]++
		}
	}
	out := make([]modelView, 0, len(rows))
	for _, m := range rows {
		u := 0.0
		if total[m.ID] > 0 {
			u = float64(active[m.ID]) / float64(total[m.ID]) * 100
		}
		out = append(out, modelView{
			VehicleModel: m, FleetTotal: total[m.ID], FleetActive: active[m.ID],
			AvailableCount: available[m.ID], Utilization: u,
		})
	}
	return out
}

func (h *Handler) ListModels(c *gin.Context) {
	q := h.DB.Model(&models.VehicleModel{}).Where("status = ?", "active")
	if v := c.Query("body_type"); v != "" && v != "all" {
		q = q.Where("body_type = ?", v)
	}
	if v := c.Query("brand"); v != "" && v != "all" {
		q = q.Where("brand = ?", v)
	}
	if v := c.Query("q"); strings.TrimSpace(v) != "" {
		q = q.Where("(name LIKE ? OR brand LIKE ?)", like(v), like(v))
	}
	var rows []models.VehicleModel
	if err := q.Order("sort_order ASC").Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取车型失败")
		return
	}
	views := h.enrichModels(rows)
	// In-memory sort for computed fields.
	switch c.DefaultQuery("sort", "recommended") {
	case "rent_asc":
		sort.Slice(views, func(i, j int) bool { return views[i].MonthlyRentCents < views[j].MonthlyRentCents })
	case "rent_desc":
		sort.Slice(views, func(i, j int) bool { return views[i].MonthlyRentCents > views[j].MonthlyRentCents })
	case "range_desc":
		sort.Slice(views, func(i, j int) bool { return views[i].RangeKm > views[j].RangeKm })
	case "utilization_desc":
		sort.Slice(views, func(i, j int) bool { return views[i].Utilization > views[j].Utilization })
	}
	ok(c, views)
}

func (h *Handler) ModelFilters(c *gin.Context) {
	var rows []models.VehicleModel
	h.DB.Where("status = ?", "active").Find(&rows)
	brands := map[string]bool{}
	bodyTypes := map[string]bool{}
	minRent, maxRent := int64(1<<62), int64(0)
	for _, m := range rows {
		brands[m.Brand] = true
		bodyTypes[m.BodyType] = true
		if m.MonthlyRentCents < minRent {
			minRent = m.MonthlyRentCents
		}
		if m.MonthlyRentCents > maxRent {
			maxRent = m.MonthlyRentCents
		}
	}
	brandList := make([]string, 0, len(brands))
	for b := range brands {
		brandList = append(brandList, b)
	}
	sort.Strings(brandList)
	bodyList := make([]string, 0, len(bodyTypes))
	for b := range bodyTypes {
		bodyList = append(bodyList, b)
	}
	sort.Strings(bodyList)
	ok(c, gin.H{"brands": brandList, "body_types": bodyList, "min_rent_cents": minRent, "max_rent_cents": maxRent})
}

func (h *Handler) ModelDetail(c *gin.Context) {
	var m models.VehicleModel
	if err := h.DB.Where("slug = ?", c.Param("slug")).First(&m).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "车型不存在")
		return
	}
	views := h.enrichModels([]models.VehicleModel{m})
	var vehicles []models.Vehicle
	h.DB.Preload("Store").Where("model_id = ?", m.ID).Order("status ASC, plate_no ASC").Find(&vehicles)
	var related []models.VehicleModel
	h.DB.Where("status = ? AND body_type = ? AND id <> ?", "active", m.BodyType, m.ID).Limit(3).Find(&related)
	relatedViews := h.enrichModels(related)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"model": views[0], "vehicles": vehicles, "related": relatedViews,
	}})
}

func (h *Handler) ModelVehicles(c *gin.Context) {
	var m models.VehicleModel
	if err := h.DB.Where("slug = ?", c.Param("slug")).First(&m).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "车型不存在")
		return
	}
	var vehicles []models.Vehicle
	h.DB.Preload("Store").Preload("Model").Where("model_id = ?", m.ID).Order("status ASC").Find(&vehicles)
	ok(c, vehicles)
}
