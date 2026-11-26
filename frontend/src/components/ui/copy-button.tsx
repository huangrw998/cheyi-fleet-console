import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import { copyText } from '@/lib/clipboard'
import { cn } from '@/lib/utils'

export function CopyButton({ value, label = '复制', className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)
  const { toast } = useToast()

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  const copy = async () => {
    if (!(await copyText(value))) {
      toast({ title: '复制失败', description: '浏览器未授予剪贴板权限，请手动选择文本。', tone: 'warning' })
      return
    }
    setCopied(true)
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={copied ? '已复制' : label}
      aria-label={copied ? '已复制' : label}
      className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-card2 hover:text-ink', copied && 'text-success', className)}
    >
      {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
    </button>
  )
}