import { Link } from 'react-router-dom'
import { CarProfile, Check } from '@phosphor-icons/react'
import type { Vehicle } from '@/types'
import { formatMoney } from '@/lib/format'
import { Badge, Card, CardToolbar, EmptyState, ErrorState, SearchInput, Skeleton } from '@/components/ui'

export function VehicleStep({
  vehicles,
  vehicleId,
  modelName,
  modelSlug,
  search,
  onSearch,
  onSelect,
  loading,
  error,
  onRetry,
}: {
  vehicles: Vehicle[]
  vehicleId: number | null
  modelName: string
  modelSlug: string
  search: string
  onSearch: (value: string) => void
  onSelect: (vehicle: Vehicle) => void
  loading: boolean
  error: boolean
  onRetry: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">选择车辆</h2>
            <p className="mt-1 text-xs text-muted">
              {modelName ? `已按车型「${modelName}」筛选。` : '只显示当前可立即出租的车辆。'}
              {modelSlug ? <Link to="/leases/new" className="ml-2 text-accent hover:underline">清除车型筛选</Link> : null}
            </p>
          </div>
          <SearchInput value={search} onChange={onSearch} placeholder="搜索车牌或车型" className="w-full sm:w-72" />
        </div>
      </CardToolbar>
      {loading ? (
        <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : error ? <ErrorState message="车辆列表加载失败" onRetry={onRetry} /> : vehicles.length === 0 ? (
        <EmptyState icon={<CarProfile size={22} />} title="没有可租车辆" description={modelSlug ? '该车型当前没有待租车辆，可以清除筛选选择其他车型。' : '当前没有待租车辆，请先处理维保或调拨。'} />
      ) : (
        <div className="max-h-[560px] divide-y divide-line overflow-y-auto scrollbar-thin">
          {vehicles.map((vehicle) => {
            const active = vehicleId === vehicle.id
            return (
              <button key={vehicle.id} onClick={() => onSelect(vehicle)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active ? 'bg-accent-soft' : 'hover:bg-card2/50'}`}>
                <img src={vehicle.model?.hero_image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" loading="lazy" decoding="async" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink">{vehicle.plate_no}</span>
                    <Badge tone="success">待租</Badge>
                    <span className="text-[10px] text-muted">{vehicle.store?.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{vehicle.model?.brand} {vehicle.model?.name} · {vehicle.mileage_km.toLocaleString('zh-CN')} km</p>
                  <p className="mt-1 text-[10px] text-muted">月租 {formatMoney(vehicle.model?.monthly_rent_cents ?? 0)} · 押金 {formatMoney(vehicle.model?.deposit_cents ?? 0)}</p>
                </div>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-accent bg-accent text-on-accent' : 'border-line'}`}>{active ? <Check size={12} weight="bold" /> : null}</span>
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}