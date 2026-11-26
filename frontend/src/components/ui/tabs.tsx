import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { value: string; label: ReactNode; count?: number }[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto no-scrollbar', className)} role="tablist">
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium leading-5 transition',
              active ? 'bg-ink text-canvas' : 'text-muted hover:bg-card2 hover:text-ink',
            )}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span className={cn('font-mono text-[11px]', active ? 'text-canvas/70' : 'text-muted')}>{item.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}