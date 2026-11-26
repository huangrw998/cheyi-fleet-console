import { useNavigate } from 'react-router-dom'
import { ArrowRight, Cube } from '@phosphor-icons/react'
import type { DashboardData } from '@/types'
import { formatMoney, formatPercent } from '@/lib/format'
import { Badge, Button } from '@/components/ui'

export function DashboardHero({ hero, activeLeases, utilization }: { hero?: DashboardData['featured_models'][number]; activeLeases: number; utilization: number }) {
  const navigate = useNavigate()
  const heroImage = hero?.hero_image ?? '/media/models/byd-qin-plus-ev/wide.webp'
  return (
    <section className="relative overflow-hidden rounded-xl border border-line bg-deep shadow-card">
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" loading="eager" decoding="async" fetchPriority="high" />
      <div className="absolute inset-0 hero-scrim" />
      <div className="relative z-10 flex min-h-[360px] flex-col justify-between gap-8 p-5 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent" className="border-white/15 bg-white/10 text-white">本周主力车型</Badge>
          {hero?.model_3d_key ? <Badge className="border-white/15 bg-white/10 text-white/85"><Cube size={12} /> 支持 3D 看车</Badge> : null}
        </div>
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-white/60">{hero?.brand ?? '比亚迪'} · {hero?.body_type === 'suv' ? 'SUV' : '轿车'}</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">{hero?.name ?? '秦PLUS EV'}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            {hero ? `${hero.fleet_active} 台在租，${hero.fleet_total} 台在营。城市通勤与网约车运营的主力车型，租金和维保成本都更可控。` : '车队主力车型，适合城市通勤与网约车运营。'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => navigate(`/models/${hero?.slug ?? 'byd-qin-plus-ev'}`)}>查看车型 <ArrowRight size={15} /></Button>
            {hero?.available_count ? (
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={() => navigate(`/leases/new?model=${hero.slug}`)}>以此车型建租约</Button>
            ) : (
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={() => navigate('/models')}>查看其他车型</Button>
            )}
          </div>
        </div>
        <div className="grid max-w-xl grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/15"><p className="font-mono text-xl font-semibold text-white">{hero?.fleet_active ?? activeLeases}</p><p className="mt-1 text-[10px] text-white/50">在租车辆</p></div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/15"><p className="font-mono text-xl font-semibold text-white">{formatPercent(hero?.utilization ?? utilization)}</p><p className="mt-1 text-[10px] text-white/50">车型出租率</p></div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/15"><p className="font-mono text-xl font-semibold text-white">{hero ? formatMoney(hero.monthly_rent_cents, true) : '-'}</p><p className="mt-1 text-[10px] text-white/50">月租起</p></div>
        </div>
      </div>
    </section>
  )
}