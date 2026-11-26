import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './card'

export function Stat({
  label,
  value,
  hint,
  delta,
  icon,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  delta?: number
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {icon ? <span className="text-muted transition-colors duration-200 group-hover:text-accent">{icon}</span> : null}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-xl font-semibold tracking-tight text-ink sm:text-2xl">{value}</span>
        {typeof delta === 'number' ? (
          <span className={cn('text-xs font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
            {delta >= 0 ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs leading-5 text-muted">{hint}</p> : null}
    </div>
  )
}

export function StatCell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('group p-4 transition-colors duration-200 hover:bg-card2/50', className)}>{children}</div>
}

export interface StatItem {
  label: string
  value: ReactNode
  hint?: ReactNode
  delta?: number
  icon?: ReactNode
}

const columnClasses: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-3 xl:grid-cols-5',
  6: 'sm:grid-cols-3 xl:grid-cols-6',
}

export function StatStrip({ items, columns = 4, className }: { items: StatItem[]; columns?: number; className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className={cn('grid grid-cols-2 divide-x divide-y divide-line xl:divide-y-0', columnClasses[columns] ?? columnClasses[4])}>
        {items.map((item) => (
          <StatCell key={item.label}>
            <Stat {...item} />
          </StatCell>
        ))}
      </div>
    </Card>
  )
}