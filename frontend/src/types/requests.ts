import type { DriverStatus } from './driver'
import type { LeaseActionKind } from './lease'
import type { VehicleStatus } from './vehicle'

export interface PageQuery {
  page?: number
  pageSize?: number
}

export interface ModelListQuery {
  q?: string
  body?: string
  brand?: string
  sort?: string
}

export interface VehicleListQuery extends PageQuery {
  q?: string
  status?: string
  storeId?: string
}

export interface LeaseListQuery extends PageQuery {
  q?: string
  status?: string
  storeId?: string
}

export interface DriverListQuery extends PageQuery {
  q?: string
  status?: string
}

export interface BillListQuery extends PageQuery {
  q?: string
  status?: string
  type?: string
}

export interface ReportQuery {
  from: string
  to: string
  storeId?: string
}

export interface LoginInput {
  phone: string
  password: string
}

export interface RegisterInput {
  name: string
  phone: string
  password: string
}

export interface VehicleCreateInput {
  plate_no: string
  model_id: number
  store_id: number
  color: string
  status: VehicleStatus
  mileage_km: number
  purchase_date?: string
  insurance_expiry?: string
  inspection_expiry?: string
  vin?: string
  note?: string
}

export interface VehicleUpdateInput {
  status?: VehicleStatus
  store_id?: number
  mileage_km?: number
  insurance_expiry?: string
  inspection_expiry?: string
  note?: string
}

export interface DriverCreateInput {
  name: string
  phone: string
  id_card_no?: string
  license_no?: string
  license_expiry?: string
  status: DriverStatus
  rating: number
  emergency_contact?: string
  note?: string
}

export interface DriverUpdateInput {
  name?: string
  phone?: string
  license_no?: string
  license_expiry?: string
  status?: DriverStatus
  rating?: number
  emergency_contact?: string
  note?: string
}

export interface LeaseCreateInput {
  driver_id: number
  vehicle_id: number
  store_id?: number
  start_date: string
  end_date: string
  monthly_rent_cents: number
  deposit_cents: number
  note: string
}

export type LeaseActionInput = {
  kind: LeaseActionKind
  mileage_km?: number
  deductions_cents?: number
  note?: string
}

export interface DispatchCreateInput {
  vehicle_id: number
  to_store_id: number
  scheduled_at: string
  note: string
}

export interface MaintenanceCreateInput {
  vehicle_id: number
  type: string
  scheduled_at: string
  cost_cents: number
  vendor: string
  mileage_km: number
  description: string
}

export interface MaintenanceStatusInput {
  status: string
  note?: string
}

export interface PayBillInput {
  method: string
  paid_at: string
  amount_cents?: number
}

export interface ViolationCreateInput {
  vehicle_id: number
  occurred_at: string
  location: string
  reason: string
  fine_cents: number
  points: number
  note?: string
}

export interface StoreUpdateInput {
  name: string
  district: string
  address: string
  capacity: number
  status: string
  image: string
}

export interface PlanInput {
  name: string
  body_type: string
  monthly_rent_cents: number
  deposit_cents: number
  min_term_months: number
  status: string
}

export interface ProfileInput {
  name: string
  phone: string
}

export interface PasswordInput {
  current_password: string
  new_password: string
}

export interface RemindersInput {
  insurance_days: string
  maintenance_km: string
  overdue_days: string
}