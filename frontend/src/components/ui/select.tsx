import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useAnchoredPanel } from './popover'
import { useField } from './form'
import { SelectPanel } from './SelectPanel'
import { labelText, parseOptions, type SelectOption } from './select-helpers'

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  placeholder?: string
  className?: string
  disabled?: boolean
  searchable?: boolean
  size?: 'sm' | 'md'
  'aria-label'?: string
}

export function Select({ value, onChange, children, placeholder = '请选择', className, disabled, searchable, size = 'md', 'aria-label': ariaLabel }: SelectProps) {
  const field = useField()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId().replace(/:/g, '')
  const style = useAnchoredPanel(open, triggerRef, { width: 'trigger', minWidth: 240, maxHeight: 360 })
  const options = useMemo(() => parseOptions(children), [children])
  const selected = options.find((option) => option.value === value && option.value !== '')
  const emptyOption = !selected ? options.find((option) => option.value === '') : undefined
  const displayLabel = selected ? selected.label : emptyOption?.label ?? placeholder
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) => labelText(option.label).toLowerCase().includes(needle))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const selectedIndex = options.findIndex((option) => option.value === value)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    const timer = window.setTimeout(() => {
      const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches
      if ((searchable || options.length > 8) && !coarsePointer) searchRef.current?.focus({ preventScroll: true })
      else panelRef.current?.focus({ preventScroll: true })
    }, 30)
    return () => window.clearTimeout(timer)
    // Options are intentionally not a dependency; opening should not reset on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchable, value])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [query, open])

  const selectOption = (option: SelectOption) => {
    if (option.disabled) return
    onChange(option.value)
    setOpen(false)
    window.setTimeout(() => triggerRef.current?.focus({ preventScroll: true }), 0)
  }

  const move = (direction: 1 | -1) => {
    if (filtered.length === 0) return
    setActiveIndex((current) => {
      let next = current
      for (let i = 0; i < filtered.length; i++) {
        next = (next + direction + filtered.length) % filtered.length
        if (!filtered[next].disabled) return next
      }
      return current
    })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
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
    } else if (event.key === 'Tab') {
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) selectOption(option)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(filtered.length - 1)
    }
  }

  const triggerClass = cn(
    'field-control flex items-center justify-between gap-2 px-3.5 text-left',
    size === 'sm' ? 'h-10 text-sm' : 'h-11 text-sm',
    disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-line/80',
    field?.error && 'field-control-invalid',
    open && 'border-accent ring-2 ring-accent/15',
    className,
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={triggerClass}
        id={field?.id}
        aria-label={ariaLabel ?? (field?.label ? `${field.label}，当前选择${labelText(displayLabel)}` : undefined)}
        aria-required={field?.required || undefined}
        aria-invalid={field?.error ? true : undefined}
        aria-describedby={field?.error ? `${field.id}-error` : field?.hint ? `${field.id}-hint` : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-muted')}>{displayLabel}</span>
        <CaretDown size={14} className={cn('shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open ? (
        <SelectPanel
          panelRef={panelRef}
          searchRef={searchRef}
          style={style}
          listId={listId}
          options={filtered}
          value={value}
          query={query}
          onQueryChange={setQuery}
          activeIndex={activeIndex}
          onActiveIndex={setActiveIndex}
          onSelect={selectOption}
          onKeyDown={handleKeyDown}
          showSearch={searchable || options.length > 8}
        />
      ) : null}
    </>
  )
}