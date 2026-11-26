import { cn } from '@/lib/utils'

export function BarsChart({
  data,
  format = (v) => String(v),
  height = 18,
  className,
}: {
  data: { label: string; value: number; color?: string }[]
  format?: (value: number) => string
  height?: number
  className?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={cn('cursor-pointer space-y-3', className)}>
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-muted">{item.label}</span>
            <span className="shrink-0 font-mono text-ink">{format(item.value)}</span>
          </div>
          <div className="overflow-hidden rounded-full bg-card2" style={{ height }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${(item.value / max) * 100}%`, background: item.color ?? 'var(--chart-1)' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}