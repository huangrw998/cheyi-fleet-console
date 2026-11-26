import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import type { Lease } from '@/types'
import { formatDate } from '@/lib/format'
import { Card, CardToolbar, DataTable, Money, StatusBadge, Td, Th } from '@/components/ui'

export function DriverLeasesCard({ leases }: { leases: Lease[] }) {
  const active = leases.find((lease) => ['active', 'pending_pickup', 'pending_sign'].includes(lease.status))
  return (
    <Card className="overflow-hidden">
      <CardToolbar className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-ink">租约历史</h2><p className="mt-1 text-xs text-muted">共 {leases.length} 份租约</p></div>
        {active ? <Link to={`/leases/${active.id}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">当前租约 <ArrowRight size={13} /></Link> : null}
      </CardToolbar>
      <DataTable>
        <thead><tr><Th>租约号</Th><Th>车辆</Th><Th>租期</Th><Th>月租</Th><Th>状态</Th></tr></thead>
        <tbody>
          {leases.map((lease) => (
            <tr key={lease.id} className="transition hover:bg-card2/40">
              <Td><Link to={`/leases/${lease.id}`} className="font-mono text-xs text-accent hover:underline">{lease.lease_no}</Link></Td>
              <Td className="font-mono text-xs">{lease.vehicle?.plate_no ?? '-'}</Td>
              <Td className="font-mono text-xs text-muted">{formatDate(lease.start_date)} - {formatDate(lease.end_date)}</Td>
              <Td><Money cents={lease.monthly_rent_cents} className="text-xs" /></Td>
              <Td><StatusBadge status={lease.status} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Card>
  )
}