import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllLeases, getLeases } from '@/api/leases'
import { getSettings } from '@/api/settings'


export function useLeases() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? 'all'
  const storeId = params.get('store') ?? ''
  const page = Number(params.get('page') ?? '1')
  const pageSize = Number(params.get('page_size') ?? '20')

  const update = (key: string, value: string) => {
    if (key === 'q') setSearch(value)
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const listQuery = useQuery({
    queryKey: ['leases', q, status, storeId, page, pageSize],
    queryFn: () => getLeases({ q, status, storeId, page, pageSize }),
  })
  const countsQuery = useQuery({
    queryKey: ['leases', 'counts'],
    queryFn: () => getAllLeases(),
    staleTime: 30_000,
  })
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  })

  const counts = useMemo(() => {
    const all = countsQuery.data?.data ?? []
    return {
      all: all.length,
      pending_sign: all.filter((l) => l.status === 'pending_sign').length,
      pending_pickup: all.filter((l) => l.status === 'pending_pickup').length,
      active: all.filter((l) => l.status === 'active').length,
      returned: all.filter((l) => l.status === 'returned').length,
      cancelled: all.filter((l) => l.status === 'cancelled').length,
    }
  }, [countsQuery.data])

  const monthlyRent = useMemo(
    () => (countsQuery.data?.data ?? []).filter((l) => l.status === 'active').reduce((sum, l) => sum + l.monthly_rent_cents, 0),
    [countsQuery.data],
  )
  return {
    search,
    status,
    storeId,
    page,
    pageSize,
    update,
    listQuery,
    data: listQuery.data,
    counts,
    stores: settingsQuery.data?.data.stores ?? [],
    monthlyRent,
  }
}