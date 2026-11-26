package models

import "time"

type VehicleModel struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	Slug             string     `json:"slug" gorm:"size:100;uniqueIndex;not null"`
	Brand            string     `json:"brand" gorm:"size:60;not null"`
	Name             string     `json:"name" gorm:"size:100;not null"`
	BodyType         string     `json:"body_type" gorm:"size:30;not null"`
	EnergyType       string     `json:"energy_type" gorm:"size:30;default:BEV"`
	Seats            int        `json:"seats"`
	RangeKm          int        `json:"range_km"`
	BatteryKwh       float64    `json:"battery_kwh"`
	FastChargeMin    int        `json:"fast_charge_min"`
	LengthMm         int        `json:"length_mm"`
	WidthMm          int        `json:"width_mm"`
	HeightMm         int        `json:"height_mm"`
	WheelbaseMm      int        `json:"wheelbase_mm"`
	MonthlyRentCents int64      `json:"monthly_rent_cents"`
	DepositCents     int64      `json:"deposit_cents"`
	MarketPriceCents int64      `json:"market_price_cents"`
	LaunchYear       int        `json:"launch_year"`
	Highlights       StringList `json:"highlights" gorm:"type:text"`
	Gallery          StringList `json:"gallery" gorm:"type:text"`
	HeroImage        string     `json:"hero_image" gorm:"size:255"`
	Model3DKey       string     `json:"model_3d_key" gorm:"size:40"`
	SourceCredit     string     `json:"source_credit" gorm:"size:255"`
	Status           string     `json:"status" gorm:"size:30;default:active"`
	SortOrder        int        `json:"sort_order"`
	CreatedAt        time.Time  `json:"created_at"`
}

type Vehicle struct {
	ID               uint          `json:"id" gorm:"primaryKey"`
	PlateNo          string        `json:"plate_no" gorm:"size:20;uniqueIndex;not null"`
	ModelID          uint          `json:"model_id" gorm:"index;not null"`
	Model            *VehicleModel `json:"model,omitempty" gorm:"foreignKey:ModelID"`
	StoreID          uint          `json:"store_id" gorm:"index;not null"`
	Store            *Store        `json:"store,omitempty" gorm:"foreignKey:StoreID"`
	Color            string        `json:"color" gorm:"size:30"`
	Status           string        `json:"status" gorm:"size:30;index;not null;default:available"`
	MileageKm        int           `json:"mileage_km"`
	PurchaseDate     time.Time     `json:"purchase_date"`
	InsuranceExpiry  time.Time     `json:"insurance_expiry"`
	InspectionExpiry time.Time     `json:"inspection_expiry"`
	Vin              string        `json:"vin" gorm:"size:40"`
	Note             string        `json:"note" gorm:"size:255"`
	CreatedAt        time.Time     `json:"created_at"`
}
