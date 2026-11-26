package models

import "time"

type Lease struct {
	ID               uint         `json:"id" gorm:"primaryKey"`
	LeaseNo          string       `json:"lease_no" gorm:"size:40;uniqueIndex;not null"`
	DriverID         uint         `json:"driver_id" gorm:"index;not null"`
	Driver           *Driver      `json:"driver,omitempty" gorm:"foreignKey:DriverID"`
	VehicleID        uint         `json:"vehicle_id" gorm:"index;not null"`
	Vehicle          *Vehicle     `json:"vehicle,omitempty" gorm:"foreignKey:VehicleID"`
	StoreID          uint         `json:"store_id" gorm:"index;not null"`
	Store            *Store       `json:"store,omitempty" gorm:"foreignKey:StoreID"`
	StartDate        time.Time    `json:"start_date"`
	EndDate          time.Time    `json:"end_date"`
	MonthlyRentCents int64        `json:"monthly_rent_cents"`
	DepositCents     int64        `json:"deposit_cents"`
	Status           string       `json:"status" gorm:"size:30;index;not null"`
	PickupMileage    int          `json:"pickup_mileage"`
	ReturnMileage    int          `json:"return_mileage"`
	SignedAt         *time.Time   `json:"signed_at,omitempty"`
	ClosedAt         *time.Time   `json:"closed_at,omitempty"`
	Note             string       `json:"note" gorm:"size:255"`
	CreatedAt        time.Time    `json:"created_at"`
	Bills            []Bill       `json:"bills,omitempty" gorm:"foreignKey:LeaseID"`
	Events           []LeaseEvent `json:"events,omitempty" gorm:"foreignKey:LeaseID"`
}

type LeaseEvent struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	LeaseID   uint      `json:"lease_id" gorm:"index"`
	Type      string    `json:"type" gorm:"size:40"`
	Note      string    `json:"note" gorm:"size:255"`
	CreatedAt time.Time `json:"created_at"`
}
