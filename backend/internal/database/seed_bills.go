package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

func seedBills(tx *gorm.DB, today time.Time, leases []models.Lease) error {
	d := func(n int) time.Time { return today.AddDate(0, 0, n) }
	bills := make([]models.Bill, 0, len(leases)*3)
	billSeq := 1
	newBill := func(l models.Lease, typ string, periodStart, due time.Time, amount int64, status string) models.Bill {
		b := models.Bill{
			BillNo:      fmt.Sprintf("BILL-2026-%04d", billSeq),
			LeaseID:     l.ID,
			Type:        typ,
			PeriodStart: periodStart,
			PeriodEnd:   periodStart.AddDate(0, 1, 0),
			AmountCents: amount,
			DueDate:     due,
			Status:      status,
		}
		billSeq++
		if status == "paid" {
			t := due.AddDate(0, 0, -2)
			if typ == "rent" && l.Status == "active" {
				t = today.AddDate(0, 0, -3-int(l.ID)%20)
			}
			b.PaidAt = &t
			b.PaidAmountCents = amount
			b.Method = "bank"
		}
		return b
	}
	for _, l := range leases {
		switch l.Status {
		case "active":
			firstDue := l.StartDate
			bills = append(bills, newBill(l, "deposit", firstDue, firstDue, l.DepositCents, "paid"))
			bills = append(bills, newBill(l, "rent", firstDue, firstDue, l.MonthlyRentCents, "paid"))
			secondDue := l.StartDate.AddDate(0, 1, 0)
			status := "pending"
			if l.EndDate.Before(today) {
				status = "overdue"
			} else if secondDue.Before(today) {
				secondDue = d(5 + int(l.ID)%10)
			}
			bills = append(bills, newBill(l, "rent", secondDue, secondDue, l.MonthlyRentCents, status))
		case "pending_pickup", "pending_sign":
			bills = append(bills, newBill(l, "rent", l.StartDate, l.StartDate, l.MonthlyRentCents, "pending"))
		case "returned":
			bills = append(bills, newBill(l, "rent", l.StartDate, l.StartDate, l.MonthlyRentCents, "paid"))
		}
	}
	// Add a few violation bills.
	for i := 0; i < 4; i++ {
		bills = append(bills, models.Bill{
			BillNo: fmt.Sprintf("BILL-2026-%04d", billSeq), LeaseID: leases[i].ID,
			Type: "violation", PeriodStart: d(-10), PeriodEnd: d(-10),
			AmountCents: int64(100+i*50) * 100, DueDate: d(5), Status: "pending",
		})
		billSeq++
	}
	if err := tx.Create(&bills).Error; err != nil {
		return err
	}
	return nil
}
