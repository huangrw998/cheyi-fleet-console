import { IdentificationCard } from '@phosphor-icons/react'
import type { Driver, Lease } from '@/types'
import { daysText, daysUntil, formatDate } from '@/lib/format'
import { ButtonLink, Card, Progress, StatusBadge } from '@/components/ui'

export function DriverDocsCard({ driver, activeLease }: { driver: Driver; activeLease?: Lease }) {
  const licenseDays = daysUntil(driver.license_expiry)
  return (
    <aside className="min-w-0 space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-ink">证件信息</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-[11px]"><IdentificationCard size={16} className="text-muted" /><span className="text-muted">身份证号</span><span className="ml-auto font-mono text-ink">{driver.id_card_no ? driver.id_card_no.replace(/^(.{6}).*(.{4})$/, '$1********$2') : '-'}</span></div>
          <div className="flex items-center gap-2 text-[11px]"><IdentificationCard size={16} className="text-muted" /><span className="text-muted">驾照号</span><span className="ml-auto font-mono text-ink">{driver.license_no || '-'}</span></div>
          <div className="info-tile">
            <div className="flex items-center justify-between text-[11px]"><span className="text-muted">驾照到期</span><span className={`font-mono ${licenseDays !== null && licenseDays <= 30 ? 'text-warning' : 'text-ink'}`}>{formatDate(driver.license_expiry)}</span></div>
            <Progress className="mt-2" value={licenseDays !== null ? Math.max(0, Math.min(100, (licenseDays / 365) * 100)) : 0} tone={licenseDays !== null && licenseDays <= 30 ? 'warning' : 'success'} />
            <p className="mt-1.5 text-[10px] text-muted">{licenseDays !== null ? daysText(licenseDays) : '-'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-ink">当前状态</h3>
        {activeLease ? (
          <div className="mt-4 info-tile">
            <div className="flex items-center justify-between"><p className="text-xs font-medium text-ink">{activeLease.vehicle?.plate_no}</p><StatusBadge status={activeLease.status} /></div>
            <p className="mt-1 text-[10px] text-muted">{activeLease.vehicle?.model?.brand} {activeLease.vehicle?.model?.name}</p>
            <p className="mt-2 text-[10px] text-muted">租期 {formatDate(activeLease.start_date)} - {formatDate(activeLease.end_date)}</p>
            <ButtonLink to={`/leases/${activeLease.id}`} variant="secondary" size="sm" className="mt-3 w-full">查看租约</ButtonLink>
          </div>
        ) : <p className="mt-4 rounded-lg border border-line bg-card2/30 px-3 py-6 text-center text-xs text-muted">当前没有生效租约，可创建新租约。</p>}
      </Card>
    </aside>
  )
}