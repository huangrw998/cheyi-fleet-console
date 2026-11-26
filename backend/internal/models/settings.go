package models

import "time"

type PricingPlan struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	Name             string    `json:"name" gorm:"size:80"`
	BodyType         string    `json:"body_type" gorm:"size:30"`
	MonthlyRentCents int64     `json:"monthly_rent_cents"`
	DepositCents     int64     `json:"deposit_cents"`
	MinTermMonths    int       `json:"min_term_months"`
	Status           string    `json:"status" gorm:"size:30"`
	CreatedAt        time.Time `json:"created_at"`
}

type Setting struct {
	Key   string `json:"key" gorm:"primaryKey;size:80"`
	Value string `json:"value" gorm:"size:255"`
}
