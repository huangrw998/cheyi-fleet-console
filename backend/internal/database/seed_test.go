package database

import (
	"path/filepath"
	"testing"

	"cheyi/backend/internal/models"
)

func TestSeedCreatesFleet(t *testing.T) {
	db, err := Open(filepath.Join(t.TempDir(), "cheyi-test.db"))
	if err != nil {
		t.Fatal(err)
	}
	if err := Seed(db); err != nil {
		t.Fatal(err)
	}
	var user models.User
	if err := db.First(&user).Error; err != nil {
		t.Fatal(err)
	}
	if user.Phone != "12388888888" {
		t.Fatalf("expected normalized admin phone, got %q", user.Phone)
	}
	var modelsCount, vehiclesCount, driversCount, leasesCount int64
	db.Model(&models.VehicleModel{}).Count(&modelsCount)
	db.Model(&models.Vehicle{}).Count(&vehiclesCount)
	db.Model(&models.Driver{}).Count(&driversCount)
	db.Model(&models.Lease{}).Count(&leasesCount)
	if modelsCount != 16 {
		t.Fatalf("expected 16 models, got %d", modelsCount)
	}
	if vehiclesCount != 64 {
		t.Fatalf("expected 64 vehicles, got %d", vehiclesCount)
	}
	if driversCount != 46 {
		t.Fatalf("expected 46 drivers, got %d", driversCount)
	}
	if leasesCount < 40 {
		t.Fatalf("expected at least 40 leases, got %d", leasesCount)
	}

	// Seeding again must be idempotent.
	if err := Seed(db); err != nil {
		t.Fatal(err)
	}
	var secondCount int64
	db.Model(&models.Vehicle{}).Count(&secondCount)
	if secondCount != vehiclesCount {
		t.Fatalf("seed is not idempotent: %d != %d", secondCount, vehiclesCount)
	}
}
