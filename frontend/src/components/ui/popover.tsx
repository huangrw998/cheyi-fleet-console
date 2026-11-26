import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'

export function useAnchoredPanel(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  options: { width?: number | 'trigger'; minWidth?: number; maxHeight?: number } = {},
) {
  const [style, setStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const requestedWidth = options.width === 'trigger' || options.width === undefined ? rect.width : options.width
      const width = Math.min(window.innerWidth - 16, Math.max(requestedWidth, options.minWidth ?? 0))
      const maxHeight = options.maxHeight ?? 320
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const openUp = spaceBelow < Math.min(maxHeight, 260) && spaceAbove > spaceBelow
      const height = Math.min(maxHeight, openUp ? spaceAbove - 16 : spaceBelow - 16)
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
      setStyle({
        position: 'fixed',
        left,
        width,
        maxHeight: Math.max(160, height),
        zIndex: 90,
        ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, options.maxHeight, options.minWidth, options.width, triggerRef])

  return style
}