import { useQuery } from '@tanstack/react-query'
import { ArrowSquareOut, Cube, ImageSquare, Info, ShieldCheck } from '@phosphor-icons/react'
import { Badge, Card, CardToolbar, DataTable, ErrorState, PageHeader, Skeleton, Td, Th } from '@/components/ui'

import { getCredits } from '@/api/credits'

export default function CreditsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['credits'],
    queryFn: getCredits,
    staleTime: Infinity,
  })

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  if (isError || !data) return <ErrorState message="素材许可读取失败" onRetry={() => void refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="素材与许可"
        description="车型实拍、3D 车身和场景图片的来源与许可证。更新于 2026-11-25。"
      />

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-success/20 bg-success-soft text-success">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">素材说明</p>
            <p className="mt-1 max-w-4xl text-xs leading-6 text-muted">{data.note}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardToolbar className="flex items-center gap-2">
          <ImageSquare size={18} className="text-accent" />
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink">车型实拍图</h2>
            <p className="mt-0.5 text-xs text-muted">{data.models.length} 款车型 · Wikimedia Commons</p>
          </div>
        </CardToolbar>
        <DataTable>
          <thead><tr><Th>车型</Th><Th>文件</Th><Th>作者</Th><Th>许可证</Th><Th>来源</Th></tr></thead>
          <tbody>
            {data.models.map((model) => (
              <tr key={model.slug} className="transition hover:bg-card2/40">
                <Td>
                  <div className="flex items-center gap-3">
                    <img src={`/media/models/${model.slug}/thumb.webp`} alt="" className="h-10 w-14 rounded-lg object-cover" loading="lazy" decoding="async" />
                    <span className="text-xs font-medium text-ink">{model.name}</span>
                  </div>
                </Td>
                <Td className="max-w-64 truncate text-[11px] text-muted">{model.file}</Td>
                <Td className="text-xs text-muted">{model.author}</Td>
                <Td><Badge tone={model.license === 'CC0' ? 'success' : 'info'}>{model.license}</Badge></Td>
                <Td>
                  <a href={model.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    Wikimedia <ArrowSquareOut size={12} />
                  </a>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardToolbar className="flex items-center gap-2">
            <Cube size={18} className="text-accent" />
            <div>
              <h2 className="text-base font-semibold tracking-tight text-ink">3D 车身模型</h2>
              <p className="mt-0.5 text-xs text-muted">通用车身，非具体车型 CAD</p>
            </div>
          </CardToolbar>
          <div className="divide-y divide-line">
            {data.models3d.map((model) => (
              <div key={model.key} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-xs font-medium text-ink">{model.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{model.source} · {model.key}.glb</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="success">{model.license}</Badge>
                  <a href={model.url} target="_blank" rel="noreferrer" className="text-accent hover:underline" aria-label={`查看 ${model.name} 来源`}><ArrowSquareOut size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardToolbar className="flex items-center gap-2">
            <ImageSquare size={18} className="text-accent" />
            <div>
              <h2 className="text-base font-semibold tracking-tight text-ink">场景图片</h2>
              <p className="mt-0.5 text-xs text-muted">门店与氛围图 · Unsplash</p>
            </div>
          </CardToolbar>
          <div className="divide-y divide-line">
            {data.scenes.map((scene) => (
              <div key={scene.file} className="flex items-center gap-3 px-5 py-3">
                <img src={scene.file} alt="" className="h-12 w-16 rounded-lg object-cover" loading="lazy" decoding="async" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink">{scene.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{scene.source} · {scene.license}</p>
                </div>
                <a href={scene.url} target="_blank" rel="noreferrer" className="text-accent hover:underline" aria-label={`查看 ${scene.name} 来源`}><ArrowSquareOut size={14} /></a>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-info" />
          <div className="text-xs leading-6 text-muted">
            <p className="font-medium text-ink">使用边界</p>
            <p className="mt-1">本项目的车型图片、3D 模型和场景图片仅用于产品展示。CC BY-SA 素材保留署名与相同方式共享要求；CC0 素材可自由使用；Unsplash 素材遵循 Unsplash License。若用于商业发布，请替换为已获得授权的官方素材，并重新核对车型配置与价格数据。</p>
            <p className="mt-2">3D 模型为通用车身，不代表具体车型的外观、尺寸或配置。车辆参数以车辆登记信息和厂家公布为准。</p>
          </div>
        </div>
      </Card>
    </div>
  )
}