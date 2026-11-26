import type { Driver } from '@/types'
import { formatDate, statusLabel, statusTone } from '@/lib/format'
import { Avatar, Badge, Card, CardToolbar, EmptyState, ErrorState, SearchInput, Skeleton } from '@/components/ui'
import { Check, User } from '@phosphor-icons/react'

export function DriverStep({
  drivers,
  driverId,
  search,
  onSearch,
  onSelect,
  loading,
  error,
  onRetry,
}: {
  drivers: Driver[]
  driverId: number | null
  search: string
  onSearch: (value: string) => void
  onSelect: (id: number) => void
  loading: boolean
  error: boolean
  onRetry: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold text-ink">选择司机</h2><p className="mt-1 text-xs text-muted">只显示已认证且没有生效租约的司机。</p></div>
          <SearchInput value={search} onChange={onSearch} placeholder="搜索姓名或手机号" className="w-full sm:w-72" />
        </div>
      </CardToolbar>
      {loading ? (
        <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : error ? <ErrorState message="司机列表加载失败" onRetry={onRetry} /> : drivers.length === 0 ? (
        <EmptyState icon={<User size={22} />} title="没有可租司机" description="所有认证司机都已有生效租约，或没有匹配搜索条件。" />
      ) : (
        <div className="max-h-[560px] divide-y divide-line overflow-y-auto scrollbar-thin">
          {drivers.map((driver) => {
            const active = driverId === driver.id
            return (
              <button key={driver.id} onClick={() => onSelect(driver.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active ? 'bg-accent-soft' : 'hover:bg-card2/50'}`}>
                <Avatar name={driver.name} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">{driver.name}</span>
                    <Badge tone={statusTone(driver.status)}>{statusLabel(driver.status)}</Badge>
                    <span className="font-mono text-[10px] text-muted">{driver.rating.toFixed(1)} 分</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{driver.phone} · 驾照到期 {formatDate(driver.license_expiry)}</p>
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