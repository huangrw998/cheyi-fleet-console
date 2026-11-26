import type { Driver } from './driver'
import type { Store } from './store'
import type { Vehicle } from './vehicle'

export interface MaintenanceOrder {
  id: number
  order_no: string
  vehicle_id: number
  vehicle?: Vehicle
  type: string
  status: string
  scheduled_at: string
  completed_at?: string | null
  cost_cents: number
  vendor: string
  mileage_km: number
  description: string
  created_at: string
}

export interface InsurancePolicy {
  id: number
  vehicle_id: number
  vehicle?: Vehicle
  provider: string
  policy_no: string
  type: string
  premium_cents: number
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export interface Violation {
  id: number
  vehicle_id: number
  vehicle?: Vehicle
  driver_id: number
  driver?: Driver
  occurred_at: string
  location: string
  reason: string
  fine_cents: number
  points: number
  status: string
  handled_at?: string | null
  note: string
  created_at: string
}

export interface DispatchTask {
  id: number
  task_no: string
  vehicle_id: number
  vehicle?: Vehicle
  from_store_id: number
  from_store?: Store
  to_store_id: number
  to_store?: Store
  status: string
  scheduled_at: string
  completed_at?: string | null
  note: string
  created_at: string
}

export interface DispatchData {
  tasks: DispatchTask[]
  pool: Vehicle[]
  stores: Store[]
}