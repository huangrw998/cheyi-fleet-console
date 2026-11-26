import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { ErrorState, Skeleton } from '@/components/ui'
import { ModelFleetTable } from './ModelFleetTable'
import { ModelMedia } from './ModelMedia'
import { ModelRelated } from './ModelRelated'
import { ModelHighlights, ModelSpecs } from './ModelSpecs'
import { ModelSummary } from './ModelSummary'
import { useModelDetail } from './useModelDetail'

export default function ModelDetailPage() {
  const { slug = '' } = useParams()
  const query = useModelDetail(slug)

  if (query.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-5 w-40" /><div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><Skeleton className="aspect-[16/10] w-full" /><Skeleton className="h-96" /></div></div>
  }
  if (query.isError || !query.data?.data) return <ErrorState message="车型详情加载失败" onRetry={() => void query.refetch()} />

  const { model, vehicles, related } = query.data.data
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/models" className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-ink"><ArrowLeft size={14} /> 返回车型展厅</Link>
        <div className="flex items-center gap-2 text-[11px] text-muted"><span>{model.brand}</span><span>/</span><span className="text-ink">{model.name}</span></div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="min-w-0 space-y-3">
          <ModelMedia model={model} />
          <ModelHighlights model={model} />
          <ModelFleetTable vehicles={vehicles} availableCount={model.available_count} slug={model.slug} />
        </div>
        <div className="min-w-0 space-y-4">
          <ModelSummary model={model} />
          <ModelSpecs model={model} />
          <ModelRelated models={related} />
        </div>
      </div>
    </div>
  )
}