import { useState } from 'react'
import { ArrowsLeftRight, CheckCircle, Garage, Plus, Truck } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { DispatchCreateInput, Vehicle } from '@/types'
import { Button, Card, ErrorState, PageHeader, Skeleton, StatStrip } from '@/components/ui'
import { DispatchModal } from './DispatchModal'
import { DispatchTasksTable } from './DispatchTasksTable'
import { StoreMatrix } from './StoreMatrix'
import { VehiclePool } from './VehiclePool'
import { useDispatch } from './useDispatch'

export default function DispatchPage() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Vehicle | undefined>()
  const { toast } = useToast()
  const state = useDispatch()

  if (state.dispatchQuery.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-80" /></div>
  if (state.dispatchQuery.isError) return <ErrorState message="调度中心加载失败" onRetry={() => void state.dispatchQuery.refetch()} />

  const openCreate = (vehicle?: Vehicle) => {
    setSelected(vehicle)
    setOpen(true)
  }
  const create = async (input: DispatchCreateInput) => {
    try {
      await state.createTask(input)
      toast({ title: '调拨任务已创建', description: '车辆状态已切换为调拨中。', tone: 'success' })
    } catch (err) {
      toast({ title: '调拨任务创建失败', description: errorText(err), tone: 'error' })
      throw err
    }
  }
  const complete = async (id: number) => {
    try {
      await state.completeTask(id)
      toast({ title: '调拨已完成', description: '车辆已到达目标门店。', tone: 'success' })
    } catch (err) {
      toast({ title: '操作失败', description: errorText(err), tone: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="调度中心" description="看门店库存、安排跨店调拨，把待租车辆放到更需要它的门店。" actions={<Button variant="primary" onClick={() => openCreate()}><Plus size={16} /> 发起调拨</Button>} />
      <StatStrip
        columns={4}
        items={[
          { label: '待执行调拨', value: state.pendingTasks, icon: <ArrowsLeftRight size={16} /> },
          { label: '已完成调拨', value: state.completedTasks, icon: <CheckCircle size={16} /> },
          { label: '可调拨车辆', value: state.pool.length, icon: <Truck size={16} /> },
          { label: '运营门店', value: state.stores.length, icon: <Garage size={16} /> },
        ]}
      />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden"><StoreMatrix matrix={state.matrix} /></Card>
        <VehiclePool pool={state.pool} onDispatch={openCreate} />
      </div>
      <DispatchTasksTable tasks={state.tasks} onComplete={(id) => void complete(id)} completing={state.completing} />
      <DispatchModal open={open} initialVehicle={selected} pool={state.pool} stores={state.stores} onClose={() => setOpen(false)} onCreate={create} creating={state.creating} />
    </div>
  )
}