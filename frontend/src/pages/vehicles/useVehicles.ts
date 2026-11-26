import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDashboard } from '@/api/dashboard'
import { getModels } from '@/api/models'
import { getSettings } from '@/api/settings'
import { createVehicle, getVehicles } from '@/api/vehicles'
import type { VehicleCreateInput } from '@/types'

export function useVehicles() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? 'all'
  const storeId = params.get('store') ?? ''
  const page = Number(params.get('page') ?? '1')
  const pageSize = Number(params.get('page_size') ?? '20')
  const qc = useQueryClient()

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const listQuery = useQuery({
    queryKey: ['vehicles', q, status, storeId, page, pageSize],
    queryFn: () => getVehicles({ q, status, storeId, page, pageSize }),
  })
  const modelsQuery = useQuery({
    queryKey: ['models', '', 'all', 'all', 'recommended'],
    queryFn: () => getModels(),
    staleTime: 5 * 60_000,
  })
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  })
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (input: VehicleCreateInput) => createVehicle(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return {
    q,
    status,
    storeId,
    page,
    pageSize,
    update,
    listQuery,
    models: modelsQuery.data?.data ?? [],
    stores: settingsQuery.data?.data.stores ?? [],
    kpis: dashboardQuery.data?.data.kpis,
    createVehicle: createMutation.mutateAsync,
    creating: createMutation.isPending,
  }
}