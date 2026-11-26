import { CarProfile, CheckCircle, SteeringWheel, XCircle } from '@phosphor-icons/react'
import type { Lease, LeaseActionKind } from '@/types'
import { daysText, daysUntil, formatDate, formatMoney } from '@/lib/format'
import { Badge, Button, ButtonLink, Card, CopyButton, Money, RichTextViewer, StatusBadge } from '@/components/ui'

export function LeaseHeader({ lease, onAction }: { lease: Lease; onAction: (kind: LeaseActionKind) => void }) {
  const daysLeft = daysUntil(lease.end_date)
  return (
    <Card>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={lease.status} />
            {daysLeft !== null && lease.status === 'active' ? <Badge tone={daysLeft < 0 ? 'danger' : daysLeft <= 7 ? 'warning' : 'neutral'}>{daysLeft < 0 ? `已逾期 ${Math.abs(daysLeft)} 天` : `${daysText(daysLeft)}到期`}</Badge> : null}
          </div>
          <div className="mt-2 flex items-center gap-2"><h1 className="font-mono text-2xl font-semibold tracking-tight text-ink">{lease.lease_no}</h1><CopyButton value={lease.lease_no} label="复制租约号" /></div>
          <p className="mt-1 text-xs text-muted">{formatDate(lease.start_date)} 至 {formatDate(lease.end_date)} · {lease.store?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lease.status === 'pending_sign' ? <Button variant="primary" onClick={() => onAction('sign')}><CheckCircle size={15} /> 签约</Button> : null}
          {lease.status === 'pending_pickup' ? <Button variant="primary" onClick={() => onAction('handover')}><CarProfile size={15} /> 交车</Button> : null}
          {lease.status === 'active' ? <Button variant="primary" onClick={() => onAction('return')}><SteeringWheel size={15} /> 办理退租</Button> : null}
          {['pending_sign', 'pending_pickup'].includes(lease.status) ? <Button variant="secondary" onClick={() => onAction('cancel')}><XCircle size={15} /> 取消</Button> : null}
          <ButtonLink to={`/vehicles/${lease.vehicle_id}`} variant="secondary">车辆档案</ButtonLink>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-line border-t border-line sm:grid-cols-4 sm:divide-y-0">
        <div className="p-4"><p className="text-[10px] text-muted">月租</p><Money cents={lease.monthly_rent_cents} className="mt-1 block text-lg font-semibold text-ink" /></div>
        <div className="p-4"><p className="text-[10px] text-muted">押金</p><Money cents={lease.deposit_cents} className="mt-1 block text-lg font-semibold text-ink" /></div>
        <div className="p-4"><p className="text-[10px] text-muted">司机</p><p className="mt-1 text-sm font-medium text-ink">{lease.driver?.name ?? '-'}</p></div>
        <div className="p-4"><p className="text-[10px] text-muted">车辆</p><p className="mt-1 font-mono text-sm text-ink">{lease.vehicle?.plate_no ?? '-'}</p></div>
      </div>
    </Card>
  )
}

export function LeaseSummaryStats({ lease }: { lease: Lease }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="info-tile"><p className="text-[10px] text-muted">取车里程</p><p className="mt-1 font-mono text-sm text-ink">{lease.pickup_mileage ? `${lease.pickup_mileage.toLocaleString('zh-CN')} km` : '待交车'}</p></div>
      <div className="info-tile"><p className="text-[10px] text-muted">还车里程</p><p className="mt-1 font-mono text-sm text-ink">{lease.return_mileage ? `${lease.return_mileage.toLocaleString('zh-CN')} km` : '待退租'}</p></div>
      <div className="info-tile"><p className="text-[10px] text-muted">备注</p><div className="mt-1 max-h-20 overflow-y-auto scrollbar-thin"><RichTextViewer html={lease.note} /></div></div>
    </div>
  )
}

export function formatRent(lease: Lease) {
  return formatMoney(lease.monthly_rent_cents)
}