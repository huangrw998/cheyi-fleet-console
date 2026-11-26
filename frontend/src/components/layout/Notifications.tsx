import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell } from '@phosphor-icons/react'
import { getDashboard } from '@/api/dashboard'
import { cn } from '@/lib/utils'
import { Badge, Menu } from '@/components/ui'

export function Notifications() {
  const navigate = useNavigate()
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
  })
  const alerts = data?.data.alerts ?? []
  return (
    <Menu
      trigger={
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-card2 hover:text-ink" aria-label="通知">
          <Bell size={18} />
          {alerts.length ? <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" /> : null}
        </button>
      }
    >
      <div className="w-80 max-w-[80vw]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-xs font-semibold text-ink">风险提醒</p>
          <Badge tone="accent">{alerts.length}</Badge>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {alerts.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted">暂无提醒</p>
          ) : alerts.map((alert, index) => (
            <button
              key={`${alert.type}-${index}`}
              onClick={() => navigate(alert.href)}
              className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-card2"
            >
              <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', alert.severity === 'critical' ? 'bg-danger' : alert.severity === 'warning' ? 'bg-warning' : 'bg-info')} />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-ink">{alert.title}</span>
                <span className="block truncate text-[10px] leading-4 text-muted">{alert.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Menu>
  )
}