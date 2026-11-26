import { ArrowRight, ArrowsLeftRight } from '@phosphor-icons/react'
import type { DispatchTask } from '@/types'
import { formatDate } from '@/lib/format'
import { Button, Card, CardToolbar, DataTable, EmptyState, StatusBadge, Td, Th } from '@/components/ui'

export function DispatchTasksTable({ tasks, onComplete, completing }: { tasks: DispatchTask[]; onComplete: (id: number) => void; completing: boolean }) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar><h2 className="text-base font-semibold tracking-tight text-ink">调拨任务</h2><p className="mt-1 text-xs text-muted">从发起、在途到完成，车辆门店归属会随完成动作更新。</p></CardToolbar>
      {tasks.length === 0 ? <EmptyState icon={<ArrowsLeftRight size={22} />} title="暂无调拨任务" description="从车辆池发起第一个调拨。" /> : (
        <DataTable>
          <thead><tr><Th>任务号</Th><Th>车辆</Th><Th>调拨路径</Th><Th>计划日期</Th><Th>状态</Th><Th>操作</Th></tr></thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="transition hover:bg-card2/40">
                <Td className="font-mono text-xs">{task.task_no}</Td>
                <Td><p className="font-mono text-xs text-ink">{task.vehicle?.plate_no ?? '-'}</p><p className="mt-0.5 text-[10px] text-muted">{task.vehicle?.model?.brand} {task.vehicle?.model?.name}</p></Td>
                <Td><div className="flex items-center gap-1.5 text-[11px] text-muted"><span>{task.from_store?.name ?? '-'}</span><ArrowRight size={12} className="text-accent" /><span className="text-ink">{task.to_store?.name ?? '-'}</span></div></Td>
                <Td className="font-mono text-xs text-muted">{formatDate(task.scheduled_at)}</Td>
                <Td><StatusBadge status={task.status} /></Td>
                <Td>{task.status === 'completed' || task.status === 'cancelled' ? <Button size="sm" variant="secondary" disabled>{task.status === 'cancelled' ? '已取消' : '已完成'}</Button> : <Button size="sm" variant="soft" loading={completing} onClick={() => onComplete(task.id)}>完成调拨</Button>}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}