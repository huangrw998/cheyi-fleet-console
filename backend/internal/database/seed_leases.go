package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

func seedLeases(tx *gorm.DB, today time.Time, vehicles []models.Vehicle, drivers []models.Driver, modelRows []models.VehicleModel) ([]models.Lease, error) {
	d := func(n int) time.Time { return today.AddDate(0, 0, n) }
	type leaseSpec struct {
		vehicleIdx int
		driverIdx  int
		status     string
		start      time.Time
		end        time.Time
		pickup     int
		signed     bool
		closed     bool
		note       string
	}
	specs := make([]leaseSpec, 0, 39)
	// Active leases.
	for i := 0; i < 20; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: i, driverIdx: i, status: "active",
			start: d(-32 - i*2), end: d(58 + i*5), pickup: 12000 + i*431,
			signed: true, note: "正常在租",
		})
	}
	// Overdue leases.
	for i := 0; i < 3; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: 20 + i, driverIdx: 20 + i, status: "active",
			start: d(-150 - i*10), end: d(-12 - i*6), pickup: 34000 + i*2300,
			signed: true, note: "租约已到期，待退租",
		})
	}
	// Pending pickup.
	for i := 0; i < 4; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: 23 + i, driverIdx: 23 + i, status: "pending_pickup",
			start: d(i % 2), end: d(180 + i*10), pickup: 0,
			signed: true, note: "已签约，等待交车",
		})
	}
	// Pending sign.
	for i := 0; i < 6; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: 27 + i, driverIdx: 27 + i, status: "pending_sign",
			start: d(3 + i), end: d(183 + i*10), pickup: 0,
			signed: false, note: "等待司机签约",
		})
	}
	// Returned.
	for i := 0; i < 4; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: 33 + i, driverIdx: i, status: "returned",
			start: d(-220 - i*15), end: d(-40 - i*5), pickup: 21000 + i*1900,
			signed: true, closed: true, note: "已退租并完成结算",
		})
	}
	// Cancelled.
	for i := 0; i < 2; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: 37 + i, driverIdx: 4 + i, status: "cancelled",
			start: d(12 + i*5), end: d(192 + i*5), pickup: 0,
			signed: false, note: "司机取消",
		})
	}

	// Additional active leases to keep the fleet balanced.
	for i := 0; i < 5; i++ {
		specs = append(specs, leaseSpec{
			vehicleIdx: 47 + i, driverIdx: 33 + i, status: "active",
			start: d(-20 - i*2), end: d(70 + i*5), pickup: 18000 + i*1200,
			signed: true, note: "正常在租",
		})
	}

	leases := make([]models.Lease, 0, len(specs))
	for i, s := range specs {
		v := vehicles[s.vehicleIdx]
		drv := drivers[s.driverIdx]
		model := modelRows[v.ModelID-1]
		l := models.Lease{
			LeaseNo:          fmt.Sprintf("CY-2026-%04d", 1001+i),
			DriverID:         drv.ID,
			VehicleID:        v.ID,
			StoreID:          v.StoreID,
			StartDate:        s.start,
			EndDate:          s.end,
			MonthlyRentCents: model.MonthlyRentCents,
			DepositCents:     model.DepositCents,
			Status:           s.status,
			PickupMileage:    s.pickup,
			Note:             s.note,
		}
		if s.signed {
			t := s.start.AddDate(0, 0, -3)
			l.SignedAt = &t
		}
		if s.closed {
			t := s.end
			l.ClosedAt = &t
			l.ReturnMileage = s.pickup + 28000
		}
		if s.status == "active" && s.pickup > 0 {
			l.PickupMileage = s.pickup
		}
		leases = append(leases, l)
	}
	if err := tx.Create(&leases).Error; err != nil {
		return nil, err
	}

	// Apply vehicle and driver statuses from leases.
	for i, s := range specs {
		l := leases[i]
		switch s.status {
		case "active":
			tx.Model(&models.Vehicle{}).Where("id = ?", l.VehicleID).Update("status", "rented")
			tx.Model(&models.Vehicle{}).Where("id = ?", l.VehicleID).Update("mileage_km", s.pickup+16000)
			tx.Model(&models.Driver{}).Where("id = ?", l.DriverID).Update("status", "leased")
		case "pending_pickup":
			tx.Model(&models.Vehicle{}).Where("id = ?", l.VehicleID).Update("status", "reserved")
		case "pending_sign":
			tx.Model(&models.Vehicle{}).Where("id = ?", l.VehicleID).Update("status", "reserved")
		}
	}

	// Lease events.
	eventRows := make([]models.LeaseEvent, 0, len(leases)*3)
	for _, l := range leases {
		eventRows = append(eventRows, models.LeaseEvent{LeaseID: l.ID, Type: "created", Note: "租约创建", CreatedAt: l.CreatedAt.Add(-72 * time.Hour)})
		if l.SignedAt != nil {
			eventRows = append(eventRows, models.LeaseEvent{LeaseID: l.ID, Type: "signed", Note: "司机完成签约", CreatedAt: *l.SignedAt})
		}
		switch l.Status {
		case "active":
			eventRows = append(eventRows, models.LeaseEvent{LeaseID: l.ID, Type: "handover", Note: "车辆已交付", CreatedAt: l.StartDate})
		case "returned":
			eventRows = append(eventRows, models.LeaseEvent{LeaseID: l.ID, Type: "handover", Note: "车辆已交付", CreatedAt: l.StartDate})
			eventRows = append(eventRows, models.LeaseEvent{LeaseID: l.ID, Type: "returned", Note: "车辆已退回并结算", CreatedAt: *l.ClosedAt})
		case "cancelled":
			eventRows = append(eventRows, models.LeaseEvent{LeaseID: l.ID, Type: "cancelled", Note: "租约取消", CreatedAt: l.StartDate.AddDate(0, 0, -1)})
		}
	}
	if err := tx.Create(&eventRows).Error; err != nil {
		return nil, err
	}

	return leases, nil
}
