import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createMaintenanceOrder, getInsurancePolicies, getMaintenanceOrders, getMaintenanceVehicles, updateMaintenanceStatus } from '@/api/maintenance'
import type { MaintenanceCreateInput } from '@/types'
import { daysUntil } from '@/lib/format'

export function useMaintenance() {
  const qc = useQueryClient()
  const ordersQuery = useQuery({ queryKey: ['maintenance-orders'], queryFn: getMaintenanceOrders })
  const insuranceQuery = useQuery({ queryKey: ['insurance-policies'], queryFn: getInsurancePolicies })
  const vehiclesQuery = useQuery({ queryKey: ['vehicles', 'maintenance-pool'], queryFn: getMaintenanceVehicles, staleTime: 30_000 })

  const createMutation = useMutation({
    mutationFn: (input: MaintenanceCreateInput) => createMaintenanceOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance-orders'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateMaintenanceStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance-orders'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const orders = useMemo(() => ordersQuery.data?.data ?? [], [ordersQuery.data])
  const insurance = useMemo(() => insuranceQuery.data?.data ?? [], [insuranceQuery.data])
  const vehicles = useMemo(() => (vehiclesQuery.data?.data ?? []).filter((v) => v.status === 'available'), [vehiclesQuery.data])
  const stats = useMemo(() => ({
    pending: orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length,
    inProgress: orders.filter((o) => o.status === 'in_progress').length,
    expiring: insurance.filter((p) => { const d = daysUntil(p.end_date); return d !== null && d <= 30 }).length,
    totalCost: orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.cost_cents, 0),
  }), [orders, insurance])
  return {
    ordersQuery,
    insuranceQuery,
    orders,
    insurance,
    vehicles,
    ...stats,
    createOrder: createMutation.mutateAsync,
    creating: createMutation.isPending,
    advance: statusMutation.mutateAsync,
    advancing: statusMutation.isPending,
  }
}