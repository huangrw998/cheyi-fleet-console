package database

import (
	"time"

	"cheyi/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedData(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		today := time.Now().Truncate(24 * time.Hour)
		hash, err := bcrypt.GenerateFromPassword([]byte("Cheyi@2026"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user := models.User{
			Name: "林知远", PasswordHash: string(hash),
			Role: "admin", Phone: "12388888888",
		}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		stores := []models.Store{
			{Name: "浦东金桥店", District: "浦东新区", Address: "金桥路 1388 号", Capacity: 24, Status: "active", Image: "/media/stores/store-1.webp"},
			{Name: "闵行莘庄店", District: "闵行区", Address: "莘庄工业区申北路 218 号", Capacity: 20, Status: "active", Image: "/media/stores/store-2.webp"},
			{Name: "嘉定南翔店", District: "嘉定区", Address: "南翔镇沪宜公路 1188 号", Capacity: 18, Status: "active", Image: "/media/stores/store-3.webp"},
			{Name: "松江大学城店", District: "松江区", Address: "文汇路 800 弄 12 号", Capacity: 16, Status: "active", Image: "/media/stores/store-4.webp"},
		}
		if err := tx.Create(&stores).Error; err != nil {
			return err
		}

		modelRows := seedModelCatalog()
		if err := tx.Create(&modelRows).Error; err != nil {
			return err
		}
		vehicles, drivers, err := seedFleet(tx, today, stores, modelRows)
		if err != nil {
			return err
		}
		leases, err := seedLeases(tx, today, vehicles, drivers, modelRows)
		if err != nil {
			return err
		}
		if err := seedBills(tx, today, leases); err != nil {
			return err
		}
		return seedOperations(tx, today, vehicles, drivers, stores)
	})
}
