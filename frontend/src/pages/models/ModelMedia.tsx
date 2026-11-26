import { lazy, Suspense, useMemo, useState } from 'react'
import { Cube, ImageSquare } from '@phosphor-icons/react'
import type { VehicleModel } from '@/types'
import { Card, CardToolbar, Skeleton, Tabs } from '@/components/ui'

const Vehicle3DViewer = lazy(() => import('@/components/three'))

export function ModelMedia({ model }: { model: VehicleModel }) {
  const [tab, setTab] = useState<'photo' | '3d'>('photo')
  const [activeImage, setActiveImage] = useState(0)
  const images = useMemo(() => model.gallery?.length ? model.gallery : [model.hero_image], [model])

  return (
    <Card className="overflow-hidden">
      <CardToolbar className="flex items-center justify-between px-3 py-2">
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as 'photo' | '3d')}
          items={[
            { value: 'photo', label: <><ImageSquare size={14} /> 实拍图</> },
            { value: '3d', label: <><Cube size={14} /> 3D 看车</> },
          ]}
        />
        <span className="text-[10px] text-muted">3D 为通用车身示意</span>
      </CardToolbar>
      {tab === 'photo' ? (
        <div className="p-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-card2"><img src={images[activeImage] ?? model.hero_image} alt={`${model.brand} ${model.name}`} className="h-full w-full object-cover" loading="eager" decoding="async" /></div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((image, index) => (
                <button key={image + index} onClick={() => setActiveImage(index)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${activeImage === index ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`查看第 ${index + 1} 张实拍图`}>
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="p-3">
          <Suspense fallback={<Skeleton className="aspect-[16/10] w-full" />}>
            <Vehicle3DViewer modelKey={model.model_3d_key || 'sedan'} poster={images[0] ?? model.hero_image} />
          </Suspense>
        </div>
      )}
    </Card>
  )
}