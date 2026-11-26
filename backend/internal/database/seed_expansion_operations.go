package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

func seedGuangzhouOperations(tx *gorm.DB, today time.Time, vehicles []models.Vehicle, drivers []models.Driver, stores []models.Store) error {
	d := func(n int) time.Time { return today.AddDate(0, 0, n) }
	providers := []string{"平安产险", "人保财险", "太保产险"}
	insurances := make([]models.InsurancePolicy, 0, len(vehicles))
	for i, v := range vehicles {
		end := d(20 + i*9)
		status := "active"
		if end.Before(d(30)) {
			status = "expiring"
		}
		insurances = append(insurances, models.InsurancePolicy{
			VehicleID: v.ID, Provider: providers[i%len(providers)], PolicyNo: fmt.Sprintf("GZ2026%010d", 900000+i*137),
			Type: []string{"交强险 + 商业险", "商业险", "交强险"}[i%3], PremiumCents: int64(4000+i*110) * 100,
			StartDate: end.AddDate(-1, 0, 0), EndDate: end, Status: status,
		})
	}
	if err := tx.Create(&insurances).Error; err != nil {
		return err
	}

	completedAt := d(-17)
	maintenance := []models.MaintenanceOrder{
		{OrderNo: "MT-2026-3101", VehicleID: vehicles[19].ID, Type: "maintenance", Status: "in_progress", ScheduledAt: d(-2), CostCents: 68000, Vendor: "广州驰驿维修中心", MileageKm: vehicles[19].MileageKm + 500, Description: "广州车辆常规保养"},
		{OrderNo: "MT-2026-3102", VehicleID: vehicles[16].ID, Type: "inspection", Status: "completed", ScheduledAt: d(-18), CompletedAt: &completedAt, CostCents: 52000, Vendor: "广州番禺检测站", MileageKm: vehicles[16].MileageKm + 1200, Description: "年检与安全检测"},
	}
	if err := tx.Create(&maintenance).Error; err != nil {
		return err
	}
	if err := tx.Model(&models.Vehicle{}).Where("id = ?", vehicles[19].ID).Update("status", "maintenance").Error; err != nil {
		return err
	}

	violations := make([]models.Violation, 0, 4)
	for i := 0; i < 4; i++ {
		status := "pending"
		if i == 3 {
			status = "handled"
		}
		violations = append(violations, models.Violation{
			VehicleID: vehicles[i].ID, DriverID: drivers[i].ID, OccurredAt: d(-4 - i*6),
			Location:  []string{"天河区黄埔大道", "白云区机场路", "番禺区迎宾路", "海珠区新港路"}[i],
			Reason:    []string{"违停", "超速 10% 以内", "未礼让行人", "占用公交车道"}[i],
			FineCents: int64(120+i*30) * 100, Points: i % 4, Status: status, Note: "广州运营记录",
		})
	}
	if err := tx.Create(&violations).Error; err != nil {
		return err
	}

	completed := d(-3)
	dispatch := []models.DispatchTask{
		{TaskNo: "DP-2026-4101", VehicleID: vehicles[16].ID, FromStoreID: stores[1].ID, ToStoreID: stores[0].ID, Status: "completed", ScheduledAt: d(-4), CompletedAt: &completed, Note: "广州门店运力平衡"},
		{TaskNo: "DP-2026-4102", VehicleID: vehicles[20].ID, FromStoreID: stores[2].ID, ToStoreID: stores[1].ID, Status: "in_transit", ScheduledAt: d(1), Note: "广州门店运力平衡"},
	}
	if err := tx.Create(&dispatch).Error; err != nil {
		return err
	}
	if err := tx.Model(&models.Vehicle{}).Where("id = ?", vehicles[16].ID).Updates(map[string]any{"store_id": stores[0].ID, "status": "available"}).Error; err != nil {
		return err
	}
	return tx.Model(&models.Vehicle{}).Where("id = ?", vehicles[20].ID).Update("status", "dispatch").Error
}
