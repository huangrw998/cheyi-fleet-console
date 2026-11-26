import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { htmlToText, sanitizeHtml } from '@/lib/sanitize'
import { useField } from './form'
import { RichTextLinkPopover } from './RichTextLinkPopover'
import { RichTextToolbar, type RichTextActive } from './RichTextToolbar'

export function RichTextEditor({
  value,
  onChange,
  placeholder = '输入内容',
  minHeight = 120,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  className?: string
}) {
  const field = useField()
  const editorRef = useRef<HTMLDivElement>(null)
  const linkButtonRef = useRef<HTMLButtonElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [active, setActive] = useState<RichTextActive>({ bold: false, italic: false, underline: false, unordered: false, ordered: false })

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || document.activeElement === editor) return
    if (editor.innerHTML !== value) editor.innerHTML = value
  }, [value])

  useEffect(() => {
    const refresh = () => {
      if (!editorRef.current || document.activeElement !== editorRef.current) return
      setActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        unordered: document.queryCommandState('insertUnorderedList'),
        ordered: document.queryCommandState('insertOrderedList'),
      })
    }
    document.addEventListener('selectionchange', refresh)
    return () => document.removeEventListener('selectionchange', refresh)
  }, [])

  const emit = () => {
    const html = editorRef.current?.innerHTML ?? ''
    const clean = sanitizeHtml(html)
    onChange(htmlToText(clean) ? clean : '')
  }

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, argument)
    emit()
  }

  const toggleLink = () => {
    if (linkOpen) {
      closeLink()
      return
    }
    const selection = window.getSelection()
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    } else {
      savedRangeRef.current = null
    }
    setLinkOpen(true)
  }

  const closeLink = () => {
    setLinkOpen(false)
    editorRef.current?.focus()
  }

  const clear = () => {
    if (!editorRef.current) return
    editorRef.current.innerHTML = ''
    onChange('')
    setActive({ bold: false, italic: false, underline: false, unordered: false, ordered: false })
    editorRef.current.focus()
  }

  const applyLink = (url: string) => {
    editorRef.current?.focus()
    const range = savedRangeRef.current
    if (range) {
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    document.execCommand('createLink', false, url)
    emit()
    setLinkOpen(false)
  }

  return (
    <div className={cn('field-control overflow-hidden', field?.error && 'field-control-invalid', className)}>
      <RichTextToolbar
        active={active}
        linkOpen={linkOpen}
        linkButtonRef={linkButtonRef}
        hasValue={Boolean(htmlToText(value))}
        onCommand={exec}
        onToggleLink={toggleLink}
        onClear={clear}
      />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        id={field?.id}
        role="textbox"
        aria-multiline="true"
        aria-label={field?.label ?? placeholder}
        aria-required={field?.required || undefined}
        aria-invalid={field?.error ? true : undefined}
        aria-describedby={field?.error ? `${field.id}-error` : field?.hint ? `${field.id}-hint` : undefined}
        data-placeholder={placeholder}
        className="rich-editor w-full px-3 py-2.5 text-sm leading-6 text-ink outline-none"
        style={{ minHeight }}
        onInput={emit}
        onBlur={emit}
        onPaste={(event) => {
          event.preventDefault()
          const text = event.clipboardData.getData('text/plain')
          document.execCommand('insertText', false, text)
          emit()
        }}
      />
      <RichTextLinkPopover
        open={linkOpen}
        anchorRef={linkButtonRef}
        onClose={closeLink}
        onApply={applyLink}
      />
    </div>
  )
}

export function RichTextViewer({ html, className }: { html?: string; className?: string }) {
  const clean = useMemo(() => sanitizeHtml(html ?? ''), [html])
  if (!htmlToText(clean)) return <p className={cn('text-xs text-muted', className)}>暂无备注</p>
  return <div className={cn('rich-content text-xs leading-6 text-ink', className)} dangerouslySetInnerHTML={{ __html: clean }} />
}