import { cn } from '@/lib/utils'
import { linePath } from './primitives'

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const width = 96
  const height = 28
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const d = linePath(values, width, height, max, min)
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-7 w-24 cursor-pointer', className)} aria-hidden="true">
      <path d={d} fill="none" stroke="var(--chart-1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}