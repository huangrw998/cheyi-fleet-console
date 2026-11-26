package handler

import (
	"sort"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) Dashboard(c *gin.Context) {
	t := today()
	var vehicles []models.Vehicle
	h.DB.Preload("Model").Preload("Store").Find(&vehicles)
	var leases []models.Lease
	h.DB.Preload("Driver").Preload("Vehicle").Preload("Vehicle.Model").Preload("Store").Find(&leases)

	var activeLeases []models.Lease
	for _, l := range leases {
		if l.Status == "active" {
			activeLeases = append(activeLeases, l)
		}
	}
	var totalVehicles = len(vehicles)
	utilization := 0.0
	if totalVehicles > 0 {
		utilization = float64(len(activeLeases)) / float64(totalVehicles) * 100
	}

	var unpaidCents int64
	var overdueCount int64
	h.DB.Model(&models.Bill{}).
		Where("status IN ?", []string{"pending", "overdue"}).
		Where("(status = ? OR due_date < ?)", "overdue", t).
		Count(&overdueCount)
	monthEnd := time.Date(t.Year(), t.Month()+1, 1, 0, 0, 0, 0, t.Location())
	h.DB.Model(&models.Bill{}).
		Where("status IN ?", []string{"pending", "overdue"}).
		Where("due_date < ?", monthEnd).
		Select("COALESCE(SUM(amount_cents - paid_amount_cents), 0)").Scan(&unpaidCents)

	fleetCounts := map[string]int{}
	for _, v := range vehicles {
		fleetCounts[v.Status]++
	}
	fleetStatus := []gin.H{}
	for _, s := range []string{"rented", "available", "reserved", "maintenance", "dispatch"} {
		fleetStatus = append(fleetStatus, gin.H{"status": s, "label": statusLabel(s), "count": fleetCounts[s]})
	}

	modelByID := map[uint]models.VehicleModel{}
	for _, v := range vehicles {
		if v.Model != nil {
			modelByID[v.ModelID] = *v.Model
		}
	}
	bodyCounts := map[string]int{}
	for _, v := range vehicles {
		if v.Model != nil {
			bodyCounts[v.Model.BodyType]++
		}
	}
	bodyLabels := map[string]string{"sedan": "轿车", "suv": "SUV", "mpv": "MPV", "hatchback": "两厢", "wagon": "旅行车"}
	bodyMix := []gin.H{}
	for _, bt := range []string{"sedan", "suv", "mpv", "hatchback", "wagon"} {
		cnt := bodyCounts[bt]
		pct := 0.0
		if totalVehicles > 0 {
			pct = float64(cnt) / float64(totalVehicles) * 100
		}
		bodyMix = append(bodyMix, gin.H{"body_type": bt, "label": bodyLabels[bt], "count": cnt, "percent": pct})
	}

	// Revenue run-rate and utilization over 30 days.
	trend := make([]gin.H, 0, 30)
	for i := 29; i >= 0; i-- {
		day := t.AddDate(0, 0, -i)
		var activeOnDay int
		var dailyCents int64
		for _, l := range leases {
			if !l.StartDate.After(day) && !l.EndDate.Before(day) && l.Status != "cancelled" && l.Status != "pending_sign" {
				activeOnDay++
				dailyCents += l.MonthlyRentCents / 30
			}
		}
		u := 0.0
		if totalVehicles > 0 {
			u = float64(activeOnDay) / float64(totalVehicles) * 100
		}
		trend = append(trend, gin.H{"date": dateString(day), "revenue_cents": dailyCents, "utilization": u})
	}

	// Handovers.
	handovers := []gin.H{}
	for _, l := range leases {
		if l.Status == "pending_pickup" && dateString(l.StartDate) == dateString(t) {
			handovers = append(handovers, gin.H{
				"id": l.ID, "type": "pickup", "time": "09:30", "date": dateString(l.StartDate),
				"driver": l.Driver, "vehicle": l.Vehicle, "store": l.Store,
			})
		}
		if l.Status == "active" && dateString(l.EndDate) == dateString(t) {
			handovers = append(handovers, gin.H{
				"id": l.ID, "type": "return", "time": "14:00", "date": dateString(l.EndDate),
				"driver": l.Driver, "vehicle": l.Vehicle, "store": l.Store,
			})
		}
	}
	sort.Slice(handovers, func(i, j int) bool {
		return handovers[i]["date"].(string) < handovers[j]["date"].(string)
	})
	if len(handovers) > 5 {
		handovers = handovers[:5]
	}

	alerts := buildAlerts(h.DB, t, leases)
	recent, featured, storeStats := buildInsights(h.DB, vehicles, activeLeases)

	ok(c, gin.H{
		"kpis": gin.H{
			"active_leases": len(activeLeases), "total_vehicles": totalVehicles,
			"available_vehicles": fleetCounts["available"], "maintenance_vehicles": fleetCounts["maintenance"],
			"overdue_bills": overdueCount, "monthly_receivable_cents": unpaidCents,
			"utilization": utilization,
		},
		"revenue_trend": trend, "fleet_status": fleetStatus, "body_type_mix": bodyMix,
		"handovers": handovers, "alerts": alerts, "recent_leases": recent,
		"featured_models": featured, "stores": storeStats,
		"month_label": time.Now().Format("2006年01月"),
	})
}
