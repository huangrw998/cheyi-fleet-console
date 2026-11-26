import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'
import { Input } from './input'
import { useAnchoredPanel } from './popover'

const LINK_PATTERN = /^(https?:|mailto:)\S+$/i

export function RichTextLinkPopover({
  open,
  anchorRef,
  onClose,
  onApply,
}: {
  open: boolean
  anchorRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onApply: (url: string) => void
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const style = useAnchoredPanel(open, anchorRef, { width: 300, maxHeight: 200 })

  useEffect(() => {
    if (!open) return
    setUrl('')
    setError('')
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!anchorRef.current?.contains(target) && !panelRef.current?.contains(target)) onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  // 只在打开/锚点变化时重置；onClose 由父组件保持最新即可。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRef, open])

  if (!open) return null

  const apply = () => {
    const next = url.trim()
    if (!LINK_PATTERN.test(next)) {
      setError('请输入 http://、https:// 或 mailto: 链接')
      return
    }
    onApply(next)
    onClose()
  }

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      role="dialog"
      aria-label="插入链接"
      className="animate-fade-up rounded-xl border border-line bg-card p-3 shadow-card"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <p className="text-xs font-medium text-ink">插入链接</p>
      <form
        className="mt-2"
        onSubmit={(event) => {
          event.preventDefault()
          apply()
        }}
      >
        <Input
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
            setError('')
          }}
          placeholder="https://example.com"
          aria-label="链接地址"
          autoFocus
        />
        {error ? <p role="alert" className="mt-1.5 text-[11px] text-danger">{error}</p> : null}
        <div className="mt-2.5 flex justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit" size="sm" variant="primary">插入</Button>
        </div>
      </form>
    </div>,
    document.body,
  )
}