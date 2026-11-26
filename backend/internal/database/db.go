package database

import (
	"fmt"
	"os"
	"path/filepath"

	"cheyi/backend/internal/models"
	"cheyi/backend/internal/phone"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Open(path string) (*gorm.DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)", path)
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(
		&models.User{}, &models.Store{}, &models.VehicleModel{}, &models.Vehicle{},
		&models.Driver{}, &models.Lease{}, &models.LeaseEvent{}, &models.Bill{},
		&models.MaintenanceOrder{}, &models.InsurancePolicy{}, &models.Violation{},
		&models.DispatchTask{}, &models.PricingPlan{}, &models.Setting{},
	); err != nil {
		return nil, err
	}
	var emailColumns int64
	if err := db.Raw("SELECT COUNT(*) FROM pragma_table_info('users') WHERE name = 'email'").Scan(&emailColumns).Error; err != nil {
		return nil, err
	}
	if emailColumns > 0 {
		if err := db.Exec("DROP INDEX IF EXISTS idx_users_email").Error; err != nil {
			return nil, err
		}
		if err := db.Exec("ALTER TABLE users DROP COLUMN email").Error; err != nil {
			return nil, err
		}
	}
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}
	for i := range users {
		normalized := phone.Normalize(users[i].Phone)
		if normalized != "" && normalized != users[i].Phone {
			if err := db.Model(&users[i]).Update("phone", normalized).Error; err != nil {
				return nil, err
			}
		}
	}
	return db, nil
}

func Seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.User{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return seedData(db)
}
