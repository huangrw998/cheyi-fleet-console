import { useNavigate } from 'react-router-dom'
import { Images, List, MagnifyingGlass, Moon, SignOut, Sun, UserCircle } from '@phosphor-icons/react'
import { useAuth } from '@/app/auth'
import { useTheme } from '@/app/theme'
import { Button, Menu, MenuItem } from '@/components/ui'
import { Notifications } from './Notifications'

export function Topbar({
  title,
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenSearch,
}: {
  title: string
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenMobile: () => void
  onOpenSearch: () => void
}) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobile} aria-label="打开菜单">
          <List size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onToggleCollapse} aria-label={collapsed ? '展开侧栏' : '收起侧栏'}>
          <List size={18} />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          <p className="hidden text-[10px] text-muted sm:block">驰驿 · 网约车租赁运营台</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearch}
          className="hidden h-10 w-56 items-center gap-2 rounded-lg border border-line bg-card px-3.5 text-sm leading-none text-muted transition hover:border-accent/40 hover:text-ink sm:flex lg:w-72 xl:w-80"
        >
          <MagnifyingGlass size={15} />
          <span>搜索</span>
          <kbd className="ml-auto rounded border border-line bg-card2 px-1.5 py-0.5 font-mono text-[9px] text-muted">⌘K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={onOpenSearch} aria-label="搜索">
          <MagnifyingGlass size={18} />
        </Button>
        <Notifications />
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'} title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Menu
          align="right"
          trigger={
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-card2" aria-label="账号菜单">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card2 font-mono text-[10px] text-ink">
                {user?.name?.slice(-2) ?? '-'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-medium leading-4 text-ink">{user?.name ?? '未登录'}</span>
                <span className="block text-[9px] leading-3 text-muted">运营管理员</span>
              </span>
            </button>
          }
        >
          <div className="border-b border-line px-2.5 pb-2 pt-1">
            <p className="text-xs font-medium text-ink">{user?.name}</p>
            <p className="font-mono text-[10px] text-muted">{user?.phone}</p>
          </div>
          <MenuItem onClick={() => navigate('/settings')}>
            <UserCircle size={15} /> 账号与设置
          </MenuItem>
          <MenuItem onClick={() => navigate('/credits')}>
            <Images size={15} /> 素材与许可
          </MenuItem>
          <MenuItem danger onClick={() => void logout()}>
            <SignOut size={15} /> 退出登录
          </MenuItem>
        </Menu>
      </div>
    </header>
  )
}