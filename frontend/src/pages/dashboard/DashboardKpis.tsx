import { CarProfile, CurrencyCny, Garage, ShieldWarning, SteeringWheel, Wrench } from '@phosphor-icons/react'
import type { DashboardData } from '@/types'
import { formatMoney, formatPercent } from '@/lib/format'
import { StatStrip } from '@/components/ui'

export function DashboardKpis({ kpis }: { kpis: DashboardData['kpis'] }) {
  return (
    <StatStrip
      columns={6}
      items={[
        { label: '在租车辆', value: kpis.active_leases, hint: `总车辆 ${kpis.total_vehicles} 台`, icon: <CarProfile size={17} /> },
        { label: '待租车辆', value: kpis.available_vehicles, hint: '可立即分配', icon: <Garage size={17} /> },
        { label: '维保中', value: kpis.maintenance_vehicles, hint: '含待排期与在修', icon: <Wrench size={17} /> },
        { label: '逾期账单', value: kpis.overdue_bills, hint: '需优先跟进', icon: <ShieldWarning size={17} /> },
        { label: '本月应收', value: formatMoney(kpis.monthly_receivable_cents, true), hint: '本月到期未收', icon: <CurrencyCny size={17} /> },
        { label: '车队出租率', value: formatPercent(kpis.utilization), hint: '在租 / 总车辆', icon: <SteeringWheel size={17} /> },
      ]}
    />
  )
}