import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeDispatch, createDispatch, getDispatch } from '@/api/dispatch'
import { getAllVehicles } from '@/api/vehicles'
import type { DispatchCreateInput } from '@/types'

export const dispatchStatusColumns = [
  { key: 'available', label: '待租' },
  { key: 'rented', label: '在租' },
  { key: 'reserved', label: '已锁定' },
  { key: 'maintenance', label: '维保' },
  { key: 'dispatch', label: '调拨中' },
]

export function useDispatch() {
  const qc = useQueryClient()
  const dispatchQuery = useQuery({
    queryKey: ['dispatch'],
    queryFn: getDispatch,
  })
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'dispatch-all'],
    queryFn: () => getAllVehicles(),
    staleTime: 30_000,
  })
  const createMutation = useMutation({
    mutationFn: (input: DispatchCreateInput) => createDispatch(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const completeMutation = useMutation({
    mutationFn: (id: number) => completeDispatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const data = dispatchQuery.data?.data
  const stores = data?.stores ?? []
  const allVehicles = vehiclesQuery.data?.data ?? []
  const counts = useMemo(() => ({
    pendingTasks: data?.tasks.filter((t) => t.status === 'pending' || t.status === 'in_transit').length ?? 0,
    completedTasks: data?.tasks.filter((t) => t.status === 'completed').length ?? 0,
  }), [data])
  const matrix = useMemo(() => stores.map((store) => {
    const row: Record<string, number> = {}
    dispatchStatusColumns.forEach((column) => { row[column.key] = 0 })
    allVehicles.filter((v) => v.store_id === store.id).forEach((v) => { row[v.status] = (row[v.status] ?? 0) + 1 })
    return { store, row }
  }), [stores, allVehicles])

  return {
    dispatchQuery,
    data,
    stores,
    tasks: data?.tasks ?? [],
    pool: data?.pool ?? [],
    matrix,
    ...counts,
    createTask: createMutation.mutateAsync,
    creating: createMutation.isPending,
    completeTask: completeMutation.mutateAsync,
    completing: completeMutation.isPending,
  }
}