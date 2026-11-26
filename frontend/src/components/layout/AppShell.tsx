import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LoadingScreen } from '@/components/ui'
import { DesktopSidebar, MobileSidebar } from './Sidebar'
import { SearchDialog } from './SearchDialog'
import { Topbar } from './Topbar'
import { pageTitle } from './nav'

export function AppShell({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  const title = useMemo(() => pageTitle(location.pathname), [location.pathname])

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent">
        跳到主要内容
      </a>

      <DesktopSidebar collapsed={collapsed} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className={cn('min-h-[100dvh] transition-[padding] duration-200 lg:pl-[240px]', collapsed && 'lg:pl-[72px]')}>
        <Topbar
          title={title}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main id="main" className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
          <Suspense fallback={<LoadingScreen label="正在加载页面" />}>
            {children ?? <Outlet />}
          </Suspense>
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}