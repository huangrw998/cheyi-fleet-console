import { ChartLineUp, Download, Gauge, Receipt, ShieldWarning, Wrench } from '@phosphor-icons/react'
import { download } from '@/lib/api'
import { formatMoney, formatPercent } from '@/lib/format'
import { Badge, Button, Card, CardToolbar, DataTable, DatePicker, ErrorState, PageHeader, Select, Skeleton, StatStrip, Tabs, Td, Th } from '@/components/ui'

import { AreaChart, BarsChart } from '@/components/charts'
import { useReports } from './useReports'

export default function ReportsPage() {
  const state = useReports()
  const data = state.data

  if (state.reportQuery.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /><Skeleton className="h-80" /></div>
  if (state.reportQuery.isError || !data) return <ErrorState message="报表加载失败" onRetry={() => void state.reportQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="数据报表"
        description="按时间与门店看出租率、收入和维保成本。所有金额按已收账单统计。"
        actions={<Button variant="secondary" onClick={() => download('/api/v1/bills/export.csv')}><Download size={15} /> 导出账单</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Tabs
            value={state.range}
            onChange={state.applyRange}
            items={[
              { value: '7', label: '7 天' },
              { value: '30', label: '30 天' },
              { value: '90', label: '90 天' },
            ]}
          />
          <div className="flex items-center gap-2">
            <DatePicker value={state.from} onChange={state.setFrom} size="sm" className="w-44" aria-label="开始日期" />
            <span className="text-xs text-muted">至</span>
            <DatePicker value={state.to} onChange={state.setTo} size="sm" className="w-44" aria-label="结束日期" />
          </div>
          <Select value={state.storeId} onChange={(value) => state.setStoreId(value)} className="w-44" size="sm" aria-label="门店">
            <option value="">全部门店</option>
            {state.stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </Select>
          <p className="ml-auto text-[11px] text-muted">统计区间 {data.range.from} 至 {data.range.to}</p>
        </div>
      </Card>

      <StatStrip
        columns={5}
        items={[
          { label: '平均出租率', value: formatPercent(data.kpis.utilization), icon: <Gauge size={16} /> },
          { label: '已收收入', value: formatMoney(data.kpis.revenue_cents, true), icon: <Receipt size={16} /> },
          { label: '单车均收', value: formatMoney(data.kpis.avg_revenue_cents, true), hint: `${data.kpis.total_vehicles} 台车`, icon: <ChartLineUp size={16} /> },
          { label: '账单逾期率', value: formatPercent(data.kpis.overdue_rate), icon: <ShieldWarning size={16} /> },
          { label: '维保成本', value: formatMoney(data.kpis.maintenance_cost_cents, true), icon: <Wrench size={16} /> },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-12">
        <Card className="p-5 xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-base font-semibold tracking-tight text-ink">收入与出租率趋势</h2><p className="mt-1 text-xs text-muted">按在租租约折算的日收入与每日出租率</p></div>
            <Badge tone="accent">{data.trend.length} 天</Badge>
          </div>
          <AreaChart className="mt-5" data={state.chartData} format={(value) => formatMoney(value)} height={280} />
        </Card>

        <Card className="p-5 xl:col-span-4">
          <div><h2 className="text-base font-semibold tracking-tight text-ink">车型收入贡献</h2><p className="mt-1 text-xs text-muted">按已收租金账单统计</p></div>
          <BarsChart
            className="mt-5"
            data={data.revenue_by_model.slice(0, 8).map((item, index) => ({ label: item.name, value: item.revenue_cents, color: index === 0 ? 'var(--chart-1)' : index === 1 ? 'var(--chart-3)' : 'var(--chart-2)' }))}
            format={(value) => formatMoney(value, true)}
          />
        </Card>

        <Card className="overflow-hidden xl:col-span-12">
          <CardToolbar><h2 className="text-base font-semibold tracking-tight text-ink">门店经营排行</h2><p className="mt-1 text-xs text-muted">按已收收入排序，同时看容量利用情况。</p></CardToolbar>
          <DataTable>
            <thead><tr><Th>排名</Th><Th>门店</Th><Th>车辆</Th><Th>在租</Th><Th>出租率</Th><Th>已收收入</Th><Th>经营状态</Th></tr></thead>
            <tbody>
              {data.store_ranking.map((store, index) => (
                <tr key={store.id} className="transition hover:bg-card2/40">
                  <Td><span className="font-mono text-[13px] text-muted">{String(index + 1).padStart(2, '0')}</span></Td>
                  <Td><p className="text-[13px] font-medium text-ink">{store.name}</p><p className="mt-0.5 text-xs text-muted">{store.district}</p></Td>
                  <Td className="font-mono text-[13px]">{store.vehicles}</Td>
                  <Td className="font-mono text-[13px]">{store.active}</Td>
                  <Td><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-card2"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, store.utilization)}%` }} /></div><span className="font-mono text-xs text-ink">{formatPercent(store.utilization)}</span></div></Td>
                  <Td><span className="font-mono text-[13px] text-ink">{formatMoney(store.revenue_cents, true)}</span></Td>
                  <Td><Badge tone={store.utilization > 80 ? 'success' : store.utilization > 55 ? 'info' : 'warning'}>{store.utilization > 80 ? '高负荷' : store.utilization > 55 ? '正常' : '待提升'}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Card>
      </div>
    </div>
  )
}
