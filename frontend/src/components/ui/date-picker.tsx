import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, isToday, isValid, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useAnchoredPanel } from './popover'
import { useField } from './form'

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: string
  max?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
  'aria-label'?: string
}

export function DatePicker({ value, onChange, placeholder = '选择日期', min, max, disabled, className, size = 'md', 'aria-label': ariaLabel }: DatePickerProps) {
  const field = useField()
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const parsed = value ? parseISO(value) : null
    return parsed && isValid(parsed) ? startOfMonth(parsed) : startOfMonth(new Date())
  })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId().replace(/:/g, '')
  const style = useAnchoredPanel(open, triggerRef, { width: 340, maxHeight: 390 })

  useEffect(() => {
    if (!open) return
    const parsed = value ? parseISO(value) : null
    setViewMonth(parsed && isValid(parsed) ? startOfMonth(parsed) : startOfMonth(new Date()))
    const timer = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 40)
    return () => window.clearTimeout(timer)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const minDate = min && isValid(parseISO(min)) ? parseISO(min) : null
  const maxDate = max && isValid(parseISO(max)) ? parseISO(max) : null
  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : null
  const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  const pick = (date: Date) => {
    if ((minDate && isBefore(date, minDate)) || (maxDate && isAfter(date, maxDate))) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
    window.setTimeout(() => triggerRef.current?.focus({ preventScroll: true }), 0)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(true)
      }
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    }
    if (event.key === 'Tab') {
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        id={field?.id}
        aria-label={ariaLabel ?? (field?.label ? `${field.label}，当前${value || placeholder}` : undefined)}
        aria-required={field?.required || undefined}
        aria-invalid={field?.error ? true : undefined}
        aria-describedby={field?.error ? `${field.id}-error` : field?.hint ? `${field.id}-hint` : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={cn(
          'field-control flex items-center gap-2 px-3.5 text-left',
          size === 'sm' ? 'h-10 text-sm' : 'h-11 text-sm',
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-line/80',
          field?.error && 'field-control-invalid',
          open && 'border-accent ring-2 ring-accent/15',
          className,
        )}
      >
        <CalendarBlank size={15} className="shrink-0 text-muted" />
        <span className={cn('flex-1 font-mono', !value && 'font-sans text-muted')}>{value || placeholder}</span>
      </button>

      {open ? createPortal(
        <div
          ref={panelRef}
          style={style}
          id={panelId}
          role="dialog"
          aria-label="选择日期"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              setOpen(false)
              triggerRef.current?.focus({ preventScroll: true })
            } else if (event.key === 'Tab') {
              setOpen(false)
              triggerRef.current?.focus({ preventScroll: true })
            }
          }}
          className="popover-panel overflow-y-auto p-3 outline-none scrollbar-thin"
        >
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="rounded-lg p-1.5 text-muted transition hover:bg-card2 hover:text-ink" aria-label="上个月"><CaretLeft size={15} /></button>
            <div className="text-sm font-semibold text-ink">{format(viewMonth, 'yyyy年M月')}</div>
            <button type="button" onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="rounded-lg p-1.5 text-muted transition hover:bg-card2 hover:text-ink" aria-label="下个月"><CaretRight size={15} /></button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1">
            {weekdays.map((day) => <span key={day} className="py-1 text-center text-[10px] font-medium text-muted">{day}</span>)}
            {days.map((day) => {
              const outside = !isSameMonth(day, viewMonth)
              const selected = selectedDate ? isSameDay(day, selectedDate) : false
              const today = isToday(day)
              const blocked = Boolean((minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate)))
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={blocked}
                  onClick={() => pick(day)}
                  aria-label={format(day, 'yyyy-MM-dd')}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-md font-mono text-[11px] transition',
                    outside ? 'text-muted/40' : 'text-ink hover:bg-card2',
                    today && !selected && 'ring-1 ring-accent/60',
                    selected ? 'bg-accent text-on-accent hover:bg-accent-hover' : '',
                    blocked && 'cursor-not-allowed opacity-25',
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
            <button type="button" onClick={() => pick(new Date())} className="rounded-md px-2 py-1 text-[11px] font-medium text-accent transition hover:bg-accent-soft">今天</button>
            <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="rounded-md px-2 py-1 text-[11px] text-muted transition hover:bg-card2 hover:text-ink">清除日期</button>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  )
}