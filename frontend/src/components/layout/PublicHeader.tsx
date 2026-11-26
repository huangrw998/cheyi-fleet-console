import { Link } from 'react-router-dom'
import { Brand } from './Brand'
import { ButtonLink } from '@/components/ui'

export function PublicHeader({ to, action }: { to: string; action: string }) {
  return (
    <header className="border-b border-line bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={to} className="flex items-center gap-2.5"><Brand /></Link>
        <ButtonLink to={to} variant="ghost" size="sm">{action}</ButtonLink>
      </div>
    </header>
  )
}
