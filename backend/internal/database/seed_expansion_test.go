package database

import (
	"path/filepath"
	"testing"

	"cheyi/backend/internal/models"
)

func TestGuangzhouExpansionIsIdempotent(t *testing.T) {
	db, err := Open(filepath.Join(t.TempDir(), "cheyi-expansion.db"))
	if err != nil {
		t.Fatal(err)
	}
	if err := Seed(db); err != nil {
		t.Fatal(err)
	}
	if err := EnsureExpandedData(db); err != nil {
		t.Fatal(err)
	}
	if err := EnsureExpandedData(db); err != nil {
		t.Fatal(err)
	}

	var stores, vehicles, drivers, leases, bills int64
	db.Model(&models.Store{}).Count(&stores)
	db.Model(&models.Vehicle{}).Count(&vehicles)
	db.Model(&models.Driver{}).Count(&drivers)
	db.Model(&models.Lease{}).Count(&leases)
	db.Model(&models.Bill{}).Count(&bills)
	if stores != 7 || vehicles != 85 || drivers != 66 || leases != 63 || bills < 140 {
		t.Fatalf("unexpected expanded counts: stores=%d vehicles=%d drivers=%d leases=%d bills=%d", stores, vehicles, drivers, leases, bills)
	}

	var guangzhouStores int64
	db.Model(&models.Store{}).Where("name LIKE ?", "广州%").Count(&guangzhouStores)
	if guangzhouStores != 3 {
		t.Fatalf("expected 3 Guangzhou stores, got %d", guangzhouStores)
	}
	var leasedDrivers int64
	db.Model(&models.Driver{}).Where("status = ?", "leased").Count(&leasedDrivers)
	if leasedDrivers < 28 {
		t.Fatalf("expected Guangzhou drivers to include leased records, got %d", leasedDrivers)
	}
}
