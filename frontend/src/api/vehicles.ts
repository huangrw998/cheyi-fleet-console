import { apiGet, apiPatch, apiPost, qs } from '@/lib/api'
import type { ListResponse, Vehicle, VehicleCreateInput, VehicleDetailData, VehicleListQuery, VehicleUpdateInput } from '@/types'

export function getVehicles(query: VehicleListQuery = {}) {
  return apiGet<ListResponse<Vehicle>>(`/vehicles${qs({
    q: query.q,
    status: query.status,
    store_id: query.storeId,
    page: query.page,
    page_size: query.pageSize,
  })}`)
}

export function getAllVehicles(limit = 500) {
  return getVehicles({ pageSize: limit })
}

export function getVehicleDetail(id: string | number) {
  return apiGet<{ data: VehicleDetailData }>(`/vehicles/${id}`)
}

export function createVehicle(input: VehicleCreateInput) {
  return apiPost<{ data: Vehicle }>('/vehicles', input)
}

export function updateVehicle(id: string | number, input: VehicleUpdateInput) {
  return apiPatch<{ data: Vehicle }>(`/vehicles/${id}`, input)
}