import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import type { MaintenanceCreateInput } from '@/types'
import { errorText } from '@/lib/errors'
import { Button, ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { InsuranceCard } from './InsuranceCard'
import { MaintenanceCreateModal } from './MaintenanceCreateModal'
import { MaintenanceOrdersCard } from './MaintenanceOrdersCard'
import { MaintenanceStats } from './MaintenanceStats'
import { useMaintenance } from './useMaintenance'

export default function MaintenancePage() {
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const state = useMaintenance()

  if (state.ordersQuery.isLoading || state.insuranceQuery.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-80" /></div>
  if (state.ordersQuery.isError) return <ErrorState message="维保数据加载失败" onRetry={() => void state.ordersQuery.refetch()} />

  const create = async (input: MaintenanceCreateInput) => {
    try {
      await state.createOrder(input)
      toast({ title: '维保工单已创建', description: '车辆状态已切换为维保中。', tone: 'success' })
    } catch (err) {
      toast({ title: '工单创建失败', description: errorText(err), tone: 'error' })
      throw err
    }
  }
  const advance = async (id: number, status: string) => {
    try {
      await state.advance({ id, status })
      toast({ title: '工单状态已更新', tone: 'success' })
    } catch (err) {
      toast({ title: '操作失败', description: errorText(err), tone: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="维保保险" description="保养计划、维修工单和保险到期。维保中的车辆会自动从可租池移除。" actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={16} /> 创建工单</Button>} />
      <MaintenanceStats pending={state.pending} inProgress={state.inProgress} expiring={state.expiring} totalCost={state.totalCost} />
      <MaintenanceOrdersCard orders={state.orders} tab={tab} onTab={setTab} onAdvance={(id, status) => void advance(id, status)} advancing={state.advancing} />
      <InsuranceCard insurance={state.insurance} />
      <MaintenanceCreateModal open={open} onClose={() => setOpen(false)} onCreate={create} creating={state.creating} vehicles={state.vehicles} />
    </div>
  )
}