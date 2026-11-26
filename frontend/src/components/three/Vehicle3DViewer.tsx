import { cn } from '@/lib/utils'
import { useVehicle3D } from '@/hooks/useVehicle3D'
import { ViewerChrome } from './ViewerChrome'

export default function Vehicle3DViewer({ modelKey, poster, className }: { modelKey: string; poster: string; className?: string }) {
  const viewer = useVehicle3D(modelKey)
  return (
    <div
      ref={viewer.containerRef}
      className={cn(
        'vehicle-stage group relative aspect-[16/10] min-h-[320px] w-full overflow-hidden rounded-xl border border-line bg-card2',
        className,
      )}
    >
      <ViewerChrome
        loading={viewer.loading}
        error={viewer.error}
        poster={poster}
        paintIndex={viewer.paintIndex}
        onPaint={viewer.setPaintIndex}
        autoRotate={viewer.autoRotate}
        onToggleAuto={() => viewer.setAutoRotate((v) => !v)}
        onReset={viewer.reset}
        fullscreen={viewer.fullscreen}
        onFullscreen={viewer.toggleFullscreen}
      />
    </div>
  )
}