import type { Lease } from '@/types'
import { formatDate } from '@/lib/format'
import { Card, Progress, SectionHeader } from '@/components/ui'
import { LeaseSummaryStats } from './LeaseHeader'

export function LeaseProgressCard({ lease }: { lease: Lease }) {
  const start = new Date(lease.start_date).getTime()
  const end = new Date(lease.end_date).getTime()
  const progress = end > start ? Math.max(0, Math.min(100, ((Date.now() - start) / (end - start)) * 100)) : 0
  const daysLeft = Math.ceil((end - Date.now()) / 86400000)
  return (
    <Card className="p-5">
      <SectionHeader title="租约进度" description={`已进行 ${progress.toFixed(0)}%`} />
      <div className="mt-4">
        <Progress value={progress} tone={daysLeft < 0 ? 'danger' : 'accent'} />
        <div className="mt-2 flex justify-between text-[10px] text-muted"><span>{formatDate(lease.start_date)}</span><span>{formatDate(lease.end_date)}</span></div>
      </div>
      <div className="mt-5"><LeaseSummaryStats lease={lease} /></div>
    </Card>
  )
}