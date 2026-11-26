import { NavLink } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { useHealth } from '@/hooks/useHealth'
import { Brand } from './Brand'
import { navGroups } from './nav'

export function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const health = useHealth()
  const online = health.data !== false
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-14 items-center border-b border-line px-4', collapsed && 'px-2')}>
        <Brand compact={collapsed} />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{group.label}</p> : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition',
                        collapsed && 'justify-center px-0',
                        isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-card2 hover:text-ink',
                      )
                    }
                  >
                    <Icon size={17} weight="regular" className="shrink-0" />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className={cn('border-t border-line p-3', collapsed && 'px-2')}>
        <NavLink
          to="/credits"
          onClick={onNavigate}
          className={cn('flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-muted transition hover:bg-card2 hover:text-ink', collapsed && 'justify-center px-0')}
          title="素材与许可"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded border border-line text-[8px]">C</span>
          {!collapsed ? <span>素材与许可</span> : null}
        </NavLink>
        {!collapsed ? (
          <p className="flex items-center gap-1.5 px-2.5 pt-2 text-[10px] leading-4 text-muted/70">
            <span className={cn('h-1.5 w-1.5 rounded-full', online ? 'bg-success' : 'bg-danger')} />
            {online ? '服务在线' : '服务异常'}
            
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function DesktopSidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={cn('fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-card transition-[width] duration-200 lg:block', collapsed ? 'w-[72px]' : 'w-[240px]')}>
      <SidebarContent collapsed={collapsed} />
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 w-[264px] border-r border-line bg-card animate-drawer-in">
        <div className="absolute right-3 top-3 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭菜单">
            <X size={18} />
          </Button>
        </div>
        <SidebarContent collapsed={false} onNavigate={onClose} />
      </aside>
    </div>
  )
}