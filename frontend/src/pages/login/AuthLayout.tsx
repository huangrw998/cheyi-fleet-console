import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/app/theme'
import { Brand } from '@/components/layout'
import { Button } from '@/components/ui'
import { BrandPanel } from './BrandPanel'

export function AuthLayout({
  children,
  stats,
  online,
  label,
}: {
  children: ReactNode
  stats?: { vehicles: number; drivers: number; active_leases: number; stores: number }
  online?: boolean
  label: string
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="grid min-h-[100dvh] bg-canvas lg:grid-cols-[1.08fr_0.92fr]">
      <BrandPanel stats={stats} online={online} />
      <section className="flex min-h-[100dvh] flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="lg:hidden"><Brand /></div>
          <div className="hidden text-xs text-muted lg:block">{label}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-10">
          <div className="w-full max-w-lg">
            {children}
            <p className="mt-6 text-center text-[10px] leading-5 text-muted">
              素材来源与许可见 <Link to="/credits" className="text-accent hover:underline">素材与许可</Link>。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}