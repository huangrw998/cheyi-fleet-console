import type { ReactNode, RefObject } from 'react'
import { ArrowCounterClockwise, Eraser, LinkSimple, ListBullets, ListNumbers, TextB, TextItalic, TextUnderline, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface RichTextActive {
  bold: boolean
  italic: boolean
  underline: boolean
  unordered: boolean
  ordered: boolean
}

function ToolButton({
  label,
  active,
  onClick,
  children,
  buttonRef,
  expanded,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
  buttonRef?: RefObject<HTMLButtonElement | null>
  expanded?: boolean
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      title={label}
      aria-label={label}
      aria-haspopup={expanded === undefined ? undefined : 'dialog'}
      aria-expanded={expanded}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn('flex h-7 w-7 items-center justify-center rounded-md transition', active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-card2 hover:text-ink')}
    >
      {children}
    </button>
  )
}

export function RichTextToolbar({
  active,
  linkOpen,
  linkButtonRef,
  hasValue,
  onCommand,
  onToggleLink,
  onClear,
}: {
  active: RichTextActive
  linkOpen: boolean
  linkButtonRef: RefObject<HTMLButtonElement | null>
  hasValue: boolean
  onCommand: (command: string) => void
  onToggleLink: () => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-card2/30 p-1.5">
      <ToolButton label="加粗" active={active.bold} onClick={() => onCommand('bold')}><TextB size={14} /></ToolButton>
      <ToolButton label="斜体" active={active.italic} onClick={() => onCommand('italic')}><TextItalic size={14} /></ToolButton>
      <ToolButton label="下划线" active={active.underline} onClick={() => onCommand('underline')}><TextUnderline size={14} /></ToolButton>
      <span className="mx-0.5 h-4 w-px bg-line" />
      <ToolButton label="无序列表" active={active.unordered} onClick={() => onCommand('insertUnorderedList')}><ListBullets size={14} /></ToolButton>
      <ToolButton label="有序列表" active={active.ordered} onClick={() => onCommand('insertOrderedList')}><ListNumbers size={14} /></ToolButton>
      <ToolButton label="插入链接" onClick={onToggleLink} buttonRef={linkButtonRef} expanded={linkOpen}><LinkSimple size={14} /></ToolButton>
      <span className="mx-0.5 h-4 w-px bg-line" />
      <ToolButton label="清除格式" onClick={() => onCommand('removeFormat')}><Eraser size={14} /></ToolButton>
      <ToolButton label="撤销" onClick={() => onCommand('undo')}><ArrowCounterClockwise size={14} /></ToolButton>
      {hasValue ? (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClear}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:bg-danger-soft hover:text-danger"
          aria-label="清空内容"
          title="清空内容"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  )
}