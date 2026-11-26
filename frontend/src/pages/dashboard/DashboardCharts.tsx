import type { DashboardData } from '@/types'
import { formatMoney, formatPercent } from '@/lib/format'
import { Card, Progress, SectionHeader, Tabs } from '@/components/ui'
import { AreaChart, Donut } from '@/components/charts'

const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-2)']

export function RevenueTrendCard({
  trend,
  range,
  onRangeChange,
  revenue,
  avgUtilization,
  className,
}: {
  trend: DashboardData['revenue_trend']
  range: string
  onRangeChange: (value: string) => void
  revenue: number
  avgUtilization: number
  className?: string
}) {
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader
        title="营收与出租率"
        description="按在租租约折算的日收入与车队出租率"
        action={<Tabs value={range} onChange={onRangeChange} items={[{ value: '7', label: '7 天' }, { value: '14', label: '14 天' }, { value: '30', label: '30 天' }]} />}
      />
      <div className="mt-5 flex flex-wrap items-end gap-6">
        <div><p className="text-[11px] text-muted">区间折算收入</p><p className="mt-1 font-mono text-2xl font-semibold text-ink">{formatMoney(revenue)}</p></div>
        <div><p className="text-[11px] text-muted">平均出租率</p><p className="mt-1 font-mono text-lg text-ink">{formatPercent(avgUtilization)}</p></div>
      </div>
      <AreaChart
        className="mt-4"
        data={trend.map((item) => ({ label: item.date.slice(5), value: item.revenue_cents, secondary: item.utilization }))}
        format={(value) => formatMoney(value)}
        height={220}
      />
    </Card>
  )
}

export function FleetMixCard({ mix, total, className }: { mix: DashboardData['body_type_mix']; total: number; className?: string }) {
  const visible = mix.filter((item) => item.count > 0)
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader title="车型资产组合" description={`${total} 台车按车身类型分布`} />
      <Donut
        className="mt-6"
        segments={visible.map((item, index) => ({ label: item.label, value: item.count, color: chartColors[index % chartColors.length] }))}
        totalLabel="台在营车辆"
        totalValue={String(total)}
        size={170}
      />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {visible.map((item) => (
          <div key={item.body_type} className="info-tile">
            <div className="flex items-center justify-between text-[11px] text-muted"><span>{item.label}</span><span className="font-mono text-ink">{item.count}</span></div>
            <Progress className="mt-2" value={item.percent} tone="accent" />
          </div>
        ))}
      </div>
    </Card>
  )
}