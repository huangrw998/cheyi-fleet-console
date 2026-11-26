import { Link } from 'react-router-dom'
import { Wrench } from '@phosphor-icons/react'
import type { MaintenanceOrder } from '@/types'
import { formatDate } from '@/lib/format'
import { Button, Card, CardToolbar, DataTable, EmptyState, Money, StatusBadge, Tabs, Td, Th } from '@/components/ui'

const nextStatus: Record<string, string> = { scheduled: 'in_progress', in_progress: 'pending_acceptance', pending_acceptance: 'completed' }
const nextLabel: Record<string, string> = { scheduled: '开始维修', in_progress: '提交验收', pending_acceptance: '完成工单' }

export function MaintenanceOrdersCard({ orders, tab, onTab, onAdvance, advancing }: { orders: MaintenanceOrder[]; tab: string; onTab: (tab: string) => void; onAdvance: (id: number, status: string) => void; advancing: boolean }) {
  const filtered = tab === 'all' ? orders : orders.filter((order) => order.type === tab)
  return (
    <Card className="overflow-hidden">
      <CardToolbar className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={onTab}
          items={[
            { value: 'all', label: '全部工单', count: orders.length },
            { value: 'maintenance', label: '保养', count: orders.filter((o) => o.type === 'maintenance').length },
            { value: 'repair', label: '维修', count: orders.filter((o) => o.type === 'repair').length },
            { value: 'inspection', label: '年检', count: orders.filter((o) => o.type === 'inspection').length },
          ]}
        />
        <p className="text-[11px] text-muted">按计划日期倒序</p>
      </CardToolbar>
      {filtered.length === 0 ? <EmptyState icon={<Wrench size={22} />} title="暂无维保工单" description="为待租车辆创建第一个保养或维修工单。" /> : (
        <DataTable>
          <thead><tr><Th>工单号</Th><Th>车辆</Th><Th>内容</Th><Th>供应商</Th><Th>计划日期</Th><Th>费用</Th><Th>状态</Th><Th>操作</Th></tr></thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="transition hover:bg-card2/40">
                <Td className="font-mono text-[13px]">{order.order_no}</Td>
                <Td><Link to={`/vehicles/${order.vehicle_id}`} className="font-mono text-[13px] text-accent hover:underline">{order.vehicle?.plate_no ?? '-'}</Link><p className="mt-0.5 text-xs text-muted">{order.vehicle?.model?.brand} {order.vehicle?.model?.name}</p></Td>
                <Td className="max-w-56 truncate text-[13px]">{order.description || order.type}</Td>
                <Td className="text-[13px] text-muted">{order.vendor || '-'}</Td>
                <Td className="font-mono text-[13px] text-muted">{formatDate(order.scheduled_at)}</Td>
                <Td><Money cents={order.cost_cents} className="text-[13px]" /></Td>
                <Td><StatusBadge status={order.status} /></Td>
                <Td>{nextStatus[order.status] ? <Button size="sm" variant="soft" loading={advancing} onClick={() => onAdvance(order.id, nextStatus[order.status])}>{nextLabel[order.status]}</Button> : <Button size="sm" variant="secondary" disabled>{order.status === 'cancelled' ? '已取消' : '已完成'}</Button>}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  )
}