import { apiGet, apiPatch, apiPost, qs } from '@/lib/api'
import type { Bill, BillListQuery, ListResponse, PayBillInput, Vehicle, Violation, ViolationCreateInput } from '@/types'

export function getBills(query: BillListQuery = {}) {
  return apiGet<ListResponse<Bill>>(`/bills${qs({
    q: query.q,
    status: query.status,
    type: query.type,
    page: query.page,
    page_size: query.pageSize,
  })}`)
}

export function getAllBills(limit = 500) {
  return getBills({ pageSize: limit })
}

export function getViolations() {
  return apiGet<{ data: Violation[] }>('/violations')
}

export function getFinanceVehicles(limit = 100) {
  return apiGet<ListResponse<Vehicle>>(`/vehicles${qs({ page_size: limit })}`)
}

export function generateBills() {
  return apiPost<{ data: { created: number } }>('/bills/generate', {})
}

export function payBill(id: number, input: PayBillInput) {
  return apiPost<{ data: Bill }>(`/bills/${id}/pay`, input)
}

export function handleViolation(id: number) {
  return apiPatch<{ data: Violation }>(`/violations/${id}/handle`, {})
}

export function createViolation(input: ViolationCreateInput) {
  return apiPost<{ data: Violation }>('/violations', input)
}