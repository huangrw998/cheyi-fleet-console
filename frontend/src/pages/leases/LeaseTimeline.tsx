import { ClockCounterClockwise } from '@phosphor-icons/react'
import type { LeaseEvent } from '@/types'
import { formatDate, statusLabel } from '@/lib/format'
import { Card, SectionHeader } from '@/components/ui'

export function LeaseTimeline({ events }: { events: LeaseEvent[] }) {
  return (
    <Card className="p-5">
      <SectionHeader title="操作时间线" description="从创建到当前状态的关键节点" />
      <div className="mt-4 space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < events.length - 1 ? <span className="absolute left-[11px] top-6 h-full w-px bg-line" /> : null}
            <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-card text-muted"><ClockCounterClockwise size={12} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-ink">{event.note || statusLabel(event.type)}</p><span className="font-mono text-[10px] text-muted">{formatDate(event.created_at)}</span></div>
              <p className="mt-0.5 text-[10px] text-muted">{statusLabel(event.type)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}