import { apiGet, apiPatch, apiPost } from '@/lib/api'
import type { InsurancePolicy, ListResponse, MaintenanceCreateInput, MaintenanceOrder, MaintenanceStatusInput, Vehicle } from '@/types'

export function getMaintenanceOrders() {
  return apiGet<{ data: MaintenanceOrder[] }>('/maintenance-orders')
}

export function getInsurancePolicies() {
  return apiGet<{ data: InsurancePolicy[] }>('/insurance-policies')
}

export function getMaintenanceVehicles() {
  return apiGet<ListResponse<Vehicle>>('/vehicles?page_size=500')
}

export function createMaintenanceOrder(input: MaintenanceCreateInput) {
  return apiPost<{ data: MaintenanceOrder }>('/maintenance-orders', input)
}

export function updateMaintenanceStatus(id: number, input: MaintenanceStatusInput) {
  return apiPatch<{ data: MaintenanceOrder }>(`/maintenance-orders/${id}/status`, input)
}