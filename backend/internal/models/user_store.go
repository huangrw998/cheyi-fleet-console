package models

import "time"

type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name" gorm:"size:80;not null"`
	PasswordHash string    `json:"-" gorm:"size:255;not null"`
	Role         string    `json:"role" gorm:"size:40;not null;default:admin"`
	Phone        string    `json:"phone" gorm:"size:20;uniqueIndex"`
	CreatedAt    time.Time `json:"created_at"`
}

type Store struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"size:80;not null"`
	District  string    `json:"district" gorm:"size:60"`
	Address   string    `json:"address" gorm:"size:200"`
	Capacity  int       `json:"capacity"`
	Status    string    `json:"status" gorm:"size:30;default:active"`
	Image     string    `json:"image" gorm:"size:255"`
	CreatedAt time.Time `json:"created_at"`
}
