import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { statusLabel, statusTone } from '@/lib/format'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

const tones: Record<Tone, string> = {
  neutral: 'border-line bg-card2 text-muted',
  success: 'border-success/20 bg-success-soft text-success',
  warning: 'border-warning/20 bg-warning-soft text-warning',
  danger: 'border-danger/20 bg-danger-soft text-danger',
  info: 'border-info/20 bg-info-soft text-info',
  accent: 'border-accent/20 bg-accent-soft text-accent',
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5', tones[tone], className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status, label, className }: { status?: string; label?: ReactNode; className?: string }) {
  return <Badge tone={statusTone(status)} className={className}>{label ?? statusLabel(status)}</Badge>
}