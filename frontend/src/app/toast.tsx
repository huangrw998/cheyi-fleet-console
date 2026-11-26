import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CheckCircle, Info, WarningCircle, XCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'warning' | 'info'

interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
}

interface ToastItem extends ToastInput {
  id: number
  tone: ToastTone
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneStyles: Record<ToastTone, string> = {
  success: 'border-success/30',
  error: 'border-danger/30',
  warning: 'border-warning/30',
  info: 'border-info/30',
}

const toneSurface: Record<ToastTone, CSSProperties> = {
  success: { backgroundImage: 'linear-gradient(135deg, var(--success-soft) 0%, var(--card) 58%)' },
  error: { backgroundImage: 'linear-gradient(135deg, var(--danger-soft) 0%, var(--card) 58%)' },
  warning: { backgroundImage: 'linear-gradient(135deg, var(--warning-soft) 0%, var(--card) 58%)' },
  info: { backgroundImage: 'linear-gradient(135deg, var(--info-soft) 0%, var(--card) 58%)' },
}

const toneSoft: Record<ToastTone, string> = {
  success: 'bg-success-soft text-success',
  error: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
}

const toneBar: Record<ToastTone, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
}

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckCircle size={18} weight="fill" />,
  error: <XCircle size={18} weight="fill" />,
  warning: <WarningCircle size={18} weight="fill" />,
  info: <Info size={18} weight="fill" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current.clear()
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random()
      const item: ToastItem = { ...input, id, tone: input.tone ?? 'info' }
      setItems((prev) => [...prev.slice(-3), item])
      const timer = window.setTimeout(() => dismiss(id), 4200)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex flex-col items-center gap-2 px-4 pt-4 sm:pt-5">
        {items.map((item) => (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            aria-live={item.tone === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            style={toneSurface[item.tone]}
            className={cn(
              'pointer-events-none relative flex w-full max-w-[420px] items-center gap-3 overflow-hidden rounded-xl border bg-card p-4 shadow-card backdrop-blur-xl animate-toast-in',
              toneStyles[item.tone],
            )}
          >
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-current/10', toneSoft[item.tone])}>
              {toneIcon[item.tone]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-5 tracking-tight text-ink">{item.title}</p>
              {item.description ? <p className="mt-0.5 text-xs leading-5 text-muted">{item.description}</p> : null}
            </div>
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-line/40">
              <span className={cn('block h-full origin-left animate-toast-progress', toneBar[item.tone])} />
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}