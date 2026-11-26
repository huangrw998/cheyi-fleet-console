import { cn } from '@/lib/utils'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', compact && 'justify-center')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-semibold text-on-accent">驰</span>
      {!compact ? (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-ink">驰驿 CHEYI</p>
          <p className="text-[10px] tracking-[0.16em] text-muted">FLEET CONSOLE</p>
        </div>
      ) : null}
    </div>
  )
}