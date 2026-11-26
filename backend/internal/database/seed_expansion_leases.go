package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

type guangzhouLeaseSpec struct {
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

func seedGuangzhouLeases(tx *gorm.DB, today time.Time, vehicles []models.Vehicle, drivers []models.Driver, modelRows []models.VehicleModel) error {
	d := func(n int) time.Time { return today.AddDate(0, 0, n) }
	specs := make([]guangzhouLeaseSpec, 0, 19)
	for i := 0; i < 10; i++ {
		specs = append(specs, guangzhouLeaseSpec{vehicleIdx: i, driverIdx: i, status: "active", start: d(-22 - i*3), end: d(58 + i*5), pickup: 14000 + i*731, signed: true, note: "广州正常在租"})
	}
	for i := 0; i < 4; i++ {
		specs = append(specs, guangzhouLeaseSpec{vehicleIdx: 10 + i, driverIdx: 10 + i, status: "pending_pickup", start: d(1 + i), end: d(181 + i*10), signed: true, note: "广州已签约，等待交车"})
	}
	for i := 0; i < 2; i++ {
		specs = append(specs, guangzhouLeaseSpec{vehicleIdx: 14 + i, driverIdx: 14 + i, status: "pending_sign", start: d(4 + i), end: d(184 + i*10), note: "广州等待司机签约"})
	}
	for i := 0; i < 3; i++ {
		specs = append(specs, guangzhouLeaseSpec{vehicleIdx: 16 + i, driverIdx: 16 + i, status: "returned", start: d(-210 - i*12), end: d(-35 - i*5), pickup: 24000 + i*1700, signed: true, closed: true, note: "广州已退租并结算"})
	}

	leases := make([]models.Lease, 0, len(specs))
	for i, s := range specs {
		v := vehicles[s.vehicleIdx]
		model := modelRows[v.ModelID-1]
		l := models.Lease{
			LeaseNo: fmt.Sprintf("CY-2026-%04d", 2001+i), DriverID: drivers[s.driverIdx].ID,
			VehicleID: v.ID, StoreID: v.StoreID, StartDate: s.start, EndDate: s.end,
			MonthlyRentCents: model.MonthlyRentCents, DepositCents: model.DepositCents,
			Status: s.status, PickupMileage: s.pickup, Note: s.note,
		}
		if s.signed {
			t := s.start.AddDate(0, 0, -3)
			l.SignedAt = &t
		}
		if s.closed {
			t := s.end
			l.ClosedAt = &t
			l.ReturnMileage = s.pickup + 26000
		}
		leases = append(leases, l)
	}
	if err := tx.Create(&leases).Error; err != nil {
		return err
	}

	events := make([]models.LeaseEvent, 0, len(leases)*3)
	for i, s := range specs {
		l := leases[i]
		events = append(events, models.LeaseEvent{LeaseID: l.ID, Type: "created", Note: "租约创建", CreatedAt: l.StartDate.AddDate(0, 0, -3)})
		if l.SignedAt != nil {
			events = append(events, models.LeaseEvent{LeaseID: l.ID, Type: "signed", Note: "司机完成签约", CreatedAt: *l.SignedAt})
		}
		switch s.status {
		case "active":
			events = append(events, models.LeaseEvent{LeaseID: l.ID, Type: "handover", Note: "车辆已交付", CreatedAt: l.StartDate})
		case "returned":
			events = append(events, models.LeaseEvent{LeaseID: l.ID, Type: "handover", Note: "车辆已交付", CreatedAt: l.StartDate})
			events = append(events, models.LeaseEvent{LeaseID: l.ID, Type: "returned", Note: "车辆已退回并结算", CreatedAt: *l.ClosedAt})
		}
	}
	if err := tx.Create(&events).Error; err != nil {
		return err
	}

	bills := make([]models.Bill, 0, len(leases)*3)
	billSeq := 1001
	newBill := func(l models.Lease, typ string, due time.Time, amount int64, status string) {
		b := models.Bill{BillNo: fmt.Sprintf("BILL-2026-%04d", billSeq), LeaseID: l.ID, Type: typ, PeriodStart: due, PeriodEnd: due.AddDate(0, 1, 0), AmountCents: amount, DueDate: due, Status: status}
		billSeq++
		if status == "paid" {
			t := due.AddDate(0, 0, -2)
			b.PaidAt = &t
			b.PaidAmountCents = amount
			b.Method = "bank"
		}
		bills = append(bills, b)
	}
	for i, s := range specs {
		l := leases[i]
		switch s.status {
		case "active":
			newBill(l, "deposit", l.StartDate, l.DepositCents, "paid")
			newBill(l, "rent", l.StartDate, l.MonthlyRentCents, "paid")
			newBill(l, "rent", d(3+i), l.MonthlyRentCents, "pending")
		case "pending_pickup", "pending_sign":
			newBill(l, "rent", l.StartDate, l.MonthlyRentCents, "pending")
		case "returned":
			newBill(l, "deposit", l.StartDate, l.DepositCents, "paid")
			newBill(l, "rent", l.StartDate, l.MonthlyRentCents, "paid")
		}
	}
	if err := tx.Create(&bills).Error; err != nil {
		return err
	}

	for i, s := range specs {
		l := leases[i]
		v := vehicles[s.vehicleIdx]
		switch s.status {
		case "active":
			if err := tx.Model(&models.Vehicle{}).Where("id = ?", l.VehicleID).Updates(map[string]any{"status": "rented", "mileage_km": s.pickup + 16000}).Error; err != nil {
				return err
			}
			if err := tx.Model(&models.Driver{}).Where("id = ?", l.DriverID).Update("status", "leased").Error; err != nil {
				return err
			}
		case "pending_pickup", "pending_sign":
			if err := tx.Model(&models.Vehicle{}).Where("id = ?", v.ID).Update("status", "reserved").Error; err != nil {
				return err
			}
		case "returned":
			if err := tx.Model(&models.Vehicle{}).Where("id = ?", l.VehicleID).Updates(map[string]any{"status": "available", "mileage_km": s.pickup + 26000}).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
