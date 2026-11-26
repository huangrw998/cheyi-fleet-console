package models

import "time"

type Driver struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	Name             string    `json:"name" gorm:"size:60;not null"`
	Phone            string    `json:"phone" gorm:"size:30;index;not null"`
	IDCardNo         string    `json:"id_card_no" gorm:"size:40"`
	LicenseNo        string    `json:"license_no" gorm:"size:40"`
	LicenseExpiry    time.Time `json:"license_expiry"`
	Status           string    `json:"status" gorm:"size:30;index;default:pending"`
	Rating           float64   `json:"rating"`
	JoinedAt         time.Time `json:"joined_at"`
	EmergencyContact string    `json:"emergency_contact" gorm:"size:80"`
	Note             string    `json:"note" gorm:"size:255"`
	CreatedAt        time.Time `json:"created_at"`
}
