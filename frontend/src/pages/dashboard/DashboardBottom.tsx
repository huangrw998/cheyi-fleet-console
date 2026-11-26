import { Link } from 'react-router-dom'
import { ArrowRight, Cube } from '@phosphor-icons/react'
import type { DashboardData, Lease } from '@/types'
import { formatMoney } from '@/lib/format'
import { Avatar, Card, Money, Progress, SectionHeader, StatusBadge } from '@/components/ui'

export function FeaturedModelsCard({ models, className }: { models: DashboardData['featured_models']; className?: string }) {
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader title="热门车型" description="按当前在租数量排序，点击进入车型展厅" action={<Link to="/models" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">全部车型 <ArrowRight size={13} /></Link>} />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {models.slice(0, 3).map((model) => (
          <Link key={model.id} to={`/models/${model.slug}`} className="group overflow-hidden rounded-xl border border-line bg-card2/30 transition hover:border-accent/30">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={model.hero_image} alt={`${model.brand} ${model.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
              {model.model_3d_key ? <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[9px] text-white backdrop-blur"><Cube size={10} /> 3D</span> : null}
            </div>
            <div className="p-3">
              <p className="text-[10px] text-muted">{model.brand}</p>
              <p className="mt-0.5 truncate text-sm font-medium text-ink">{model.name}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{model.range_km}km · {model.fleet_active}/{model.fleet_total} 在租</span><Money cents={model.monthly_rent_cents} compact className="text-[11px] text-ink" /></div>
              <Progress className="mt-2" value={model.utilization} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export function RecentLeasesCard({ leases, className }: { leases: Lease[]; className?: string }) {
  return (
    <Card className={`p-5 ${className ?? ''}`}>
      <SectionHeader title="最近租约" description="最新创建的租约" action={<Link to="/leases" className="text-xs text-accent hover:underline">全部</Link>} />
      <div className="mt-3 divide-y divide-line">
        {leases.slice(0, 5).map((lease) => (
          <Link key={lease.id} to={`/leases/${lease.id}`} className="flex items-center gap-3 py-3 transition hover:bg-card2/50">
            <Avatar name={lease.driver?.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{lease.driver?.name ?? '-'}</p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-muted">{lease.vehicle?.plate_no} · {lease.lease_no}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={lease.status} />
              <p className="mt-1 font-mono text-[10px] text-muted">{formatMoney(lease.monthly_rent_cents, true)}/月</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}