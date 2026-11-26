import { CheckCircle, Clock, ShieldCheck, Wrench } from '@phosphor-icons/react'
import { formatMoney } from '@/lib/format'
import { StatStrip } from '@/components/ui'

export function MaintenanceStats({ pending, inProgress, expiring, totalCost }: { pending: number; inProgress: number; expiring: number; totalCost: number }) {
  return (
    <StatStrip
      columns={4}
      items={[
        { label: '待处理工单', value: pending, icon: <Clock size={16} /> },
        { label: '维修中', value: inProgress, icon: <Wrench size={16} /> },
        { label: '30 天内保险到期', value: expiring, icon: <ShieldCheck size={16} /> },
        { label: '已完成维保费用', value: formatMoney(totalCost, true), icon: <CheckCircle size={16} /> },
      ]}
    />
  )
}