import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-ink">
      <ArrowLeft size={14} />
      {children}
    </Link>
  )
}
