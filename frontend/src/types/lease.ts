import type { Bill } from './billing'
import type { Driver } from './driver'
import type { Store } from './store'
import type { Vehicle } from './vehicle'

export type LeaseStatus = 'pending_sign' | 'pending_pickup' | 'active' | 'pending_return' | 'returned' | 'cancelled'

export interface Lease {
  id: number
  lease_no: string
  driver_id: number
  driver?: Driver
  vehicle_id: number
  vehicle?: Vehicle
  store_id: number
  store?: Store
  start_date: string
  end_date: string
  monthly_rent_cents: number
  deposit_cents: number
  status: LeaseStatus
  pickup_mileage: number
  return_mileage: number
  signed_at?: string | null
  closed_at?: string | null
  note: string
  created_at: string
  bills?: Bill[]
  events?: LeaseEvent[]
}

export interface LeaseEvent {
  id: number
  lease_id: number
  type: string
  note: string
  created_at: string
}
export type LeaseActionKind = 'sign' | 'handover' | 'return' | 'cancel'
