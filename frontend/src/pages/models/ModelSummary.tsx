import { useNavigate } from 'react-router-dom'
import { MapPin, Users } from '@phosphor-icons/react'
import type { VehicleModel } from '@/types'
import { bodyTypeLabel, formatMoney, formatPercent } from '@/lib/format'
import { Badge, Button, Card, Money, Progress } from '@/components/ui'

export function ModelSummary({ model }: { model: VehicleModel }) {
  const navigate = useNavigate()
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{model.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{bodyTypeLabel(model.body_type)}</Badge>
            <Badge tone="info">{model.energy_type}</Badge>
            <Badge tone={model.available_count > 0 ? 'success' : 'warning'}>{model.available_count > 0 ? `${model.available_count} 台可租` : '暂无空车'}</Badge>
          </div>
        </div>
        <div className="text-right"><p className="text-[10px] text-muted">月租起</p><Money cents={model.monthly_rent_cents} className="text-xl font-semibold text-ink" /></div>
      </div>

      <div className="mt-4 info-tile">
        <div className="flex items-center justify-between text-[11px] text-muted"><span>车队出租率</span><span className="font-mono text-ink">{formatPercent(model.utilization)}</span></div>
        <Progress className="mt-2" value={model.utilization} tone={model.utilization > 85 ? 'warning' : 'accent'} />
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{model.fleet_active} 台在租</span><span>{model.fleet_total} 台在营</span></div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="info-tile"><p className="text-[10px] text-muted">押金</p><p className="mt-1 font-mono text-sm text-ink">{formatMoney(model.deposit_cents)}</p></div>
        <div className="info-tile"><p className="text-[10px] text-muted">市场指导价</p><p className="mt-1 font-mono text-sm text-ink">{formatMoney(model.market_price_cents)}</p></div>
      </div>

      <div className="mt-5 grid gap-2">
        {model.available_count > 0 ? (
          <Button variant="primary" size="lg" onClick={() => navigate(`/leases/new?model=${model.slug}`)}><Users size={16} /> 以此车型创建租约</Button>
        ) : (
          <Button variant="secondary" size="lg" onClick={() => navigate('/models')}><Users size={16} /> 暂无空车，查看其他车型</Button>
        )}
        <Button variant="secondary" onClick={() => document.getElementById('model-vehicles')?.scrollIntoView({ behavior: 'smooth' })}><MapPin size={16} /> 查看在库车辆</Button>
        {model.available_count === 0 ? <p className="text-center text-[11px] leading-5 text-muted">该车型当前全部在租或维保，可稍后回来查看。</p> : null}
      </div>
    </Card>
  )
}