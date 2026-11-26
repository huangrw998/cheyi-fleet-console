import { Link } from 'react-router-dom'
import type { MaintenanceOrder } from '@/types'
import { formatDate } from '@/lib/format'
import { DataTable, Money, StatusBadge, Td, Th } from '@/components/ui'

export function VehicleMaintenanceTab({ orders }: { orders: MaintenanceOrder[] }) {
  if (orders.length === 0) return <div className="px-5 py-12 text-center text-xs text-muted">暂无维保记录</div>
  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-xs text-muted">共 {orders.length} 条维保记录</p>
        <Link to="/maintenance" className="text-xs text-accent hover:underline">创建工单</Link>
      </div>
      <DataTable>
        <thead><tr><Th>工单号</Th><Th>类型</Th><Th>供应商</Th><Th>费用</Th><Th>计划日期</Th><Th>状态</Th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="transition hover:bg-card2/40">
              <Td className="font-mono text-xs">{order.order_no}</Td>
              <Td className="text-xs">{order.description}</Td>
              <Td className="text-xs text-muted">{order.vendor}</Td>
              <Td><Money cents={order.cost_cents} className="text-xs" /></Td>
              <Td className="font-mono text-xs text-muted">{formatDate(order.scheduled_at)}</Td>
              <Td><StatusBadge status={order.status} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}