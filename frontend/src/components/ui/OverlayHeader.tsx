import { X } from '@phosphor-icons/react'

export function OverlayHeader({ title, description, onClose }: { title?: string; description?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        {title ? <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2> : null}
        {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
      </div>
      <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-card2 hover:text-ink" aria-label="关闭">
        <X size={18} />
      </button>
    </div>
  )
}
