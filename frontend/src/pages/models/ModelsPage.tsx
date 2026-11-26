import { Images, SlidersHorizontal, Sparkle } from '@phosphor-icons/react'
import { formatPercent } from '@/lib/format'
import { Button, ButtonLink, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { ModelCard } from '@/components/domain/ModelCard'
import { ModelFilters } from './ModelFilters'
import { useModels } from './useModels'

export default function ModelsPage() {
  const state = useModels()

  return (
    <div className="space-y-5">
      <PageHeader
        title="车型展厅"
        description="真实车源图片与 3D 车身预览放在一起。先看车型，再看在库车辆和月租方案。"
        actions={<><Button variant="secondary" onClick={state.clear} disabled={!state.isFiltered}><SlidersHorizontal size={15} /> 清除筛选</Button><ButtonLink to="/leases/new" variant="primary"><Sparkle size={15} /> 新建租约</ButtonLink></>}
      />

      <ModelFilters q={state.q} body={state.body} brand={state.brand} sort={state.sort} filters={state.filters} onUpdate={state.update} />

      {state.modelsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      ) : state.modelsError ? (
        <Card><ErrorState message="车型列表加载失败" onRetry={() => void state.refetchModels()} /></Card>
      ) : state.models.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Images size={22} />}
            title="没有匹配的车型"
            description="试试更短的关键词，或清除车身类型和品牌筛选。"
            action={<Button variant="secondary" onClick={state.clear}>清除筛选</Button>}
          />
        </Card>
      ) : (
        <>
          {state.featured.length ? (
            <section className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-ink">本周推荐</h2>
                  <p className="mt-1 text-xs text-muted">在租表现更稳的三款主力车型</p>
                </div>
                <span className="font-mono text-[11px] text-muted">{formatPercent(state.averageUtilization)} 平均出租率</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {state.featured.map((model) => <ModelCard key={model.id} model={model} featured />)}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-ink">{state.isFiltered ? '筛选结果' : '全部车型'}</h2>
              <p className="mt-1 text-xs text-muted">{state.models.length} 款车型 · 点击卡片查看实拍与 3D</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {state.rest.map((model) => <ModelCard key={model.id} model={model} />)}
            </div>
          </section>
        </>
      )}
    </div>
  )
}