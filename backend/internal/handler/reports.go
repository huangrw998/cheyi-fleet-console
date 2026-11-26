package handler

import (
	"sort"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) Reports(c *gin.Context) {
	from := daysFromNow(-29)
	to := today()
	if v := c.Query("from"); v != "" {
		if t, err := parseDate(v); err == nil {
			from = t
		}
	}
	if v := c.Query("to"); v != "" {
		if t, err := parseDate(v); err == nil {
			to = t
		}
	}
	if to.Before(from) {
		from, to = to, from
	}
	if to.Sub(from).Hours() > 24*366 {
		from = to.AddDate(0, 0, -366)
	}
	storeID, hasStore := queryUint(c, "store_id")

	var vehicles []models.Vehicle
	vq := h.DB.Preload("Model").Preload("Store")
	if hasStore {
		vq = vq.Where("store_id = ?", storeID)
	}
	vq.Find(&vehicles)
	totalVehicles := len(vehicles)
	vehicleIDs := map[uint]bool{}
	for _, v := range vehicles {
		vehicleIDs[v.ID] = true
	}
	var leases []models.Lease
	lq := h.DB.Preload("Vehicle").Preload("Vehicle.Model").Preload("Store")
	if hasStore {
		lq = lq.Where("store_id = ?", storeID)
	}
	lq.Find(&leases)

	// Daily utilization and run-rate.
	days := int(to.Sub(from).Hours()/24) + 1
	if days < 1 {
		days = 1
	}
	if days > 60 {
		days = 60
	}
	trend := make([]gin.H, 0, days)
	for i := 0; i < days; i++ {
		day := from.AddDate(0, 0, i)
		active := 0
		var runRate int64
		for _, l := range leases {
			if !l.StartDate.After(day) && !l.EndDate.Before(day) && l.Status != "cancelled" && l.Status != "pending_sign" {
				active++
				runRate += l.MonthlyRentCents / 30
			}
		}
		u := 0.0
		if totalVehicles > 0 {
			u = float64(active) / float64(totalVehicles) * 100
		}
		trend = append(trend, gin.H{"date": dateString(day), "utilization": u, "revenue_cents": runRate})
	}

	// Paid revenue by model.
	type revenueRow struct {
		Name    string
		Revenue int64
	}
	revMap := map[string]int64{}
	var bills []models.Bill
	bq := h.DB.Preload("Lease").Preload("Lease.Vehicle").Preload("Lease.Vehicle.Model").Where("status = ?", "paid")
	bq.Find(&bills)
	var totalRevenue int64
	for _, b := range bills {
		if b.PaidAt == nil || b.PaidAt.Before(from) || b.PaidAt.After(to.AddDate(0, 0, 1)) {
			continue
		}
		if hasStore && (b.Lease == nil || b.Lease.StoreID != storeID) {
			continue
		}
		totalRevenue += b.PaidAmountCents
		if b.Lease != nil && b.Lease.Vehicle != nil && b.Lease.Vehicle.Model != nil {
			revMap[b.Lease.Vehicle.Model.Name] += b.PaidAmountCents
		}
	}
	revRows := make([]revenueRow, 0, len(revMap))
	for k, v := range revMap {
		revRows = append(revRows, revenueRow{Name: k, Revenue: v})
	}
	sort.Slice(revRows, func(i, j int) bool { return revRows[i].Revenue > revRows[j].Revenue })
	revenueByModel := make([]gin.H, 0, len(revRows))
	for _, r := range revRows {
		revenueByModel = append(revenueByModel, gin.H{"name": r.Name, "revenue_cents": r.Revenue})
	}

	// Store ranking.
	var stores []models.Store
	h.DB.Order("id ASC").Find(&stores)
	storeRanking := make([]gin.H, 0, len(stores))
	for _, s := range stores {
		if hasStore && s.ID != storeID {
			continue
		}
		var storeRevenue int64
		for _, b := range bills {
			if b.PaidAt == nil || b.PaidAt.Before(from) || b.PaidAt.After(to.AddDate(0, 0, 1)) {
				continue
			}
			if b.Lease != nil && b.Lease.StoreID == s.ID {
				storeRevenue += b.PaidAmountCents
			}
		}
		active, total := 0, 0
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
		storeRanking = append(storeRanking, gin.H{
			"id": s.ID, "name": s.Name, "district": s.District, "capacity": s.Capacity,
			"vehicles": total, "active": active, "utilization": u, "revenue_cents": storeRevenue,
		})
	}
	sort.Slice(storeRanking, func(i, j int) bool {
		return storeRanking[i]["revenue_cents"].(int64) > storeRanking[j]["revenue_cents"].(int64)
	})

	// Maintenance cost.
	var maintenanceCost int64
	mq := h.DB.Model(&models.MaintenanceOrder{}).Where("status = ?", "completed").Where("scheduled_at BETWEEN ? AND ?", from, to)
	if hasStore {
		mq = mq.Joins("LEFT JOIN vehicles ON vehicles.id = maintenance_orders.vehicle_id").Where("vehicles.store_id = ?", storeID)
	}
	mq.Select("COALESCE(SUM(cost_cents), 0)").Scan(&maintenanceCost)

	var totalBills, overdueBills int64
	bq2 := h.DB.Model(&models.Bill{})
	if hasStore {
		bq2 = bq2.Joins("LEFT JOIN leases ON leases.id = bills.lease_id").Where("leases.store_id = ?", storeID)
	}
	bq2.Count(&totalBills)
	bq3 := h.DB.Model(&models.Bill{}).Where("status = ? OR (status = ? AND due_date < ?)", "overdue", "pending", today())
	if hasStore {
		bq3 = bq3.Joins("LEFT JOIN leases ON leases.id = bills.lease_id").Where("leases.store_id = ?", storeID)
	}
	bq3.Count(&overdueBills)
	overdueRate := 0.0
	if totalBills > 0 {
		overdueRate = float64(overdueBills) / float64(totalBills) * 100
	}

	avgRevenue := int64(0)
	if totalVehicles > 0 {
		avgRevenue = totalRevenue / int64(totalVehicles)
	}
	utilization := 0.0
	if len(trend) > 0 {
		for _, p := range trend {
			utilization += p["utilization"].(float64)
		}
		utilization /= float64(len(trend))
	}
	ok(c, gin.H{
		"range": gin.H{"from": dateString(from), "to": dateString(to)},
		"kpis": gin.H{
			"utilization": utilization, "revenue_cents": totalRevenue,
			"avg_revenue_cents": avgRevenue, "overdue_rate": overdueRate,
			"maintenance_cost_cents": maintenanceCost, "total_vehicles": totalVehicles,
		},
		"trend": trend, "revenue_by_model": revenueByModel, "store_ranking": storeRanking,
	})
}
