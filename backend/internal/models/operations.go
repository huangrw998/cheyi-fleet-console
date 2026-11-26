package models

import "time"

type MaintenanceOrder struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	OrderNo     string     `json:"order_no" gorm:"size:40;uniqueIndex;not null"`
	VehicleID   uint       `json:"vehicle_id" gorm:"index;not null"`
	Vehicle     *Vehicle   `json:"vehicle,omitempty" gorm:"foreignKey:VehicleID"`
	Type        string     `json:"type" gorm:"size:30;not null"`
	Status      string     `json:"status" gorm:"size:30;index;not null"`
	ScheduledAt time.Time  `json:"scheduled_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CostCents   int64      `json:"cost_cents"`
	Vendor      string     `json:"vendor" gorm:"size:100"`
	MileageKm   int        `json:"mileage_km"`
	Description string     `json:"description" gorm:"size:255"`
	CreatedAt   time.Time  `json:"created_at"`
}

type InsurancePolicy struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	VehicleID    uint      `json:"vehicle_id" gorm:"index;not null"`
	Vehicle      *Vehicle  `json:"vehicle,omitempty" gorm:"foreignKey:VehicleID"`
	Provider     string    `json:"provider" gorm:"size:80"`
	PolicyNo     string    `json:"policy_no" gorm:"size:60"`
	Type         string    `json:"type" gorm:"size:40"`
	PremiumCents int64     `json:"premium_cents"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	Status       string    `json:"status" gorm:"size:30"`
	CreatedAt    time.Time `json:"created_at"`
}

type Violation struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	VehicleID  uint       `json:"vehicle_id" gorm:"index;not null"`
	Vehicle    *Vehicle   `json:"vehicle,omitempty" gorm:"foreignKey:VehicleID"`
	DriverID   uint       `json:"driver_id" gorm:"index"`
	Driver     *Driver    `json:"driver,omitempty" gorm:"foreignKey:DriverID"`
	OccurredAt time.Time  `json:"occurred_at"`
	Location   string     `json:"location" gorm:"size:120"`
	Reason     string     `json:"reason" gorm:"size:160"`
	FineCents  int64      `json:"fine_cents"`
	Points     int        `json:"points"`
	Status     string     `json:"status" gorm:"size:30;index"`
	HandledAt  *time.Time `json:"handled_at,omitempty"`
	Note       string     `json:"note" gorm:"size:255"`
	CreatedAt  time.Time  `json:"created_at"`
}

type DispatchTask struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	TaskNo      string     `json:"task_no" gorm:"size:40;uniqueIndex;not null"`
	VehicleID   uint       `json:"vehicle_id" gorm:"index;not null"`
	Vehicle     *Vehicle   `json:"vehicle,omitempty" gorm:"foreignKey:VehicleID"`
	FromStoreID uint       `json:"from_store_id" gorm:"index"`
	FromStore   *Store     `json:"from_store,omitempty" gorm:"foreignKey:FromStoreID"`
	ToStoreID   uint       `json:"to_store_id" gorm:"index"`
	ToStore     *Store     `json:"to_store,omitempty" gorm:"foreignKey:ToStoreID"`
	Status      string     `json:"status" gorm:"size:30;index"`
	ScheduledAt time.Time  `json:"scheduled_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	Note        string     `json:"note" gorm:"size:255"`
	CreatedAt   time.Time  `json:"created_at"`
}
