import { useId, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ChartPoint } from '@/types/charts'
import { smoothPath } from './primitives'

export function AreaChart({
  data,
  height = 220,
  format = (v) => String(v),
  showSecondary = true,
  className,
}: {
  data: ChartPoint[]
  height?: number
  format?: (value: number) => string
  showSecondary?: boolean
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const width = 720
  const pad = { top: 14, right: 8, bottom: 24, left: 8 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const values = data.map((d) => d.value)
  const secondary = data.map((d) => d.secondary ?? 0)
  const max = Math.max(...values, 1) * 1.12
  const sMax = Math.max(...secondary, 1) * 1.12
  const points = values.map((value, index) => ({
    x: pad.left + (data.length > 1 ? (index / (data.length - 1)) * innerW : innerW / 2),
    y: pad.top + innerH - (value / max) * innerH,
  }))
  const sPoints = secondary.map((value, index) => ({
    x: pad.left + (data.length > 1 ? (index / (data.length - 1)) * innerW : innerW / 2),
    y: pad.top + innerH - (value / sMax) * innerH,
  }))
  const line = smoothPath(points)
  const area = points.length ? `${line} L${points[points.length - 1].x},${pad.top + innerH} L${points[0].x},${pad.top + innerH} Z` : ''
  const sLine = smoothPath(sPoints)
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const labelEvery = Math.max(1, Math.ceil(data.length / 6))
  const active = activeIndex !== null ? data[activeIndex] : null
  const activePoint = activeIndex !== null ? points[activeIndex] : null
  const tooltipLeft = activePoint ? Math.min(88, Math.max(12, (activePoint.x / width) * 100)) : 50
  const tooltipTop = activePoint ? Math.min(78, Math.max(20, (activePoint.y / height) * 100)) : 30

  return (
    <div className={cn('w-full select-none cursor-pointer', className)}>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="趋势图" onMouseLeave={() => setActiveIndex(null)}>
          <defs>
            <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={pad.left}
              x2={width - pad.right}
              y1={pad.top + innerH * tick}
              y2={pad.top + innerH * tick}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={tick === 1 ? '0' : '3 5'}
              opacity={tick === 1 ? 0.7 : 0.45}
            />
          ))}
          {area ? <path d={area} fill={`url(#area-${id})`} /> : null}
          {line ? <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {showSecondary && sLine ? (
            <path d={sLine} fill="none" stroke="var(--chart-3)" strokeWidth="1.6" strokeDasharray="4 5" strokeLinecap="round" opacity="0.9" />
          ) : null}
          {activePoint ? (
            <>
              <line x1={activePoint.x} x2={activePoint.x} y1={pad.top} y2={pad.top + innerH} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 4" opacity="0.55" />
              <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="var(--card)" stroke="var(--accent)" strokeWidth="2.5" />
            </>
          ) : null}
          {data.map((d, index) => {
            if (index % labelEvery !== 0 && index !== data.length - 1) return null
            const x = pad.left + (data.length > 1 ? (index / (data.length - 1)) * innerW : innerW / 2)
            const anchor = index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'
            return (
              <text key={d.label} x={index === 0 ? pad.left : index === data.length - 1 ? width - pad.right : x} y={height - 6} textAnchor={anchor} fill="var(--muted)" fontSize="10" fontFamily="var(--font-mono)">
                {d.label}
              </text>
            )
          })}
          {points.length ? <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="var(--card)" stroke="var(--chart-1)" strokeWidth="2.5" /> : null}
          {points.map((point, index) => {
            const band = innerW / Math.max(1, data.length)
            return (
              <rect
                key={`hit-${data[index]?.label ?? index}`}
                x={point.x - band / 2}
                y={pad.top}
                width={band}
                height={innerH}
                fill="transparent"
                pointerEvents="all"
                onMouseEnter={() => setActiveIndex(index)}
              />
            )
          })}
        </svg>
        {active && activePoint ? (
          <div
            className="pointer-events-none absolute z-10 min-w-28 -translate-x-1/2 -translate-y-[110%] rounded-lg border border-line bg-card/95 px-3 py-2 shadow-card backdrop-blur animate-fade-up"
            style={{ left: `${tooltipLeft}%`, top: `${tooltipTop}%` }}
          >
            <p className="text-[10px] text-muted">{active.label}</p>
            <p className="mt-0.5 font-mono text-xs font-medium text-ink">{format(active.value)}</p>
            {showSecondary && typeof active.secondary === 'number' ? <p className="mt-0.5 text-[10px] text-muted">出租率 {active.secondary.toFixed(1)}%</p> : null}
          </div>
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-chart-1" /> {format(values[values.length - 1] ?? 0)}
        </span>
        {showSecondary ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-chart-3 opacity-80" /> 出租率
          </span>
        ) : null}
      </div>
    </div>
  )
}
