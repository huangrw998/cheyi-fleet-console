import { useNavigate } from 'react-router-dom'
import { Images, Plus } from '@phosphor-icons/react'
import { Button, ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { useHealth } from '@/hooks/useHealth'
import { FeaturedModelsCard, RecentLeasesCard } from './DashboardBottom'
import { DashboardKpis } from './DashboardKpis'
import { DashboardHero } from './DashboardHero'
import { FleetMixCard, RevenueTrendCard } from './DashboardCharts'
import { AlertsCard, HandoversCard, StoresCard } from './DashboardSideCards'
import { useDashboard } from './useDashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const state = useDashboard()
  const health = useHealth()
  const dashboard = state.dashboard
  const online = health.data !== false

  if (state.query.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[340px] w-full" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <div className="grid gap-4 xl:grid-cols-12"><Skeleton className="h-80 xl:col-span-7" /><Skeleton className="h-80 xl:col-span-5" /></div>
      </div>
    )
  }
  if (state.query.isError || !dashboard) return <ErrorState message="运营总览加载失败" onRetry={() => void state.query.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="运营总览"
        description={`车队、租约和风险的实时切面。今天有 ${dashboard.handovers.length} 个交接节点需要关注。`}
        actions={<><Button variant="secondary" onClick={() => navigate('/models')}><Images size={16} /> 车型展厅</Button><Button variant="primary" onClick={() => navigate('/leases/new')}><Plus size={16} /> 新建租约</Button></>}
      />

      <div className="info-tile-compact flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className={online ? 'h-1.5 w-1.5 rounded-full bg-success' : 'h-1.5 w-1.5 rounded-full bg-danger'} />{online ? '服务在线' : '服务异常'}</span>
        <span>{dashboard.month_label}</span>
        <span>车队规模 <span className="font-mono text-ink">{dashboard.kpis.total_vehicles}</span> 台</span>
        <span>运营门店 <span className="font-mono text-ink">{dashboard.stores.length}</span> 个</span>
        <span>本月到期未收 <span className="font-mono text-ink">{formatMoney(dashboard.kpis.monthly_receivable_cents, true)}</span></span>
        <span className="ml-auto font-mono text-[11px] text-muted/80">数据更新 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <DashboardHero hero={state.hero} activeLeases={dashboard.kpis.active_leases} utilization={dashboard.kpis.utilization} />
      <DashboardKpis kpis={dashboard.kpis} />

      <div className="grid gap-4 xl:grid-cols-12">
        <RevenueTrendCard className="xl:col-span-7" trend={state.trend} range={state.range} onRangeChange={state.setRange} revenue={state.revenue} avgUtilization={state.avgUtilization} />
        <FleetMixCard className="xl:col-span-5" mix={dashboard.body_type_mix} total={dashboard.kpis.total_vehicles} />
        <HandoversCard className="xl:col-span-4" handovers={dashboard.handovers} />
        <AlertsCard className="xl:col-span-4" alerts={dashboard.alerts} />
        <StoresCard className="xl:col-span-4" stores={dashboard.stores} />
        <FeaturedModelsCard className="xl:col-span-8" models={dashboard.featured_models} />
        <RecentLeasesCard className="xl:col-span-4" leases={dashboard.recent_leases} />
      </div>
    </div>
  )
}
