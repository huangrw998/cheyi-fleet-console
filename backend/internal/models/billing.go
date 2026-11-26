package models

import "time"

type Bill struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	BillNo          string     `json:"bill_no" gorm:"size:40;uniqueIndex;not null"`
	LeaseID         uint       `json:"lease_id" gorm:"index;not null"`
	Lease           *Lease     `json:"lease,omitempty" gorm:"foreignKey:LeaseID"`
	Type            string     `json:"type" gorm:"size:30;index;not null"`
	PeriodStart     time.Time  `json:"period_start"`
	PeriodEnd       time.Time  `json:"period_end"`
	AmountCents     int64      `json:"amount_cents"`
	PaidAmountCents int64      `json:"paid_amount_cents"`
	DueDate         time.Time  `json:"due_date"`
	Status          string     `json:"status" gorm:"size:30;index;not null"`
	PaidAt          *time.Time `json:"paid_at,omitempty"`
	Method          string     `json:"method" gorm:"size:30"`
	Note            string     `json:"note" gorm:"size:255"`
	CreatedAt       time.Time  `json:"created_at"`
}
