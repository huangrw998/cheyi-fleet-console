import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDriver, getAllDrivers, getDrivers } from '@/api/drivers'
import type { DriverCreateInput } from '@/types'

export function useDrivers() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? 'all'
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
    queryKey: ['drivers', q, status, page, pageSize],
    queryFn: () => getDrivers({ q, status, page, pageSize }),
  })
  const countsQuery = useQuery({
    queryKey: ['drivers', 'counts'],
    queryFn: () => getAllDrivers(),
    staleTime: 30_000,
  })

  const counts = useMemo(() => {
    const all = countsQuery.data?.data ?? []
    return {
      all: all.length,
      certified: all.filter((d) => d.status === 'certified').length,
      leased: all.filter((d) => d.status === 'leased').length,
      pending: all.filter((d) => d.status === 'pending').length,
      blacklisted: all.filter((d) => d.status === 'blacklisted').length,
    }
  }, [countsQuery.data])

  const createMutation = useMutation({
    mutationFn: (input: DriverCreateInput) => createDriver(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  })

  return {
    q,
    status,
    page,
    pageSize,
    update,
    listQuery,
    countsQuery,
    counts,
    createDriver: createMutation.mutateAsync,
    creating: createMutation.isPending,
  }
}