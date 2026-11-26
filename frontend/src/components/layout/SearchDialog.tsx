import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CarProfile, SteeringWheel, Users } from '@phosphor-icons/react'
import { searchAll } from '@/api/search'
import { useDebounce } from '@/hooks/useDebounce'
import { Modal, SearchInput } from '@/components/ui'

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 220)
  const navigate = useNavigate()
  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchAll(debounced),
    enabled: open && debounced.trim().length > 0,
    staleTime: 30_000,
  })
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])
  const results = data?.data
  const hasResults = Boolean(results && (results.models.length || results.vehicles.length || results.drivers.length || results.leases.length))
  const go = (to: string) => {
    onClose()
    navigate(to)
  }
  return (
    <Modal open={open} onClose={onClose} title="全局搜索" description="搜索车型、车辆、司机或租约" width="max-w-2xl">
      <SearchInput value={query} onChange={setQuery} placeholder="输入车型、车牌、司机姓名或租约号" size="lg" autoFocus />
      <div className="mt-4 max-h-[50dvh] space-y-4 overflow-y-auto scrollbar-thin">
        {query.trim() === '' ? (
          <p className="px-1 py-6 text-center text-xs text-muted">输入关键词开始搜索，支持车型、车牌、司机和租约号。</p>
        ) : isFetching ? (
          <p className="px-1 py-6 text-center text-xs text-muted">正在搜索…</p>
        ) : !hasResults ? (
          <p className="px-1 py-6 text-center text-xs text-muted">没有找到匹配结果。</p>
        ) : (
          <>
            {results?.models.length ? (
              <section>
                <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted">车型</p>
                {results.models.map((m) => (
                  <button key={m.id} onClick={() => go(`/models/${m.slug}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-card2">
                    <img src={m.hero_image} alt="" className="h-9 w-12 rounded object-cover" loading="lazy" decoding="async" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-ink">{m.brand} {m.name}</span>
                      <span className="block text-[10px] text-muted">{m.body_type} · {m.range_km}km</span>
                    </span>
                  </button>
                ))}
              </section>
            ) : null}
            {results?.vehicles.length ? (
              <section>
                <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted">车辆</p>
                {results.vehicles.map((v) => (
                  <button key={v.id} onClick={() => go(`/vehicles/${v.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-card2">
                    <CarProfile size={18} className="text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs text-ink">{v.plate_no}</span>
                      <span className="block text-[10px] text-muted">{v.model?.brand} {v.model?.name} · {v.store?.name}</span>
                    </span>
                  </button>
                ))}
              </section>
            ) : null}
            {results?.drivers.length ? (
              <section>
                <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted">司机</p>
                {results.drivers.map((d) => (
                  <button key={d.id} onClick={() => go(`/drivers/${d.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-card2">
                    <Users size={18} className="text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-ink">{d.name}</span>
                      <span className="block text-[10px] text-muted">{d.phone} · {d.status}</span>
                    </span>
                  </button>
                ))}
              </section>
            ) : null}
            {results?.leases.length ? (
              <section>
                <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted">租约</p>
                {results.leases.map((l) => (
                  <button key={l.id} onClick={() => go(`/leases/${l.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-card2">
                    <SteeringWheel size={18} className="text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs text-ink">{l.lease_no}</span>
                      <span className="block text-[10px] text-muted">{l.driver?.name} · {l.vehicle?.plate_no}</span>
                    </span>
                  </button>
                ))}
              </section>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  )
}