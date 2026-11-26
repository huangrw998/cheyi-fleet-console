import { Link } from 'react-router-dom'

export function BrandPanel({ stats, online = true }: { stats?: { vehicles: number; drivers: number; active_leases: number; stores: number }; online?: boolean }) {
  return (
    <section className="relative hidden overflow-hidden bg-deep lg:block">
      <img src="/media/models/byd-qin-plus-ev/wide.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" loading="eager" decoding="async" fetchPriority="high" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,8,11,0.96)_0%,rgba(5,8,11,0.72)_45%,rgba(5,8,11,0.2)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-on-accent">驰</span>
          <div><p className="text-base font-semibold tracking-tight text-white">驰驿 CHEYI</p><p className="text-[10px] tracking-[0.18em] text-white/55">FLEET CONSOLE</p></div>
        </div>

        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">把车、司机和租金<br />管在同一条线上</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">从车型展厅到租约交付，从租金账单到维保保险，驰驿把网约车租赁的日常运营收进一个清晰的工作台。</p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {[
              { label: '车队车辆', value: stats?.vehicles ?? '—' },
              { label: '司机总数', value: stats?.drivers ?? '—' },
              { label: '活跃租约', value: stats?.active_leases ?? '—' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"><p className="font-mono text-xl font-semibold text-white">{item.value}</p><p className="mt-1 text-[10px] text-white/50">{item.label}</p></div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/40"><span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-success' : 'bg-danger'}`} />{online ? '服务在线' : '服务异常'} · {stats ? `多城运营 · ${stats.stores} 个门店` : '运营数据加载中'}</span><Link to="/credits" className="transition hover:text-white/80">素材与许可</Link></div>
      </div>
    </section>
  )
}