import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import type { Bill } from '@/types'
import { billTypeLabel, formatDate } from '@/lib/format'
import { Card, CardToolbar, DataTable, Money, StatusBadge, Td, Th } from '@/components/ui'

export function LeaseBillsCard({ bills }: { bills: Bill[] }) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-ink">账单记录</h2><p className="mt-1 text-xs text-muted">{bills.length} 期账单</p></div>
        <Link to="/finance" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">去财务处理 <ArrowRight size={13} /></Link>
      </CardToolbar>
      <DataTable>
        <thead><tr><Th>账单号</Th><Th>类型</Th><Th>金额</Th><Th>到期日</Th><Th>状态</Th></tr></thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id} className="transition hover:bg-card2/40">
              <Td className="font-mono text-xs">{bill.bill_no}</Td>
              <Td className="text-xs">{billTypeLabel(bill.type)}</Td>
              <Td><Money cents={bill.amount_cents} className="text-xs" /></Td>
              <Td className="font-mono text-xs text-muted">{formatDate(bill.due_date)}</Td>
              <Td><StatusBadge status={bill.status} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Card>
  )
}