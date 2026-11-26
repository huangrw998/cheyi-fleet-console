import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Donut({
  segments,
  totalLabel,
  totalValue,
  size = 168,
  className,
}: {
  segments: { label: string; value: number; color: string }[]
  totalLabel: string
  totalValue: string
  size?: number
  className?: string
}) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const active = segments.find((segment) => segment.label === activeLabel)
  let offset = 0
  return (
    <div className={cn('flex cursor-pointer flex-wrap items-center gap-5', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" onMouseLeave={() => setActiveLabel(null)}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--card2)" strokeWidth="10" />
          {segments.map((segment) => {
            const length = total > 0 ? (segment.value / total) * circumference : 0
            const dash = `${Math.max(0, length - 2)} ${circumference}`
            const isActive = segment.label === activeLabel
            const el = (
              <g key={segment.label}>
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isActive ? 12 : 10}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  opacity={activeLabel && !isActive ? 0.45 : 1}
                  className="transition-all duration-200"
                  onMouseEnter={() => setActiveLabel(segment.label)}
                  onMouseLeave={() => setActiveLabel(null)}
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  pointerEvents="stroke"
                  onMouseEnter={() => setActiveLabel(segment.label)}
                  onMouseLeave={() => setActiveLabel(null)}
                />
              </g>
            )
            offset += length
            return el
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className="font-mono text-lg font-semibold text-ink">{active ? active.value : totalValue}</span>
          <span className="mt-0.5 max-w-full truncate text-[10px] text-muted">{active ? `${active.label} · ${total > 0 ? ((active.value / total) * 100).toFixed(1) : 0}%` : totalLabel}</span>
        </div>
      </div>
      <div className="min-w-32 flex-1 space-y-2.5">
        {segments.map((segment) => {
          const isActive = segment.label === activeLabel
          const percent = total > 0 ? ((segment.value / total) * 100).toFixed(1) : '0.0'
          return (
            <div
              key={segment.label}
              className={cn('-mx-1.5 flex items-center justify-between gap-3 rounded-md px-1.5 py-1 text-xs transition-colors', isActive && 'bg-card2/70')}
              onMouseEnter={() => setActiveLabel(segment.label)}
              onMouseLeave={() => setActiveLabel(null)}
            >
              <span className="inline-flex items-center gap-2 text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: segment.color }} />
                {segment.label}
              </span>
              <span className="font-mono text-ink">{segment.value}<span className="ml-1 text-[10px] text-muted">{percent}%</span></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
