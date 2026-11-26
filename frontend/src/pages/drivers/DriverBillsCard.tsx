import type { Bill } from '@/types'
import { billTypeLabel, formatDate } from '@/lib/format'
import { Card, CardToolbar, DataTable, Money, StatusBadge, Td, Th } from '@/components/ui'

export function DriverBillsCard({ bills }: { bills: Bill[] }) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar><h2 className="text-base font-semibold tracking-tight text-ink">账单记录</h2><p className="mt-1 text-xs text-muted">租金、押金与违章代缴</p></CardToolbar>
      <DataTable>
        <thead><tr><Th>账单号</Th><Th>类型</Th><Th>金额</Th><Th>到期</Th><Th>状态</Th></tr></thead>
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