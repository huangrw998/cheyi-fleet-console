import { apiGet } from '@/lib/api'
import type { DashboardData } from '@/types'

export function getDashboard() {
  return apiGet<{ data: DashboardData }>('/dashboard')
}