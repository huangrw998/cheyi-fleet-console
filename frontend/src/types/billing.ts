import type { Lease } from './lease'

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'waived'
export type BillType = 'rent' | 'deposit' | 'violation' | 'damage' | 'penalty'

export interface Bill {
  id: number
  bill_no: string
  lease_id: number
  lease?: Lease
  type: BillType
  period_start: string
  period_end: string
  amount_cents: number
  paid_amount_cents: number
  due_date: string
  status: BillStatus
  paid_at?: string | null
  method: string
  note: string
  created_at: string
}