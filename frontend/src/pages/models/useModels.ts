import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getModelFilters, getModels } from '@/api/models'

export function useModels() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const body = params.get('body') ?? 'all'
  const brand = params.get('brand') ?? 'all'
  const sort = params.get('sort') ?? 'recommended'

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const clear = () => setParams({}, { replace: true })

  const filtersQuery = useQuery({
    queryKey: ['model-filters'],
    queryFn: getModelFilters,
    staleTime: 5 * 60_000,
  })

  const modelsQuery = useQuery({
    queryKey: ['models', q, body, brand, sort],
    queryFn: () => getModels({ q, body, brand, sort }),
    staleTime: 60_000,
  })

  const models = modelsQuery.data?.data ?? []
  const isFiltered = Boolean(q || body !== 'all' || brand !== 'all' || sort !== 'recommended')

  const featured = useMemo(() => {
    if (isFiltered) return []
    return [...models].sort((a, b) => b.available_count - a.available_count || b.utilization - a.utilization).slice(0, 3)
  }, [isFiltered, models])
  const featuredIds = useMemo(() => new Set(featured.map((model) => model.id)), [featured])
  const rest = useMemo(() => (isFiltered ? models : models.filter((model) => !featuredIds.has(model.id))), [isFiltered, models, featuredIds])
  const averageUtilization = useMemo(
    () => (featured.length ? featured.reduce((sum, model) => sum + model.utilization, 0) / featured.length : 0),
    [featured],
  )

  return {
    params,
    q,
    body,
    brand,
    sort,
    update,
    clear,
    isFiltered,
    filters: filtersQuery.data?.data,
    filtersLoading: filtersQuery.isLoading,
    models,
    modelsLoading: modelsQuery.isLoading,
    modelsError: modelsQuery.isError,
    refetchModels: modelsQuery.refetch,
    featured,
    rest,
    averageUtilization,
  }
}