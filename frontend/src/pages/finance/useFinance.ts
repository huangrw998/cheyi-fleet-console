import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createViolation, generateBills, getAllBills, getBills, getFinanceVehicles, getViolations, handleViolation, payBill } from '@/api/finance'
import type { PayBillInput, ViolationCreateInput } from '@/types'

export function useFinance() {
  const [params, setParams] = useSearchParams()
  const qc = useQueryClient()
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? 'all'
  const tab = params.get('type') ?? 'all'
  const page = Number(params.get('page') ?? '1')
  const pageSize = Number(params.get('page_size') ?? '20')

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const billsQuery = useQuery({
    queryKey: ['bills', q, status, tab, page, pageSize],
    queryFn: () => getBills({ q, status, type: tab, page, pageSize }),
  })
  const allBillsQuery = useQuery({
    queryKey: ['bills', 'all'],
    queryFn: () => getAllBills(),
    staleTime: 30_000,
  })
  const violationsQuery = useQuery({
    queryKey: ['violations'],
    queryFn: getViolations,
  })
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'finance-all'],
    queryFn: () => getFinanceVehicles(),
    staleTime: 5 * 60_000,
  })

  const generateMutation = useMutation({
    mutationFn: generateBills,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const payMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: PayBillInput }) => payBill(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['lease'] })
    },
  })
  const handleViolationMutation = useMutation({
    mutationFn: (id: number) => handleViolation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['violations'] })
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const createViolationMutation = useMutation({
    mutationFn: (input: ViolationCreateInput) => createViolation(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['violations'] }),
  })

  const allBills = allBillsQuery.data?.data ?? []
  const stats = useMemo(() => {
    const unpaid = allBills.filter((b) => b.status === 'pending' || b.status === 'overdue')
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const overdue = allBills.filter((b) => b.status === 'overdue' || (b.status === 'pending' && new Date(b.due_date).getTime() < startOfToday.getTime()))
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    const paidThisMonth = allBills.filter((b) => {
      if (b.status !== 'paid' || !b.paid_at) return false
      const date = new Date(b.paid_at)
      return date.getMonth() === month && date.getFullYear() === year
    }).reduce((sum, b) => sum + b.paid_amount_cents, 0)
    const depositPool = allBills.filter((b) => b.type === 'deposit' && b.status === 'paid').reduce((sum, b) => sum + b.paid_amount_cents, 0)
    return {
      unpaidCents: unpaid.reduce((sum, b) => sum + b.amount_cents - b.paid_amount_cents, 0),
      unpaidCount: unpaid.length,
      overdueCount: overdue.length,
      paidThisMonth,
      depositPool,
    }
  }, [allBills])

  return {
    q,
    status,
    tab,
    page,
    pageSize,
    update,
    billsQuery,
    allBills,
    stats,
    violations: violationsQuery.data?.data ?? [],
    vehicles: vehiclesQuery.data?.data ?? [],
    generateBills: generateMutation.mutateAsync,
    generating: generateMutation.isPending,
    payBill: payMutation.mutateAsync,
    paying: payMutation.isPending,
    handleViolation: handleViolationMutation.mutateAsync,
    handlingViolation: handleViolationMutation.isPending,
    createViolation: createViolationMutation.mutateAsync,
    creatingViolation: createViolationMutation.isPending,
  }
}