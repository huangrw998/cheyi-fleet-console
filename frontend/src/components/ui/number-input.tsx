import type { KeyboardEvent } from 'react'
import { Minus, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useField } from './form'

export interface NumberInputProps {
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  prefix?: string
  suffix?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
  'aria-label'?: string
}

function clamp(value: number, min?: number, max?: number) {
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return next
}

function formatNumber(value: number, precision: number) {
  if (precision <= 0) return String(Math.round(value))
  return String(Number(value.toFixed(precision)))
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  prefix,
  suffix,
  placeholder,
  disabled,
  className,
  size = 'md',
  'aria-label': ariaLabel,
}: NumberInputProps) {
  const field = useField()
  const bump = (direction: 1 | -1) => {
    if (disabled) return
    const base = value.trim() === '' ? 0 : Number(value)
    if (!Number.isFinite(base)) return
    onChange(formatNumber(clamp(base + direction * step, min, max), precision))
  }

  const onBlur = () => {
    if (value.trim() === '') return
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      onChange('')
      return
    }
    onChange(formatNumber(clamp(parsed, min, max), precision))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      bump(1)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      bump(-1)
    }
  }

  return (
    <div
      className={cn(
        'field-control flex items-center overflow-hidden',
        size === 'sm' ? 'h-10' : 'h-11',
        disabled && 'cursor-not-allowed opacity-60',
        field?.error && 'field-control-invalid',
        className,
      )}
    >
      <button type="button" tabIndex={-1} disabled={disabled} onClick={() => bump(-1)} className="flex h-full w-10 shrink-0 items-center justify-center text-muted transition hover:bg-card2 hover:text-ink disabled:pointer-events-none" aria-label="减少">
        <Minus size={13} />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1 border-x border-line/70 px-2">
        {prefix ? <span className="shrink-0 text-[11px] text-muted">{prefix}</span> : null}
        <input
          value={value}
          disabled={disabled}
          inputMode="decimal"
          placeholder={placeholder}
          id={field?.id}
          aria-label={ariaLabel ?? field?.label}
          aria-invalid={field?.error ? true : undefined}
          aria-required={field?.required || undefined}
          aria-describedby={field?.error ? `${field.id}-error` : field?.hint ? `${field.id}-hint` : undefined}
          onChange={(event) => {
            const next = event.target.value
            if (next === '' || next === '-' || /^-?\d*\.?\d*$/.test(next)) onChange(next)
          }}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={cn('min-w-0 flex-1 bg-transparent text-center font-mono text-ink outline-none placeholder:font-sans placeholder:text-muted', 'text-sm')}
        />
        {suffix ? <span className="shrink-0 text-[11px] text-muted">{suffix}</span> : null}
      </div>
      <button type="button" tabIndex={-1} disabled={disabled} onClick={() => bump(1)} className="flex h-full w-10 shrink-0 items-center justify-center text-muted transition hover:bg-card2 hover:text-ink disabled:pointer-events-none" aria-label="增加">
        <Plus size={13} />
      </button>
    </div>
  )
}