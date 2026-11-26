import { Compass } from '@phosphor-icons/react'
import { ButtonLink } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-card text-muted shadow-soft">
        <Compass size={28} />
      </span>
      <div>
        <p className="font-mono text-5xl font-semibold tracking-tight text-ink">404</p>
        <p className="mt-3 text-sm font-medium text-ink">这个页面不在车队里</p>
        <p className="mt-1 text-xs text-muted">链接可能已失效，或者你输入了一个不存在的地址。</p>
      </div>
      <ButtonLink to="/" variant="primary">返回运营总览</ButtonLink>
    </div>
  )
}