import { FilterBar, SearchInput, Select } from '@/components/ui'
import type { Store } from '@/types'

export function VehicleFilters({
  q,
  status,
  storeId,
  stores,
  total,
  onSearch,
  onUpdate,
}: {
  q: string
  status: string
  storeId: string
  stores: Store[]
  total: number
  onSearch: (value: string) => void
  onUpdate: (key: string, value: string) => void
}) {
  return (
    <FilterBar right={<p className="text-[11px] text-muted"><span className="font-mono text-ink">{total}</span> 台车</p>}>
        <SearchInput value={q} onChange={onSearch} placeholder="搜索车牌或 VIN" className="lg:w-72" size="sm" debounce={250} />
        <Select value={status} onChange={(value) => onUpdate('status', value)} className="w-36" size="sm" aria-label="车辆状态">
          <option value="all">全部状态</option>
          <option value="available">待租</option>
          <option value="rented">在租</option>
          <option value="reserved">已锁定</option>
          <option value="maintenance">维保中</option>
          <option value="dispatch">调拨中</option>
        </Select>
        <Select value={storeId} onChange={(value) => onUpdate('store', value)} className="w-40" size="sm" aria-label="门店">
          <option value="">全部门店</option>
          {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </Select>
    </FilterBar>
  )
}
