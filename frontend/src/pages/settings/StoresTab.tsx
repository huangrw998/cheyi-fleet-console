import type { Store, Vehicle } from '@/types'
import { Badge, Button, Card } from '@/components/ui'

export function StoresTab({ stores, vehicles, onEdit }: { stores: Store[]; vehicles: Vehicle[]; onEdit: (store: Store) => void }) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink">门店与容量</h2>
          <p className="mt-1 text-xs text-muted">容量用于计算门店出租率和调度建议。</p>
        </div>
        <Badge tone="neutral">{stores.length} 个门店</Badge>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {stores.map((store) => (
          <Card key={store.id} className="overflow-hidden bg-card2/20 shadow-none">
            <div className="relative h-28 overflow-hidden">
              <img src={store.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                <div>
                  <p className="text-sm font-medium text-white">{store.name}</p>
                  <p className="mt-0.5 text-[10px] text-white/65">{store.district} · {store.address}</p>
                </div>
                <Badge tone="success">{store.status === 'active' ? '营业中' : store.status}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-4 text-[11px] text-muted">
                <span>容量 <span className="font-mono text-ink">{store.capacity}</span></span>
                <span>在营车辆 <span className="font-mono text-ink">{vehicles.filter((v) => v.store_id === store.id).length}</span></span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onEdit(store)}>编辑</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}