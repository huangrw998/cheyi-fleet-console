import type { Money } from './common'
import type { Store } from './store'

export interface VehicleModel {
  id: number
  slug: string
  brand: string
  name: string
  body_type: string
  energy_type: string
  seats: number
  range_km: number
  battery_kwh: number
  fast_charge_min: number
  length_mm: number
  width_mm: number
  height_mm: number
  wheelbase_mm: number
  monthly_rent_cents: Money
  deposit_cents: Money
  market_price_cents: Money
  launch_year: number
  highlights: string[]
  gallery: string[]
  hero_image: string
  model_3d_key: string
  source_credit: string
  status: string
  sort_order: number
  fleet_total: number
  fleet_active: number
  available_count: number
  utilization: number
}

export type VehicleStatus = 'available' | 'reserved' | 'rented' | 'maintenance' | 'dispatch' | 'retired'

export interface Vehicle {
  id: number
  plate_no: string
  model_id: number
  model?: VehicleModel
  store_id: number
  store?: Store
  color: string
  status: VehicleStatus
  mileage_km: number
  purchase_date: string
  insurance_expiry: string
  inspection_expiry: string
  vin: string
  note: string
  created_at: string
}

export interface ModelFiltersData {
  brands: string[]
  body_types: string[]
  min_rent_cents: number
  max_rent_cents: number
}
