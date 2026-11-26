import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useFocusTrap } from './modal'
import { OverlayHeader } from './OverlayHeader'

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-xl',
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('animate-drawer-in absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-card shadow-card', width)}
      >
        <OverlayHeader title={title} description={description} onClose={onClose} />
        <div className="flex-1 overflow-auto px-5 py-5">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}