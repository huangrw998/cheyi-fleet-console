package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

func seedOperations(tx *gorm.DB, today time.Time, vehicles []models.Vehicle, drivers []models.Driver, stores []models.Store) error {
	d := func(n int) time.Time { return today.AddDate(0, 0, n) }
	// Maintenance orders.
	maintTypes := []string{"maintenance", "repair", "inspection"}
	maintStatuses := []string{"in_progress", "scheduled", "completed", "pending_acceptance", "completed", "scheduled", "in_progress", "completed"}
	vendors := []string{"驰驿自营维修中心", "途虎养车金桥店", "上海新能源汽修厂", "驰驿自营维修中心"}
	maint := make([]models.MaintenanceOrder, 0, 8)
	for i := 0; i < 8; i++ {
		v := vehicles[39+i]
		status := maintStatuses[i]
		scheduled := d(-14 + i*2)
		mo := models.MaintenanceOrder{
			OrderNo:     fmt.Sprintf("MT-2026-%04d", 3001+i),
			VehicleID:   v.ID,
			Type:        maintTypes[i%len(maintTypes)],
			Status:      status,
			ScheduledAt: scheduled,
			CostCents:   int64(320+i*180) * 100,
			Vendor:      vendors[i%len(vendors)],
			MileageKm:   v.MileageKm + 500,
			Description: []string{"常规保养，更换空调滤芯", "右前翼子板钣金修复", "年度安全检测", "更换轮胎与四轮定位"}[i%4],
		}
		if status == "completed" {
			t := scheduled.AddDate(0, 0, 1)
			if t.After(today) {
				t = today
			}
			mo.CompletedAt = &t
		}
		if status == "in_progress" || status == "scheduled" || status == "pending_acceptance" {
			tx.Model(&models.Vehicle{}).Where("id = ?", v.ID).Update("status", "maintenance")
		}
		maint = append(maint, mo)
	}
	if err := tx.Create(&maint).Error; err != nil {
		return err
	}

	// Insurance policies.
	providers := []string{"平安产险", "人保财险", "太保产险"}
	insurances := make([]models.InsurancePolicy, 0, 24)
	for i := 0; i < 24; i++ {
		v := vehicles[i]
		end := d(15 + i*9)
		status := "active"
		if end.Before(d(30)) {
			status = "expiring"
		}
		insurances = append(insurances, models.InsurancePolicy{
			VehicleID:    v.ID,
			Provider:     providers[i%len(providers)],
			PolicyNo:     fmt.Sprintf("PA2026%010d", 880000+i*137),
			Type:         []string{"交强险 + 商业险", "商业险", "交强险"}[i%3],
			PremiumCents: int64(3800+i*120) * 100,
			StartDate:    end.AddDate(-1, 0, 0),
			EndDate:      end,
			Status:       status,
		})
	}
	if err := tx.Create(&insurances).Error; err != nil {
		return err
	}

	// Violations.
	reasons := []string{"违停", "超速 10% 以内", "未礼让行人", "闯红灯", "占用公交车道"}
	violations := make([]models.Violation, 0, 12)
	for i := 0; i < 12; i++ {
		status := "pending"
		if i%3 == 0 {
			status = "handled"
		}
		violations = append(violations, models.Violation{
			VehicleID:  vehicles[i].ID,
			DriverID:   drivers[i].ID,
			OccurredAt: d(-5 - i*7),
			Location:   []string{"浦东新区金桥路", "闵行区莘庄立交", "嘉定区沪宜公路", "松江区文汇路"}[i%4],
			Reason:     reasons[i%len(reasons)],
			FineCents:  int64(100+i*20) * 100,
			Points:     i % 4,
			Status:     status,
			Note:       "",
		})
	}
	if err := tx.Create(&violations).Error; err != nil {
		return err
	}

	// Dispatch tasks.
	dispatch := make([]models.DispatchTask, 0, 6)
	for i := 0; i < 6; i++ {
		v := vehicles[33+i]
		from := stores[i%len(stores)]
		to := stores[(i+1)%len(stores)]
		status := []string{"pending", "in_transit", "completed", "pending", "completed", "in_transit"}[i]
		dt := models.DispatchTask{
			TaskNo:      fmt.Sprintf("DP-2026-%04d", 4001+i),
			VehicleID:   v.ID,
			FromStoreID: from.ID,
			ToStoreID:   to.ID,
			Status:      status,
			ScheduledAt: d(i),
			Note:        "门店运力平衡",
		}
		if status == "completed" {
			t := d(i)
			dt.CompletedAt = &t
			tx.Model(&models.Vehicle{}).Where("id = ?", v.ID).Updates(map[string]any{"store_id": to.ID, "status": "available"})
		} else {
			tx.Model(&models.Vehicle{}).Where("id = ?", v.ID).Update("status", "dispatch")
		}
		dispatch = append(dispatch, dt)
	}
	if err := tx.Create(&dispatch).Error; err != nil {
		return err
	}

	plans := []models.PricingPlan{
		{Name: "经济轿车月租", BodyType: "sedan", MonthlyRentCents: 358000, DepositCents: 800000, MinTermMonths: 3, Status: "active"},
		{Name: "舒适轿车月租", BodyType: "sedan", MonthlyRentCents: 458000, DepositCents: 1200000, MinTermMonths: 6, Status: "active"},
		{Name: "城市 SUV 月租", BodyType: "suv", MonthlyRentCents: 438000, DepositCents: 1000000, MinTermMonths: 6, Status: "active"},
		{Name: "网约 MPV 月租", BodyType: "mpv", MonthlyRentCents: 468000, DepositCents: 1200000, MinTermMonths: 6, Status: "active"},
	}
	if err := tx.Create(&plans).Error; err != nil {
		return err
	}

	settings := []models.Setting{
		{Key: "company_name", Value: "驰驿出行服务（上海）有限公司"},
		{Key: "company_contact", Value: "021-5888 7261"},
		{Key: "company_address", Value: "上海市浦东新区金桥路 1388 号"},
		{Key: "reminder_insurance_days", Value: "30"},
		{Key: "reminder_maintenance_km", Value: "5000"},
		{Key: "reminder_overdue_days", Value: "3"},
	}
	return tx.Create(&settings).Error
}
