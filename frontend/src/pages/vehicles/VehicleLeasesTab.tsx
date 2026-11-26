import { Link } from 'react-router-dom'
import type { Lease } from '@/types'
import { formatDate } from '@/lib/format'
import { DataTable, Money, StatusBadge, Td, Th } from '@/components/ui'

export function VehicleLeasesTab({ leases }: { leases: Lease[] }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-xs text-muted">共 {leases.length} 条租约记录</p>
        <Link to="/leases/new" className="text-xs text-accent hover:underline">新建租约</Link>
      </div>
      <DataTable>
        <thead><tr><Th>租约号</Th><Th>司机</Th><Th>租期</Th><Th>月租</Th><Th>状态</Th><Th /></tr></thead>
        <tbody>
          {leases.map((lease) => (
            <tr key={lease.id} className="transition hover:bg-card2/40">
              <Td className="font-mono text-[13px]">{lease.lease_no}</Td>
              <Td className="text-[13px]">{lease.driver?.name ?? '-'}</Td>
              <Td className="font-mono text-[13px] text-muted">{formatDate(lease.start_date)} - {formatDate(lease.end_date)}</Td>
              <Td><Money cents={lease.monthly_rent_cents} className="text-[13px]" /></Td>
              <Td><StatusBadge status={lease.status} /></Td>
              <Td className="text-right"><Link to={`/leases/${lease.id}`} className="text-[13px] text-accent hover:underline">详情</Link></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}