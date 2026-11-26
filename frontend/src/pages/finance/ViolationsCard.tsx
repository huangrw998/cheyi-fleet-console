import { Link } from 'react-router-dom'
import { ShieldWarning } from '@phosphor-icons/react'
import type { Violation } from '@/types'
import { formatDate, formatMoney } from '@/lib/format'
import { Badge, Button, Card, CardToolbar, DataTable, EmptyState, StatusBadge, Td, Th } from '@/components/ui'

export function ViolationsCard({ violations, onHandle, handling }: { violations: Violation[]; onHandle: (id: number) => void; handling: boolean }) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink">违章记录</h2>
          <p className="mt-1 text-xs text-muted">处理违章后会为当前生效租约生成一张待收违章账单。</p>
        </div>
        <Badge tone="warning">{violations.filter((v) => v.status === 'pending').length} 条待处理</Badge>
      </CardToolbar>
      {violations.length === 0 ? <EmptyState icon={<ShieldWarning size={22} />} title="暂无违章" description="记录第一条违章后会出现在这里。" /> : (
        <DataTable>
          <thead><tr><Th>车辆</Th><Th>司机</Th><Th>原因</Th><Th>时间</Th><Th>罚款 / 扣分</Th><Th>状态</Th><Th>操作</Th></tr></thead>
          <tbody>
            {violations.map((violation) => (
              <tr key={violation.id} className="transition hover:bg-card2/40">
                <Td><Link to={`/vehicles/${violation.vehicle_id}`} className="font-mono text-[13px] text-accent hover:underline">{violation.vehicle?.plate_no ?? '-'}</Link></Td>
                <Td className="text-[13px]">{violation.driver?.name ?? '-'}</Td>
                <Td className="text-[13px]">{violation.reason}</Td>
                <Td className="font-mono text-[13px] text-muted">{formatDate(violation.occurred_at)}</Td>
                <Td className="font-mono text-[13px]">{formatMoney(violation.fine_cents)} · {violation.points} 分</Td>
                <Td><StatusBadge status={violation.status} /></Td>
                <Td>
                  {violation.status === 'pending'
                    ? <Button size="sm" variant="soft" loading={handling} onClick={() => onHandle(violation.id)}>处理并生成账单</Button>
                    : <Button size="sm" variant="secondary" disabled>已处理</Button>}
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}