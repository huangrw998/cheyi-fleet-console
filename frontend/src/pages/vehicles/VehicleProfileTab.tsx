import type { Vehicle } from '@/types'
import { daysText, daysUntil, formatDate } from '@/lib/format'
import { Progress, SectionHeader } from '@/components/ui'
import { VehicleStatusCard } from './VehicleHeader'

export function VehicleProfileTab({ vehicle, activeLease }: { vehicle: Vehicle; activeLease?: import('@/types').Lease }) {
  const insuranceDays = daysUntil(vehicle.insurance_expiry)
  const rows: [string, string, boolean?][] = [
    ['车牌号', vehicle.plate_no, true],
    ['VIN', vehicle.vin || '-', true],
    ['车型', `${vehicle.model?.brand ?? ''} ${vehicle.model?.name ?? ''}`],
    ['车身类型', vehicle.model?.body_type ?? '-'],
    ['所属门店', vehicle.store?.name ?? '-'],
    ['车身颜色', vehicle.color],
    ['购置日期', formatDate(vehicle.purchase_date)],
    ['年检到期', formatDate(vehicle.inspection_expiry)],
    ['保险到期', `${formatDate(vehicle.insurance_expiry)}（${insuranceDays !== null ? daysText(insuranceDays) : '-'}）`],
    ['当前状态', vehicle.status],
  ]

  return (
    <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <SectionHeader title="登记信息" description="车辆基础档案与证件有效期" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value, mono]) => (
            <div key={label} className="info-tile-compact">
              <p className="text-[10px] text-muted">{label}</p>
              <p className={`mt-1 text-xs text-ink ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="min-w-0 space-y-4">
        <div className="info-tile p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink">车辆健康度</span>
            <span className="font-mono text-xs text-muted">综合评分</span>
          </div>
          <div className="mt-4">
            <Progress label="证件完整度" value={vehicle.insurance_expiry && vehicle.inspection_expiry ? 100 : 65} tone="success" />
            <Progress className="mt-3" label="保险剩余周期" value={insuranceDays !== null ? Math.max(0, Math.min(100, (insuranceDays / 365) * 100)) : 0} tone={insuranceDays !== null && insuranceDays < 30 ? 'warning' : 'accent'} />
            <Progress className="mt-3" label="保养里程余量" value={Math.max(8, 100 - (vehicle.mileage_km % 10000) / 100)} tone="info" />
          </div>
        </div>
        <VehicleStatusCard vehicle={vehicle} activeLease={activeLease} />
      </div>
    </div>
  )
}