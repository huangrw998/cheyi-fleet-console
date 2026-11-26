import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { VehicleUpdateInput } from '@/types'
import { BackLink, Card, CardToolbar, ErrorState, Skeleton, Tabs } from '@/components/ui'
import { VehicleEditModal } from './VehicleEditModal'
import { VehicleHeader } from './VehicleHeader'
import { VehicleInsuranceTab } from './VehicleInsuranceTab'
import { VehicleLeasesTab } from './VehicleLeasesTab'
import { VehicleMaintenanceTab } from './VehicleMaintenanceTab'
import { VehicleProfileTab } from './VehicleProfileTab'
import { useVehicleDetail } from './useVehicleDetail'

export default function VehicleDetailPage() {
  const { id = '' } = useParams()
  const [tab, setTab] = useState('profile')
  const [editOpen, setEditOpen] = useState(false)
  const { toast } = useToast()
  const detail = useVehicleDetail(id)
  const data = detail.data?.data

  if (detail.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-5 w-32" /><Skeleton className="h-56 w-full" /><Skeleton className="h-80 w-full" /></div>
  }
  if (detail.isError || !data) return <ErrorState message="车辆详情加载失败" onRetry={() => void detail.refetch()} />

  const { vehicle, leases, maintenance, insurance, violations } = data
  const activeLease = leases.find((lease) => ['active', 'pending_pickup', 'pending_return'].includes(lease.status))
  const tabs = [
    { value: 'profile', label: '车辆档案' },
    { value: 'leases', label: '租约记录', count: leases.length },
    { value: 'maintenance', label: '维保记录', count: maintenance.length },
    { value: 'insurance', label: '保险与违章', count: insurance.length + violations.length },
  ]

  const save = async (input: VehicleUpdateInput) => {
    try {
      await detail.updateVehicle(input)
      toast({ title: '车辆档案已更新', tone: 'success' })
    } catch (err) {
      toast({ title: '车辆档案保存失败', description: errorText(err), tone: 'error' })
      throw err
    }
  }

  return (
    <div className="space-y-5">
      <BackLink to="/vehicles">返回车辆资产</BackLink>

      <VehicleHeader vehicle={vehicle} activeLease={activeLease} onEdit={() => setEditOpen(true)} />

      <Card className="overflow-hidden">
        <CardToolbar><Tabs items={tabs} value={tab} onChange={setTab} /></CardToolbar>
        {tab === 'profile' ? <VehicleProfileTab vehicle={vehicle} activeLease={activeLease} /> : null}
        {tab === 'leases' ? <VehicleLeasesTab leases={leases} /> : null}
        {tab === 'maintenance' ? <VehicleMaintenanceTab orders={maintenance} /> : null}
        {tab === 'insurance' ? <VehicleInsuranceTab insurance={insurance} violations={violations} /> : null}
      </Card>

      <VehicleEditModal open={editOpen} vehicle={vehicle} onClose={() => setEditOpen(false)} onSave={save} saving={detail.updating} />
    </div>
  )
}