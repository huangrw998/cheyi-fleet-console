import { Card, SearchInput, Select, Tabs } from '@/components/ui'
import type { ModelFiltersData } from '@/types'

const bodyTabs = [
  { value: 'all', label: '全部' },
  { value: 'sedan', label: '轿车' },
  { value: 'suv', label: 'SUV' },
  { value: 'mpv', label: 'MPV' },
  { value: 'hatchback', label: '两厢' },
  { value: 'wagon', label: '旅行车' },
]

export function ModelFilters({
  q,
  body,
  brand,
  sort,
  filters,
  onUpdate,
}: {
  q: string
  body: string
  brand: string
  sort: string
  filters?: ModelFiltersData
  onUpdate: (key: string, value: string) => void
}) {
  return (
    <Card className="p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={q} onChange={(value) => onUpdate('q', value)} placeholder="搜索品牌或车型，如秦PLUS、AION" className="lg:w-80" size="sm" debounce={250} />
        <Tabs value={body} onChange={(value) => onUpdate('body', value)} items={bodyTabs} className="flex-1" />
        <div className="flex gap-2">
          <Select value={brand} onChange={(value) => onUpdate('brand', value)} className="w-36" size="sm" aria-label="品牌">
            <option value="all">全部品牌</option>
            {filters?.brands.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select value={sort} onChange={(value) => onUpdate('sort', value)} className="w-40" size="sm" aria-label="排序">
            <option value="recommended">推荐排序</option>
            <option value="rent_asc">月租从低到高</option>
            <option value="rent_desc">月租从高到低</option>
            <option value="range_desc">续航优先</option>
            <option value="utilization_desc">出租率优先</option>
          </Select>
        </div>
      </div>
    </Card>
  )
}
