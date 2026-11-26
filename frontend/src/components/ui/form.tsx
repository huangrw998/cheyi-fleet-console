import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type KeyboardEventHandler, type ReactNode } from 'react'
import { Check, MagnifyingGlass, WarningCircle, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface FieldContextValue {
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

export function useField() {
  return useContext(FieldContext)
}

export interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId()
  return (
    <div className={cn('block', className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted">
          {label}
          {required ? <span className="text-accent">*</span> : null}
        </label>
      ) : null}
      <FieldContext.Provider value={{ id, label, error, hint, required }}>{children}</FieldContext.Provider>
      {error ? (
        <span id={`${id}-error`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-danger">
          <WarningCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </span>
      ) : hint ? <span id={`${id}-hint`} className="mt-1.5 block text-xs leading-5 text-muted">{hint}</span> : null}
    </div>
  )
}

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  size?: 'sm' | 'md' | 'lg'
  autoFocus?: boolean
  clearable?: boolean
  debounce?: number
  'aria-label'?: string
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, placeholder = '搜索', className, inputClassName, size = 'md', autoFocus, clearable = true, debounce = 0, 'aria-label': ariaLabel, onKeyDown },
  ref,
) {
  const field = useField()
  const [draft, setDraft] = useState(value)
  const timerRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  const commit = (next: string, immediate = false) => {
    setDraft(next)
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!debounce || immediate) {
      onChangeRef.current(next)
      return
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      onChangeRef.current(next)
    }, debounce)
  }

  const shown = debounce > 0 ? draft : value
  const sizeClass = size === 'sm' ? 'h-10 pl-9 pr-9 text-sm' : size === 'lg' ? 'h-12 pl-11 pr-11 text-sm' : 'h-11 pl-10 pr-10 text-sm'
  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlass size={size === 'sm' ? 14 : 16} className={cn('pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted', size === 'sm' ? 'left-3' : size === 'lg' ? 'left-4' : 'left-3.5')} />
      <input
        ref={ref}
        value={shown}
        onChange={(e) => commit(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && debounce > 0) commit(draft, true)
          onKeyDown?.(event)
        }}
        id={field?.id}
        aria-label={ariaLabel ?? field?.label ?? placeholder}
        aria-required={field?.required || undefined}
        aria-invalid={field?.error ? true : undefined}
        className={cn(
          'field-control',
          sizeClass,
          field?.error && 'field-control-invalid',
          inputClassName,
        )}
      />
      {clearable && shown ? (
        <button
          type="button"
          onClick={() => commit('', true)}
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-card2 hover:text-ink"
          aria-label="清空搜索"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  )
})

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  id,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: ReactNode
  description?: string
  id?: string
  disabled?: boolean
  className?: string
}) {
  const generated = useId()
  const inputId = id ?? generated
  const descriptionId = `${inputId}-description`
  return (
    <label
      htmlFor={inputId}
      className={cn('group inline-flex cursor-pointer items-start gap-2.5 text-xs text-muted', disabled && 'cursor-not-allowed opacity-60', className)}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={description ? descriptionId : undefined}
        className="peer sr-only"
      />
      <span className={cn(
        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas',
        checked ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card',
        !disabled && 'group-hover:border-accent/50',
      )}>
        {checked ? <Check size={11} weight="bold" /> : null}
      </span>
      <span className="min-w-0 leading-5">
        {label}
        {description ? <span id={descriptionId} className="mt-0.5 block text-[10px] text-muted">{description}</span> : null}
      </span>
    </label>
  )
}