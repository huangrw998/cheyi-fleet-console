import { apiGet, apiPost } from '@/lib/api'
import type { DispatchCreateInput, DispatchData, DispatchTask } from '@/types'

export function getDispatch() {
  return apiGet<{ data: DispatchData }>('/dispatch-tasks')
}

export function createDispatch(input: DispatchCreateInput) {
  return apiPost<{ data: DispatchTask }>('/dispatch-tasks', input)
}

export function completeDispatch(id: number) {
  return apiPost<{ data: DispatchTask }>(`/dispatch-tasks/${id}/complete`, {})
}