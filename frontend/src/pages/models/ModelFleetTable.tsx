import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import type { Vehicle } from '@/types'
import { formatDate } from '@/lib/format'
import { ButtonLink, Card, CardToolbar, DataTable, StatusBadge, Td, Th } from '@/components/ui'

export function ModelFleetTable({ vehicles, availableCount, slug }: { vehicles: Vehicle[]; availableCount: number; slug: string }) {
  return (
    <Card id="model-vehicles" className="overflow-hidden">
      <CardToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold tracking-tight text-ink">在库车辆</h2><p className="mt-1 text-xs text-muted">{vehicles.length} 台 · {availableCount} 台可立即出租</p></div>
        <ButtonLink to={`/leases/new?model=${slug}`} variant="soft" size="sm">用这款车创建租约 <ArrowRight size={13} /></ButtonLink>
      </CardToolbar>
      <DataTable>
        <thead><tr><Th>车牌</Th><Th>门店</Th><Th>状态</Th><Th>里程</Th><Th>保险到期</Th><Th /></tr></thead>
        <tbody>
          {vehicles.slice(0, 10).map((vehicle) => (
            <tr key={vehicle.id} className="transition hover:bg-card2/40">
              <Td className="font-mono text-[13px]">{vehicle.plate_no}</Td>
              <Td className="text-[13px] text-muted">{vehicle.store?.name ?? '-'}</Td>
              <Td><StatusBadge status={vehicle.status} /></Td>
              <Td className="font-mono text-[13px]">{vehicle.mileage_km.toLocaleString('zh-CN')} km</Td>
              <Td className="font-mono text-[13px] text-muted">{formatDate(vehicle.insurance_expiry)}</Td>
              <Td className="text-right"><Link to={`/vehicles/${vehicle.id}`} className="text-[13px] text-accent hover:underline">详情</Link></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Card>
  )
}