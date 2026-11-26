import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '@/api/dashboard'

export function useDashboard() {
  const [range, setRange] = useState('30')
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
  })
  const dashboard = query.data?.data
  const trend = useMemo(() => (dashboard ? dashboard.revenue_trend.slice(-Number(range)) : []), [dashboard, range])
  const { revenue, avgUtilization } = useMemo(() => ({
    revenue: trend.reduce((sum, item) => sum + item.revenue_cents, 0),
    avgUtilization: trend.length ? trend.reduce((sum, item) => sum + item.utilization, 0) / trend.length : 0,
  }), [trend])
  const hero = dashboard?.featured_models[0]
  return { query, dashboard, range, setRange, trend, revenue, avgUtilization, hero }
}