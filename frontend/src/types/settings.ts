import type { User } from './auth'
import type { Store } from './store'

export interface PricingPlan {
  id: number
  name: string
  body_type: string
  monthly_rent_cents: number
  deposit_cents: number
  min_term_months: number
  status: string
  created_at: string
}

export interface SettingsData {
  stores: Store[]
  pricing_plans: PricingPlan[]
  profile: User
  reminders: { insurance_days: string; maintenance_km: string; overdue_days: string }
  company: { name: string; contact: string; address: string }
}