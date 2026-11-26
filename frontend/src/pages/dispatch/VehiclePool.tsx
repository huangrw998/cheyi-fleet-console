import { Truck } from '@phosphor-icons/react'
import type { Vehicle } from '@/types'
import { Button, Card, CardToolbar, EmptyState } from '@/components/ui'

export function VehiclePool({ pool, onDispatch }: { pool: Vehicle[]; onDispatch: (vehicle: Vehicle) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar><h2 className="text-base font-semibold text-ink">可调拨车辆池</h2><p className="mt-1 text-xs text-muted">当前状态为待租的车辆。</p></CardToolbar>
      <div className="max-h-[420px] divide-y divide-line overflow-y-auto scrollbar-thin">
        {pool.length === 0 ? <EmptyState icon={<Truck size={22} />} title="暂无可调拨车辆" description="待租车辆会出现在这里。" /> : pool.map((vehicle) => (
          <div key={vehicle.id} className="flex items-center gap-3 px-4 py-3">
            <img src={vehicle.model?.hero_image} alt="" className="h-11 w-14 rounded-lg object-cover" loading="lazy" decoding="async" />
            <div className="min-w-0 flex-1"><p className="font-mono text-xs text-ink">{vehicle.plate_no}</p><p className="mt-0.5 truncate text-[10px] text-muted">{vehicle.model?.brand} {vehicle.model?.name} · {vehicle.store?.name}</p></div>
            <Button size="sm" variant="secondary" onClick={() => onDispatch(vehicle)}>调拨</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}