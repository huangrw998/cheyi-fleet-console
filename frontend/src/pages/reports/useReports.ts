import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getReports } from '@/api/reports'
import { getSettings } from '@/api/settings'


function dateDaysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
}

export function useReports() {
  const [range, setRange] = useState('30')
  const [from, setFrom] = useState(dateDaysAgo(29))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [storeId, setStoreId] = useState('')

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  })
  const reportQuery = useQuery({
    queryKey: ['reports', from, to, storeId],
    queryFn: () => getReports({ from, to, storeId }),
  })

  const applyRange = (value: string) => {
    setRange(value)
    if (value === 'custom') return
    const days = Number(value)
    setFrom(dateDaysAgo(days - 1))
    setTo(new Date().toISOString().slice(0, 10))
  }

  const chartData = useMemo(() => (reportQuery.data?.data.trend ?? []).map((item) => ({
    label: item.date.slice(5),
    value: item.revenue_cents,
    secondary: item.utilization,
  })), [reportQuery.data])

  return {
    range,
    from,
    to,
    storeId,
    setFrom: (value: string) => { setFrom(value); setRange('custom') },
    setTo: (value: string) => { setTo(value); setRange('custom') },
    setStoreId,
    applyRange,
    settingsQuery,
    reportQuery,
    data: reportQuery.data?.data,
    chartData,
    stores: settingsQuery.data?.data.stores ?? [],
  }
}