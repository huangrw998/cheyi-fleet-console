import { apiGet, qs } from '@/lib/api'
import type { ModelDetailData, ModelFiltersData, ModelListQuery, Vehicle, VehicleModel } from '@/types'

export function getModelFilters() {
  return apiGet<{ data: ModelFiltersData }>('/models/filters')
}

export function getModels(query: ModelListQuery = {}) {
  return apiGet<{ data: VehicleModel[] }>(`/models${qs({ q: query.q, body_type: query.body, brand: query.brand, sort: query.sort })}`)
}

export function getModelDetail(slug: string) {
  return apiGet<{ data: ModelDetailData }>(`/models/${encodeURIComponent(slug)}`)
}

export function getModelVehicles(slug: string) {
  return apiGet<{ data: Vehicle[] }>(`/models/${encodeURIComponent(slug)}/vehicles`)
}