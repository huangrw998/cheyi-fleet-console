import { Link } from 'react-router-dom'
import { Users } from '@phosphor-icons/react'
import type { Driver, ListResponse } from '@/types'
import { daysText, daysUntil, formatDate } from '@/lib/format'
import { Avatar, DataTable, EmptyState, ErrorState, Pagination, StatusBadge, TableSkeleton, Td, Th } from '@/components/ui'

export function DriversTable({
  data,
  loading,
  error,
  onRetry,
  page,
  pageSize,
  onPage,
  onPageSize,
}: {
  data?: ListResponse<Driver>
  loading: boolean
  error: boolean
  onRetry: () => void
  page: number
  pageSize: number
  onPage: (page: number) => void
  onPageSize: (size: number) => void
}) {
  if (loading) return <TableSkeleton rows={8} cols={6} />
  if (error) return <ErrorState message="司机列表加载失败" onRetry={onRetry} />
  if (!data?.data.length) return <EmptyState icon={<Users size={22} />} title="没有匹配的司机" description="调整筛选条件，或新增一位司机。" />

  return (
    <>
      <DataTable>
        <thead><tr><Th>司机</Th><Th>状态</Th><Th>当前车辆</Th><Th>当前租约</Th><Th>评分</Th><Th>驾照到期</Th><Th /></tr></thead>
        <tbody>
          {data.data.map((driver) => {
            const days = daysUntil(driver.license_expiry)
            return (
              <tr key={driver.id} className="transition hover:bg-card2/40">
                <Td>
                  <Link to={`/drivers/${driver.id}`} className="group flex items-center gap-3">
                    <Avatar name={driver.name} />
                    <span>
                      <span className="block text-xs font-medium text-ink group-hover:text-accent">{driver.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-muted">{driver.phone}</span>
                    </span>
                  </Link>
                </Td>
                <Td><StatusBadge status={driver.status} /></Td>
                <Td className="font-mono text-xs">{driver.current_vehicle?.plate_no ?? '-'}</Td>
                <Td className="text-xs text-muted">{driver.current_lease ? `${formatDate(driver.current_lease.start_date)} 起` : '-'}</Td>
                <Td className="font-mono text-xs">{driver.rating.toFixed(1)}</Td>
                <Td>
                  <span className={`font-mono text-xs ${days !== null && days <= 30 ? 'text-warning' : 'text-muted'}`}>{formatDate(driver.license_expiry)}</span>
                  <span className="ml-1 text-[10px] text-muted">{days !== null ? daysText(days) : ''}</span>
                </Td>
                <Td><Link to={`/drivers/${driver.id}`} className="text-xs text-accent hover:underline">详情</Link></Td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
      <Pagination page={page} pageSize={pageSize} total={data.meta.total} onPage={onPage} onPageSize={onPageSize} />
    </>
  )
}