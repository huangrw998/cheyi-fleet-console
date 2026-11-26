import { Link } from 'react-router-dom'
import { CarProfile } from '@phosphor-icons/react'
import type { ListResponse, Vehicle } from '@/types'
import { daysText, formatDate } from '@/lib/format'
import { DataTable, EmptyState, ErrorState, Money, Pagination, StatusBadge, TableSkeleton, Td, Th } from '@/components/ui'

export function VehiclesTable({
  data,
  loading,
  error,
  onRetry,
  page,
  pageSize,
  onPage,
  onPageSize,
}: {
  data?: ListResponse<Vehicle>
  loading: boolean
  error: boolean
  onRetry: () => void
  page: number
  pageSize: number
  onPage: (page: number) => void
  onPageSize: (size: number) => void
}) {
  if (loading) return <TableSkeleton rows={8} cols={7} />
  if (error) return <ErrorState message="车辆列表加载失败" onRetry={onRetry} />
  if (!data?.data.length) return <EmptyState icon={<CarProfile size={22} />} title="没有匹配的车辆" description="调整筛选条件或新增一台车辆。" />

  return (
    <>
      <DataTable>
        <thead>
          <tr><Th>车牌 / 车型</Th><Th>门店</Th><Th>状态</Th><Th>月租</Th><Th>里程</Th><Th>保险到期</Th><Th>操作</Th></tr>
        </thead>
        <tbody>
          {data.data.map((vehicle) => {
            const days = vehicle.insurance_expiry ? Math.ceil((new Date(vehicle.insurance_expiry).getTime() - Date.now()) / 86400000) : null
            return (
              <tr key={vehicle.id} className="transition hover:bg-card2/40">
                <Td>
                  <Link to={`/vehicles/${vehicle.id}`} className="group flex items-center gap-3">
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-card2 font-mono text-[9px] text-muted">{vehicle.plate_no.slice(-4)}</span>
                    <span className="min-w-0">
                      <span className="block font-mono text-xs text-ink group-hover:text-accent">{vehicle.plate_no}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{vehicle.model?.brand} {vehicle.model?.name}</span>
                    </span>
                  </Link>
                </Td>
                <Td className="text-[13px] text-muted">{vehicle.store?.name ?? '-'}</Td>
                <Td><StatusBadge status={vehicle.status} /></Td>
                <Td><Money cents={vehicle.model?.monthly_rent_cents ?? 0} className="text-[13px]" /></Td>
                <Td className="font-mono text-[13px]">{vehicle.mileage_km.toLocaleString('zh-CN')} km</Td>
                <Td>
                  <span className={`font-mono text-xs ${days !== null && days <= 30 ? 'text-warning' : 'text-muted'}`}>{formatDate(vehicle.insurance_expiry)}</span>
                  <span className="ml-1 text-xs text-muted">{days !== null ? daysText(days) : ''}</span>
                </Td>
                <Td><Link to={`/vehicles/${vehicle.id}`} className="text-[13px] text-accent hover:underline">详情</Link></Td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
      <Pagination page={page} pageSize={pageSize} total={data.meta.total} onPage={onPage} onPageSize={onPageSize} />
    </>
  )
}