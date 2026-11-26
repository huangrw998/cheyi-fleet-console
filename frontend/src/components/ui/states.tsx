import type { ReactNode } from 'react'
import { ArrowClockwise, SpinnerGap, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card2 text-muted">{icon}</div> : null}
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description ? <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-danger/20 bg-danger-soft text-danger">
        <WarningCircle size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">加载失败</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">{message ?? '请检查网络或稍后重试'}</p>
      </div>
      {onRetry ? (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          <ArrowClockwise size={14} /> 重试
        </Button>
      ) : null}
    </div>
  )
}

export function LoadingScreen({ label = '正在加载' }: { label?: string }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-muted">
      <SpinnerGap size={24} className="animate-spin text-accent" />
      <p className="text-xs">{label}</p>
    </div>
  )
}