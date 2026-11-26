import type { CSSProperties, KeyboardEvent, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SearchInput } from './form'
import type { SelectOption } from './select-helpers'

export function SelectPanel({
  panelRef,
  searchRef,
  style,
  listId,
  options,
  value,
  query,
  onQueryChange,
  activeIndex,
  onActiveIndex,
  onSelect,
  onKeyDown,
  showSearch,
}: {
  panelRef: RefObject<HTMLDivElement | null>
  searchRef: RefObject<HTMLInputElement | null>
  style: CSSProperties
  listId: string
  options: SelectOption[]
  value: string
  query: string
  onQueryChange: (value: string) => void
  activeIndex: number
  onActiveIndex: (index: number) => void
  onSelect: (option: SelectOption) => void
  onKeyDown: (event: KeyboardEvent) => void
  showSearch?: boolean
}) {
  const maxHeight = typeof style.maxHeight === 'number' ? style.maxHeight : 320
  return createPortal(
    <div
      ref={panelRef}
      style={style}
      role="listbox"
      id={listId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="popover-panel overflow-hidden outline-none"
    >
      {showSearch ? (
        <div className="border-b border-line p-2">
          <SearchInput
            ref={searchRef}
            value={query}
            onChange={onQueryChange}
            placeholder="搜索选项"
            size="sm"
            onKeyDown={onKeyDown}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-1 overflow-y-auto p-1.5 scrollbar-thin" style={{ maxHeight: Math.max(160, maxHeight - 62) }}>
        {options.length === 0 ? (
          <p className="px-3 py-5 text-center text-xs text-muted">没有匹配项</p>
        ) : options.map((option, index) => {
          const active = index === activeIndex
          const isSelected = option.value === value && option.value !== ''
          return (
            <button
              key={`${option.value}-${index}`}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={option.disabled}
              onMouseEnter={() => onActiveIndex(index)}
              onClick={() => onSelect(option)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm leading-5 transition',
                active ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-card2',
                option.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {isSelected ? <Check size={13} weight="bold" className="shrink-0 text-accent" /> : null}
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}