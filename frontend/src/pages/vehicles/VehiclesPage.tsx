import { useState } from 'react'
import { CarProfile, Plus, ShieldCheck, Wrench } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { VehicleCreateInput } from '@/types'
import { Button, Card, PageHeader, StatStrip } from '@/components/ui'
import { VehicleCreateModal } from './VehicleCreateModal'
import { VehicleFilters } from './VehicleFilters'
import { VehiclesTable } from './VehiclesTable'
import { useVehicles } from './useVehicles'

export default function VehiclesPage() {
  const [searchText, setSearchText] = useState('')
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const state = useVehicles()

  const create = async (input: VehicleCreateInput) => {
    try {
      await state.createVehicle(input)
      toast({ title: '车辆已创建', description: '车辆档案已写入系统。', tone: 'success' })
    } catch (err) {
      toast({ title: '车辆创建失败', description: errorText(err), tone: 'error' })
      throw err
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="车辆资产"
        description="每一台车的状态、门店、里程和保险到期都在这里。支持按状态和门店筛选。"
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={16} /> 新增车辆</Button>}
      />

      <StatStrip
        items={[
          { label: '车队总车辆', value: state.kpis?.total_vehicles ?? '-', icon: <CarProfile size={16} /> },
          { label: '在租', value: state.kpis?.active_leases ?? '-', icon: <ShieldCheck size={16} /> },
          { label: '待租', value: state.kpis?.available_vehicles ?? '-', icon: <CarProfile size={16} /> },
          { label: '维保中', value: state.kpis?.maintenance_vehicles ?? '-', icon: <Wrench size={16} /> },
        ]}
        columns={4}
      />

      <Card className="overflow-hidden">
        <VehicleFilters
          q={searchText}
          status={state.status}
          storeId={state.storeId}
          stores={state.stores}
          total={state.listQuery.data?.meta.total ?? 0}
          onSearch={(value) => { setSearchText(value); state.update('q', value) }}
          onUpdate={state.update}
        />
        <VehiclesTable
            data={state.listQuery.data}
            loading={state.listQuery.isLoading}
            error={state.listQuery.isError}
            onRetry={() => void state.listQuery.refetch()}
            page={state.page}
            pageSize={state.pageSize}
            onPage={(page) => state.update('page', String(page))}
          onPageSize={(size) => state.update('page_size', String(size))}
        />
      </Card>

      <VehicleCreateModal open={open} onClose={() => setOpen(false)} onCreate={create} creating={state.creating} models={state.models} stores={state.stores} />
    </div>
  )
}