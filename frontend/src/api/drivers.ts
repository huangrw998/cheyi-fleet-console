import { apiGet, apiPatch, apiPost, qs } from '@/lib/api'
import type { Driver, DriverCreateInput, DriverDetailData, DriverListQuery, DriverUpdateInput, ListResponse } from '@/types'

export function getDrivers(query: DriverListQuery = {}) {
  return apiGet<ListResponse<Driver>>(`/drivers${qs({
    q: query.q,
    status: query.status,
    page: query.page,
    page_size: query.pageSize,
  })}`)
}

export function getAllDrivers(limit = 500) {
  return getDrivers({ pageSize: limit })
}

export function getDriverDetail(id: string | number) {
  return apiGet<{ data: DriverDetailData }>(`/drivers/${id}`)
}

export function createDriver(input: DriverCreateInput) {
  return apiPost<{ data: Driver }>('/drivers', input)
}

export function updateDriver(id: string | number, input: DriverUpdateInput) {
  return apiPatch<{ data: Driver }>(`/drivers/${id}`, input)
}