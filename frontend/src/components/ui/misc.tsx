import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const avatarTones = [
  'border-accent/20 bg-accent-soft text-accent',
  'border-info/20 bg-info-soft text-info',
  'border-success/20 bg-success-soft text-success',
  'border-warning/20 bg-warning-soft text-warning',
  'border-chart-3/25 bg-chart-3/10 text-chart-3',
  'border-chart-4/25 bg-chart-4/10 text-chart-4',
]

export function Avatar({ name, className }: { name?: string; className?: string }) {
  const text = Array.from((name ?? '?').trim())[0] ?? '?'
  const tone = avatarTones[Array.from(name ?? '').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarTones.length]
  return (
    <span className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold shadow-soft', tone, className)}>
      {text}
    </span>
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return <span className="rounded-md border border-line bg-card2 px-2 py-1 text-[11px] text-muted">{children}</span>
}

export function Money({ cents, className, compact }: { cents: number; className?: string; compact?: boolean }) {
  const yuan = cents / 100
  const text = compact && yuan >= 10000
    ? `¥${(yuan / 10000).toFixed(yuan >= 100000 ? 1 : 2)}万`
    : new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(yuan)
  return <span className={cn('font-mono tabular-nums', className)}>{text}</span>
}

const MenuContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null)

export function Menu({ trigger, children, align = 'right' }: { trigger: ReactNode; children: ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])
  return (
    <div ref={ref} className="relative">
      <div className="cursor-pointer" onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open ? (
        <MenuContext.Provider value={{ open, setOpen }}>
          <div className={cn('popover-panel absolute z-30 mt-2 flex min-w-48 flex-col gap-1 p-1.5', align === 'right' ? 'right-0' : 'left-0')}>
            {children}
          </div>
        </MenuContext.Provider>
      ) : null}
    </div>
  )
}

export function MenuItem({ children, onClick, danger }: { children: ReactNode; onClick?: () => void; danger?: boolean }) {
  const ctx = useContext(MenuContext)
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        ctx?.setOpen(false)
      }}
      className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-card2', danger ? 'text-danger' : 'text-ink')}
    >
      {children}
    </button>
  )
}