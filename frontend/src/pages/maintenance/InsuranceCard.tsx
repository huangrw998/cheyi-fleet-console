import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react'
import type { InsurancePolicy } from '@/types'
import { daysText, daysUntil, formatDate } from '@/lib/format'
import { Badge, Card, CardToolbar, DataTable, EmptyState, Money, Td, Th } from '@/components/ui'

export function InsuranceCard({ insurance }: { insurance: InsurancePolicy[] }) {
  const expiring = insurance.filter((p) => { const d = daysUntil(p.end_date); return d !== null && d <= 30 }).length
  return (
    <Card className="overflow-hidden">
      <CardToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold tracking-tight text-ink">保险到期</h2><p className="mt-1 text-xs text-muted">按到期日排序，30 天内到期会在总览提醒。</p></div>
        <Badge tone="warning">{expiring} 份即将到期</Badge>
      </CardToolbar>
      {insurance.length === 0 ? <EmptyState icon={<ShieldCheck size={22} />} title="暂无保单" description="保单数据会出现在这里。" /> : (
        <DataTable>
          <thead><tr><Th>车辆</Th><Th>承保公司</Th><Th>保单号</Th><Th>险种</Th><Th>保费</Th><Th>到期日</Th><Th>状态</Th></tr></thead>
          <tbody>
            {insurance.slice(0, 20).map((policy) => {
              const days = daysUntil(policy.end_date)
              return (
                <tr key={policy.id} className="transition hover:bg-card2/40">
                  <Td><Link to={`/vehicles/${policy.vehicle_id}`} className="font-mono text-xs text-accent hover:underline">{policy.vehicle?.plate_no ?? '-'}</Link></Td>
                  <Td className="text-xs">{policy.provider}</Td>
                  <Td className="font-mono text-[10px] text-muted">{policy.policy_no}</Td>
                  <Td className="text-xs text-muted">{policy.type}</Td>
                  <Td><Money cents={policy.premium_cents} className="text-xs" /></Td>
                  <Td><span className={`font-mono text-xs ${days !== null && days <= 30 ? 'text-warning' : 'text-muted'}`}>{formatDate(policy.end_date)}</span><span className="ml-1 text-[10px] text-muted">{days !== null ? daysText(days) : ''}</span></Td>
                  <Td><Badge tone={days !== null && days <= 30 ? 'warning' : 'success'}>{days !== null && days <= 30 ? '即将到期' : '有效'}</Badge></Td>
                </tr>
              )
            })}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}