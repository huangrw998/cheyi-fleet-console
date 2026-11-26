import { apiGet, apiPost, qs } from '@/lib/api'
import type { Lease, LeaseActionInput, LeaseCreateInput, LeaseListQuery, ListResponse } from '@/types'

export function getLeases(query: LeaseListQuery = {}) {
  return apiGet<ListResponse<Lease>>(`/leases${qs({
    q: query.q,
    status: query.status,
    store_id: query.storeId,
    page: query.page,
    page_size: query.pageSize,
  })}`)
}

export function getAllLeases(limit = 500) {
  return getLeases({ pageSize: limit })
}

export function getLease(id: string | number) {
  return apiGet<{ data: Lease }>(`/leases/${id}`)
}

export function createLease(input: LeaseCreateInput) {
  return apiPost<{ data: Lease }>('/leases', input)
}

export function runLeaseAction(id: string | number, input: LeaseActionInput) {
  const { kind, ...payload } = input
  return apiPost<{ data: Lease }>(`/leases/${id}/${kind}`, payload)
}