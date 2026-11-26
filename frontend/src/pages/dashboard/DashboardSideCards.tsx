import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarCheck, CarProfile, ShieldWarning } from '@phosphor-icons/react'
import type { DashboardData } from '@/types'
import { formatDateCN, formatPercent } from '@/lib/format'
import { Badge, Card, EmptyState, Progress, SectionHeader } from '@/components/ui'

export function HandoversCard({ handovers, className }: { handovers: DashboardData['handovers']; className?: string }) {
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader title="今日交接" description="交车与还车节点" action={<Badge tone="accent">{handovers.length}</Badge>} />
      <div className="mt-4 space-y-1">
        {handovers.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={20} />} title="今天没有交接安排" description="新的租约交接会出现在这里。" />
        ) : handovers.map((item) => (
          <Link key={`${item.type}-${item.id}`} to={`/leases/${item.id}`} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition hover:bg-card2">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.type === 'pickup' ? 'bg-accent-soft text-accent' : 'bg-info-soft text-info'}`}>
              {item.type === 'pickup' ? <CarProfile size={16} /> : <ArrowUpRight size={16} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2"><span className="truncate text-xs font-medium text-ink">{item.driver?.name ?? '-'}</span><span className="shrink-0 font-mono text-[10px] text-muted">{formatDateCN(item.date)} {item.time}</span></span>
              <span className="mt-1 block truncate text-[11px] text-muted">{item.type === 'pickup' ? '交车' : '还车'} · {item.vehicle?.plate_no} · {item.store?.name}</span>
            </span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export function AlertsCard({ alerts, className }: { alerts: DashboardData['alerts']; className?: string }) {
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader title="风险提醒" description="保险、租金、维保与租约到期" action={<Badge tone="warning">{alerts.length}</Badge>} />
      <div className="mt-4 space-y-1">
        {alerts.length === 0 ? (
          <EmptyState icon={<ShieldWarning size={20} />} title="暂无风险提醒" description="车队目前运行平稳。" />
        ) : alerts.slice(0, 5).map((alert, index) => (
          <Link key={`${alert.type}-${index}`} to={alert.href} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition hover:bg-card2">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${alert.severity === 'critical' ? 'bg-danger-soft text-danger' : alert.severity === 'warning' ? 'bg-warning-soft text-warning' : 'bg-info-soft text-info'}`}><ShieldWarning size={14} /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-medium text-ink">{alert.title}</span><span className="mt-0.5 block truncate text-[11px] text-muted">{alert.detail}</span></span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export function StoresCard({ stores, className }: { stores: DashboardData['stores']; className?: string }) {
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader title="门店运力" description="在租车辆与门店容量" action={<Link to="/dispatch" className="text-xs text-accent hover:underline">调度中心</Link>} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {stores.map((store) => (
          <Link key={store.id} to="/dispatch" className="group overflow-hidden rounded-lg border border-line bg-card2/30 transition hover:border-accent/30">
            <div className="relative h-20 overflow-hidden">
              <img src={store.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white">{store.name}</p>
            </div>
            <div className="p-2.5">
              <div className="flex items-center justify-between text-[10px] text-muted"><span>{store.active} / {store.capacity} 在租</span><span className="font-mono text-ink">{formatPercent(store.utilization, 0)}</span></div>
              <Progress className="mt-2" value={store.utilization} tone={store.utilization > 85 ? 'danger' : 'accent'} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}