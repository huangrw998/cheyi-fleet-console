import { Link } from 'react-router-dom'
import { CurrencyCny, Gauge, PencilSimple, ShieldCheck, SteeringWheel } from '@phosphor-icons/react'
import type { Lease, Vehicle } from '@/types'
import { daysText, daysUntil, formatDate, formatMoney } from '@/lib/format'
import { Badge, Button, ButtonLink, Card, Stat, StatusBadge } from '@/components/ui'

export function VehicleHeader({ vehicle, activeLease, onEdit }: { vehicle: Vehicle; activeLease?: Lease; onEdit: () => void }) {
  const insuranceDays = daysUntil(vehicle.insurance_expiry)
  return (
    <Card className="overflow-hidden">
      <div className="relative h-44 overflow-hidden bg-card2 sm:h-52">
        <img src={vehicle.model?.hero_image ?? '/media/models/byd-qin-plus-ev/wide.webp'} alt="" className="h-full w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent" className="border-white/15 bg-white/10 text-white">车辆档案</Badge>
              <StatusBadge status={vehicle.status} />
            </div>
            <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">{vehicle.plate_no}</h1>
            <p className="mt-1 text-xs text-white/65">{vehicle.model?.brand} {vehicle.model?.name} · {vehicle.store?.name} · {vehicle.color}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="border-white/25 bg-black/35 text-white backdrop-blur-sm hover:bg-black/50" onClick={onEdit}><PencilSimple size={15} /> 编辑档案</Button>
            <ButtonLink to="/dispatch" variant="primary">发起调拨</ButtonLink>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
        <div className="group p-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="当前里程" value={vehicle.mileage_km.toLocaleString('zh-CN')} hint="km" icon={<Gauge size={16} />} /></div>
        <div className="group p-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="保险到期" value={formatDate(vehicle.insurance_expiry)} hint={insuranceDays !== null ? daysText(insuranceDays) : ''} icon={<ShieldCheck size={16} />} /></div>
        <div className="group p-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="当前月租" value={formatMoney(activeLease?.monthly_rent_cents ?? vehicle.model?.monthly_rent_cents ?? 0, true)} hint="在租租约" icon={<CurrencyCny size={16} />} /></div>
        <div className="group p-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="当前租约" value={activeLease ? '生效中' : '无'} hint={activeLease?.driver?.name ?? '可立即分配'} icon={<SteeringWheel size={16} />} /></div>
      </div>
    </Card>
  )
}

export function VehicleEditButton({ onEdit }: { onEdit: () => void }) {
  return <Button variant="secondary" onClick={onEdit}><PencilSimple size={15} /> 编辑档案</Button>
}

export function VehicleBackLink() {
  return <Link to="/vehicles" className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-ink">返回车辆资产</Link>
}

export function VehicleStatusCard({ vehicle, activeLease }: { vehicle: Vehicle; activeLease?: Lease }) {
  return (
    <div className="info-tile p-4">
      <p className="text-xs font-medium text-ink">下一步建议</p>
      <div className="mt-3 space-y-2 text-[11px] leading-5 text-muted">
        {daysUntil(vehicle.insurance_expiry) !== null && (daysUntil(vehicle.insurance_expiry) ?? 99) <= 30 ? <p className="rounded-lg bg-warning-soft px-3 py-2 text-warning">保险将在 {daysUntil(vehicle.insurance_expiry)} 天后到期，建议尽快续保。</p> : null}
        {vehicle.status === 'available' ? <p className="rounded-lg bg-card2 px-3 py-2">车辆可立即分配，可在调度中心发起调拨或在租约页创建租约。</p> : null}
        {activeLease ? <p className="rounded-lg bg-card2 px-3 py-2">当前由 {activeLease.driver?.name} 租用，租约到期日 {formatDate(activeLease.end_date)}。</p> : null}
      </div>
    </div>
  )
}