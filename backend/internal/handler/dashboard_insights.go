package handler

import (
	"sort"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func buildInsights(db *gorm.DB, vehicles []models.Vehicle, activeLeases []models.Lease) ([]models.Lease, []gin.H, []gin.H) {
	// Recent leases.
	var recent []models.Lease
	db.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").
		Order("created_at DESC").Limit(6).Find(&recent)

	// Featured models.
	totalByModel := map[uint]int{}
	for _, v := range vehicles {
		totalByModel[v.ModelID]++
	}
	activeCountByModel := map[uint]int{}
	availableByModel := map[uint]int{}
	for _, l := range activeLeases {
		activeCountByModel[l.Vehicle.ModelID]++
	}
	for _, v := range vehicles {
		if v.Status == "available" {
			availableByModel[v.ModelID]++
		}
	}
	var modelRows []models.VehicleModel
	db.Where("status = ?", "active").Order("sort_order ASC").Find(&modelRows)
	featured := make([]gin.H, 0, len(modelRows))
	for _, m := range modelRows {
		total := totalByModel[m.ID]
		active := activeCountByModel[m.ID]
		u := 0.0
		if total > 0 {
			u = float64(active) / float64(total) * 100
		}
		featured = append(featured, gin.H{
			"id": m.ID, "slug": m.Slug, "brand": m.Brand, "name": m.Name, "body_type": m.BodyType,
			"hero_image": m.HeroImage, "range_km": m.RangeKm, "monthly_rent_cents": m.MonthlyRentCents,
			"fleet_total": total, "fleet_active": active, "available_count": availableByModel[m.ID], "utilization": u, "model_3d_key": m.Model3DKey,
		})
	}
	sort.Slice(featured, func(i, j int) bool {
		return featured[i]["fleet_active"].(int) > featured[j]["fleet_active"].(int)
	})
	if len(featured) > 4 {
		featured = featured[:4]
	}

	// Stores.
	var storeRows []models.Store
	db.Order("id ASC").Find(&storeRows)
	storeStats := make([]gin.H, 0, len(storeRows))
	for _, s := range storeRows {
		total, active := 0, 0
		for _, v := range vehicles {
			if v.StoreID == s.ID {
				total++
				if v.Status == "rented" {
					active++
				}
			}
		}
		u := 0.0
		if s.Capacity > 0 {
			u = float64(active) / float64(s.Capacity) * 100
		}
		storeStats = append(storeStats, gin.H{
			"id": s.ID, "name": s.Name, "district": s.District, "address": s.Address,
			"capacity": s.Capacity, "image": s.Image, "total": total, "active": active, "utilization": u,
		})
	}
	return recent, featured, storeStats
}
