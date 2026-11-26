import type { Violation } from '@/types'
import { formatDate, formatMoney } from '@/lib/format'
import { Card, SectionHeader, StatusBadge } from '@/components/ui'

export function DriverViolationsCard({ violations }: { violations: Violation[] }) {
  return (
    <Card className="p-5">
      <SectionHeader title="违章记录" description="与当前司机关联的违章" />
      <div className="mt-3 space-y-2">
        {violations.length === 0 ? <p className="py-6 text-center text-xs text-muted">暂无违章记录</p> : violations.map((violation) => (
          <div key={violation.id} className="flex flex-wrap items-center justify-between gap-2 info-tile-compact">
            <div><p className="text-xs font-medium text-ink">{violation.reason}</p><p className="mt-0.5 text-[10px] text-muted">{formatDate(violation.occurred_at)} · {violation.location} · {violation.vehicle?.plate_no}</p></div>
            <div className="flex items-center gap-2"><span className="font-mono text-[11px] text-muted">{formatMoney(violation.fine_cents)} · {violation.points} 分</span><StatusBadge status={violation.status} /></div>
          </div>
        ))}
      </div>
    </Card>
  )
}