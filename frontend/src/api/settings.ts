import { apiGet, apiPost, apiPut } from '@/lib/api'
import type {
  ListResponse,
  PasswordInput,
  PlanInput,
  PricingPlan,
  ProfileInput,
  RemindersInput,
  SettingsData,
  Store,
  StoreUpdateInput,
  User,
  Vehicle,
} from '@/types'

export function getSettings() {
  return apiGet<{ data: SettingsData }>('/settings')
}

export function getSettingsVehicles() {
  return apiGet<ListResponse<Vehicle>>('/vehicles?page_size=500')
}

export function updateStore(id: number, input: StoreUpdateInput) {
  return apiPut<{ data: Store }>(`/settings/stores/${id}`, input)
}

export function createPlan(input: PlanInput) {
  return apiPost<{ data: PricingPlan }>('/settings/pricing-plans', input)
}

export function updatePlan(id: number, input: PlanInput) {
  return apiPut<{ data: PricingPlan }>(`/settings/pricing-plans/${id}`, input)
}

export function updateProfile(input: ProfileInput) {
  return apiPut<{ data: User }>('/settings/profile', input)
}

export function updatePassword(input: PasswordInput) {
  return apiPut<{ data: { ok: boolean } }>('/settings/password', input)
}

export function updateReminders(input: RemindersInput) {
  return apiPut<{ data: { ok: boolean } }>('/settings/reminders', input)
}