import { Receipt } from '@phosphor-icons/react'
import type { Lease } from '@/types'
import { formatDate } from '@/lib/format'
import { Avatar, ButtonLink, Card, StatusBadge } from '@/components/ui'

export function LeaseSidePanel({ lease }: { lease: Lease }) {
  return (
    <aside className="min-w-0 space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-ink">司机信息</h3>
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={lease.driver?.name} className="h-10 w-10" />
          <div><p className="text-sm font-medium text-ink">{lease.driver?.name ?? '-'}</p><p className="mt-0.5 text-[11px] text-muted">{lease.driver?.phone ?? '-'}</p></div>
        </div>
        <div className="mt-4 space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-muted">认证状态</span><StatusBadge status={lease.driver?.status} /></div>
          <div className="flex justify-between"><span className="text-muted">驾照到期</span><span className="font-mono text-ink">{formatDate(lease.driver?.license_expiry)}</span></div>
          <div className="flex justify-between"><span className="text-muted">评分</span><span className="font-mono text-ink">{lease.driver?.rating?.toFixed(1) ?? '-'}</span></div>
        </div>
        <ButtonLink to={`/drivers/${lease.driver_id}`} size="md" className="mt-4 w-full">查看司机档案</ButtonLink>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-ink">车辆信息</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <img src={lease.vehicle?.model?.hero_image} alt="" className="h-28 w-full object-cover" loading="lazy" decoding="async" />
          <div className="p-3">
            <p className="font-mono text-sm text-ink">{lease.vehicle?.plate_no}</p>
            <p className="mt-0.5 text-[11px] text-muted">{lease.vehicle?.model?.brand} {lease.vehicle?.model?.name} · {lease.vehicle?.color}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{lease.vehicle?.mileage_km?.toLocaleString('zh-CN')} km</span><StatusBadge status={lease.vehicle?.status} /></div>
          </div>
        </div>
        <ButtonLink to={`/vehicles/${lease.vehicle_id}`} size="md" className="mt-4 w-full">查看车辆档案</ButtonLink>
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-2 text-[11px] leading-5 text-muted"><Receipt size={15} className="mt-0.5 shrink-0 text-accent" />租约创建时会自动生成首期租金账单。收款、逾期和押金退还在财务账单页统一处理。</div>
      </Card>
    </aside>
  )
}