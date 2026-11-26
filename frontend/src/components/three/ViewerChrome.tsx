import { ArrowsClockwise, ArrowsOut, Cube, Pause, Play } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { PAINTS } from './paints'

export function ViewerChrome({
  loading,
  error,
  poster,
  paintIndex,
  onPaint,
  autoRotate,
  onToggleAuto,
  onReset,
  fullscreen,
  onFullscreen,
}: {
  loading: number
  error: boolean
  poster: string
  paintIndex: number
  onPaint: (index: number) => void
  autoRotate: boolean
  onToggleAuto: () => void
  onReset: () => void
  fullscreen: boolean
  onFullscreen: () => void
}) {
  return (
    <>
      <img src={poster} alt="" aria-hidden="true" className={cn('absolute inset-0 z-0 h-full w-full object-cover opacity-30 blur-sm transition-opacity dark:opacity-20', loading < 100 && 'opacity-50')} loading="eager" decoding="async" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/10 via-transparent to-transparent dark:from-black/30" />

      <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-line bg-card/85 px-2.5 py-1 text-[10px] font-medium text-muted backdrop-blur">
        <Cube size={12} className="text-accent" /> 3D 车身示意
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        <Button size="icon" variant="secondary" className="h-8 w-8 bg-card/85 backdrop-blur" onClick={onToggleAuto} aria-label={autoRotate ? '暂停自动旋转' : '开始自动旋转'} title={autoRotate ? '暂停自动旋转' : '开始自动旋转'}>
          {autoRotate ? <Pause size={14} /> : <Play size={14} />}
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 bg-card/85 backdrop-blur" onClick={onReset} aria-label="重置视角" title="重置视角">
          <ArrowsClockwise size={14} />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 bg-card/85 backdrop-blur" onClick={onFullscreen} aria-label={fullscreen ? '退出全屏' : '全屏查看'} title={fullscreen ? '退出全屏' : '全屏查看'}>
          <ArrowsOut size={14} />
        </Button>
      </div>

      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-card/80 px-6 text-center backdrop-blur">
          <p className="text-sm font-medium text-ink">3D 模型加载失败</p>
          <p className="text-xs text-muted">当前浏览器可能不支持 WebGL，下面仍可查看实拍图。</p>
          <img src={poster} alt="" className="mt-2 h-40 w-full max-w-md rounded-lg object-cover" loading="lazy" decoding="async" />
        </div>
      ) : null}

      {loading < 100 && !error ? (
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
          <div className="mx-auto max-w-xs">
            <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted">
              <span>正在加载 3D 车身</span>
              <span className="font-mono">{loading}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${Math.max(6, loading)}%` }} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {PAINTS.map((paint, index) => (
            <button
              key={paint.name}
              onClick={() => onPaint(index)}
              className={cn('h-6 w-6 rounded-full border-2 transition', paintIndex === index ? 'scale-110 border-accent' : 'border-white/70 dark:border-white/20')}
              style={{ background: paint.hex }}
              aria-label={`切换为${paint.name}`}
              title={paint.name}
            />
          ))}
          <span className="ml-1 text-[10px] text-muted">{PAINTS[paintIndex].name}</span>
        </div>
        <p className="max-w-xs text-right text-[10px] leading-4 text-muted">3D 为通用车身示意，非实车 CAD。实车以图片为准。</p>
      </div>
    </>
  )
}