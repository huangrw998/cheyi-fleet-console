import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cn('min-w-0 rounded-xl border border-line bg-card shadow-soft', className)}>{children}</section>
}

export function CardToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border-b border-line px-5 py-4', className)}>{children}</div>
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string
  description?: string
  actions?: ReactNode
  back?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? <div className="mb-3">{back}</div> : null}
        <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-[65ch] text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function FilterBar({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center', className)}>
      {children}
      {right ? <div className="ml-auto shrink-0">{right}</div> : null}
    </div>
  )
}