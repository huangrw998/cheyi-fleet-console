import { Eye, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function PasswordToggle({ visible, onToggle, className }: { visible: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn('absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-card2 hover:text-ink', className)}
      aria-label={visible ? '隐藏密码' : '显示密码'}
    >
      {visible ? <EyeSlash size={16} /> : <Eye size={16} />}
    </button>
  )
}
