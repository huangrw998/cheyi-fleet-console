import { Link } from 'react-router-dom'
import { ArrowRight, Cube } from '@phosphor-icons/react'
import type { VehicleModel } from '@/types'
import { bodyTypeLabel, formatMoney, formatPercent } from '@/lib/format'
import { Badge, Money, Progress } from '@/components/ui'

export function ModelCard({ model, featured = false }: { model: VehicleModel; featured?: boolean }) {
  return (
    <Link
      to={`/models/${model.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-card"
    >
      <div className={`relative overflow-hidden bg-card2 ${featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        <img
          src={model.hero_image}
          alt={`${model.brand} ${model.name}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading={featured ? 'eager' : 'lazy'}
          decoding="async"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{model.brand}</p>
            <h3 className={`mt-1 truncate font-semibold tracking-tight text-ink ${featured ? 'text-lg' : 'text-sm'}`}>{model.name}</h3>
          </div>
          <Badge tone={model.available_count > 0 ? 'success' : 'warning'}>{model.available_count > 0 ? `${model.available_count} 台可租` : '暂无空车'}</Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span>{bodyTypeLabel(model.body_type)}</span>
          <span className="font-mono">{model.range_km}km</span>
          <span>{model.seats} 座</span>
          {model.model_3d_key ? <span className="inline-flex items-center gap-1 text-accent"><Cube size={11} /> 3D 看车</span> : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted">月租起</p>
            <Money cents={model.monthly_rent_cents} className="text-base font-semibold text-ink" />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted">{model.fleet_active}/{model.fleet_total} 在租</p>
            <p className="font-mono text-[11px] text-ink">{formatPercent(model.utilization)}</p>
          </div>
        </div>
        <Progress className="mt-2.5" value={model.utilization} tone={model.utilization > 85 ? 'warning' : 'accent'} />
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="text-[10px] text-muted">押金 {formatMoney(model.deposit_cents, true)}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
            查看详情 <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}