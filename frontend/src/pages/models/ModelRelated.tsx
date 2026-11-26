import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import type { VehicleModel } from '@/types'
import { formatMoney } from '@/lib/format'
import { Card, SectionHeader } from '@/components/ui'

export function ModelRelated({ models }: { models: VehicleModel[] }) {
  if (!models.length) return null
  return (
    <Card className="p-5">
      <SectionHeader title="相关车型" description="同车身类型的其他选择" />
      <div className="mt-3 space-y-2">
        {models.map((item) => (
          <Link key={item.id} to={`/models/${item.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-card2">
            <img src={item.hero_image} alt="" className="h-12 w-16 rounded-lg object-cover" loading="lazy" decoding="async" />
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-ink">{item.brand} {item.name}</p><p className="mt-0.5 text-[10px] text-muted">{item.range_km}km · {formatMoney(item.monthly_rent_cents, true)}/月</p></div>
            <ArrowRight size={14} className="text-muted" />
          </Link>
        ))}
      </div>
    </Card>
  )
}