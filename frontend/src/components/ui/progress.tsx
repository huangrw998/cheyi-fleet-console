import { cn } from '@/lib/utils'

export function Progress({
  value,
  tone = 'accent',
  className,
  label,
}: {
  value: number
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
  label?: string
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  const bar: Record<string, string> = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
  }
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
          <span>{label}</span>
          <span className="font-mono text-ink">{pct.toFixed(1)}%</span>
        </div>
      ) : null}
      <div className="h-1.5 overflow-hidden rounded-full bg-card2">
        <div className={cn('h-full rounded-full transition-[width] duration-500', bar[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}