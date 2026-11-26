import type { InsurancePolicy, Violation } from '@/types'
import { formatDate, formatMoney } from '@/lib/format'
import { Badge, SectionHeader, StatusBadge } from '@/components/ui'

export function VehicleInsuranceTab({ insurance, violations }: { insurance: InsurancePolicy[]; violations: Violation[] }) {
  return (
    <div className="grid gap-5 p-5 lg:grid-cols-2">
      <div>
        <SectionHeader title="保险保单" description={`${insurance.length} 份保单`} />
        <div className="mt-3 space-y-2">
          {insurance.length === 0 ? <p className="py-8 text-center text-xs text-muted">暂无保单</p> : insurance.map((policy) => (
            <div key={policy.id} className="info-tile">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-ink">{policy.provider}</p>
                <Badge tone={policy.status === 'expiring' ? 'warning' : 'success'}>{policy.status === 'expiring' ? '即将到期' : '有效'}</Badge>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted">{policy.policy_no}</p>
              <p className="mt-2 text-[11px] text-muted">{policy.type} · 保费 {formatMoney(policy.premium_cents)}</p>
              <p className="mt-1 text-[11px] text-muted">有效期 {formatDate(policy.start_date)} - {formatDate(policy.end_date)}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionHeader title="违章记录" description={`${violations.length} 条记录`} />
        <div className="mt-3 space-y-2">
          {violations.length === 0 ? <p className="py-8 text-center text-xs text-muted">暂无违章</p> : violations.map((violation) => (
            <div key={violation.id} className="info-tile">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-ink">{violation.reason}</p>
                <StatusBadge status={violation.status} />
              </div>
              <p className="mt-1 text-[10px] text-muted">{formatDate(violation.occurred_at)} · {violation.location}</p>
              <p className="mt-2 text-[11px] text-muted">罚款 {formatMoney(violation.fine_cents)} · {violation.points} 分</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}