import type { Driver } from './driver'
import type { Lease } from './lease'
import type { Store } from './store'
import type { Vehicle, VehicleModel } from './vehicle'

export interface DashboardData {
  kpis: {
    active_leases: number
    total_vehicles: number
    available_vehicles: number
    maintenance_vehicles: number
    overdue_bills: number
    monthly_receivable_cents: number
    utilization: number
  }
  revenue_trend: { date: string; revenue_cents: number; utilization: number }[]
  fleet_status: { status: string; label: string; count: number }[]
  body_type_mix: { body_type: string; label: string; count: number; percent: number }[]
  handovers: {
    id: number
    type: 'pickup' | 'return'
    time: string
    date: string
    driver?: Driver
    vehicle?: Vehicle
    store?: Store
  }[]
  alerts: { type: string; severity: 'info' | 'warning' | 'critical'; title: string; detail: string; href: string }[]
  recent_leases: Lease[]
  featured_models: (Pick<VehicleModel, 'id' | 'slug' | 'brand' | 'name' | 'body_type' | 'hero_image' | 'range_km' | 'monthly_rent_cents' | 'model_3d_key'> & {
    fleet_total: number
    fleet_active: number
    available_count: number
    utilization: number
  })[]
  stores: (Store & { total: number; active: number; utilization: number })[]
  month_label: string
}

export interface ReportsData {
  range: { from: string; to: string }
  kpis: {
    utilization: number
    revenue_cents: number
    avg_revenue_cents: number
    overdue_rate: number
    maintenance_cost_cents: number
    total_vehicles: number
  }
  trend: { date: string; utilization: number; revenue_cents: number }[]
  revenue_by_model: { name: string; revenue_cents: number }[]
  store_ranking: {
    id: number
    name: string
    district: string
    capacity: number
    vehicles: number
    active: number
    utilization: number
    revenue_cents: number
  }[]
}