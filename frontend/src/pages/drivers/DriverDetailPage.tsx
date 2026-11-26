import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { DriverUpdateInput } from '@/types'
import { BackLink, ErrorState, Skeleton } from '@/components/ui'
import { DriverBillsCard } from './DriverBillsCard'
import { DriverDocsCard } from './DriverDocsCard'
import { DriverEditModal } from './DriverEditModal'
import { DriverHeader } from './DriverHeader'
import { DriverLeasesCard } from './DriverLeasesCard'
import { DriverViolationsCard } from './DriverViolationsCard'
import { useDriverDetail } from './useDriverDetail'

export default function DriverDetailPage() {
  const { id = '' } = useParams()
  const [editOpen, setEditOpen] = useState(false)
  const { toast } = useToast()
  const state = useDriverDetail(id)
  const data = state.data?.data

  if (state.isLoading) return <div className="space-y-4"><Skeleton className="h-5 w-32" /><Skeleton className="h-48" /><Skeleton className="h-80" /></div>
  if (state.isError || !data) return <ErrorState message="司机详情加载失败" onRetry={() => void state.refetch()} />

  const { driver, leases, bills, violations } = data
  const activeLease = leases.find((lease) => ['active', 'pending_pickup', 'pending_sign'].includes(lease.status))

  const save = async (input: DriverUpdateInput) => {
    try {
      await state.updateDriver(input)
      toast({ title: '司机档案已更新', tone: 'success' })
    } catch (err) {
      toast({ title: '司机档案保存失败', description: errorText(err), tone: 'error' })
      throw err
    }
  }

  return (
    <div className="space-y-5">
      <BackLink to="/drivers">返回司机管理</BackLink>
      <DriverHeader driver={driver} leases={leases} bills={bills} violations={violations} onEdit={() => setEditOpen(true)} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <DriverLeasesCard leases={leases} />
          <DriverBillsCard bills={bills} />
          <DriverViolationsCard violations={violations} />
        </div>
        <DriverDocsCard driver={driver} activeLease={activeLease} />
      </div>
      <DriverEditModal open={editOpen} driver={driver} onClose={() => setEditOpen(false)} onSave={save} saving={state.updating} />
    </div>
  )
}