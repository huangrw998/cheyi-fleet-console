import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { LeaseActionKind } from '@/types'
import { BackLink, ErrorState, Skeleton } from '@/components/ui'
import { LeaseActionModal, defaultMileage } from './LeaseActionModal'
import { LeaseBillsCard } from './LeaseBillsCard'
import { LeaseHeader } from './LeaseHeader'
import { LeaseProgressCard } from './LeaseProgressCard'
import { LeaseSidePanel } from './LeaseSidePanel'
import { LeaseTimeline } from './LeaseTimeline'
import { useLeaseDetail } from './useLeaseDetail'

export default function LeaseDetailPage() {
  const { id = '' } = useParams()
  const [action, setAction] = useState<LeaseActionKind | null>(null)
  const [mileage, setMileage] = useState('')
  const [deductions, setDeductions] = useState('0')
  const [note, setNote] = useState('')
  const { toast } = useToast()
  const state = useLeaseDetail(id)
  const lease = state.data?.data

  if (state.isLoading) return <div className="space-y-4"><Skeleton className="h-5 w-32" /><Skeleton className="h-52" /><Skeleton className="h-96" /></div>
  if (state.isError || !lease) return <ErrorState message="租约详情加载失败" onRetry={() => void state.refetch()} />

  const openAction = (kind: LeaseActionKind) => {
    setAction(kind)
    setMileage(defaultMileage(lease, kind))
    setDeductions('0')
    setNote('')
  }

  const confirm = async (kind: LeaseActionKind) => {
    const payload =
      kind === 'handover' ? { mileage_km: Number(mileage || 0), note }
        : kind === 'return' ? { mileage_km: Number(mileage || 0), deductions_cents: Math.round(Number(deductions || 0) * 100), note }
          : kind === 'cancel' ? { note }
            : {}
    try {
      await state.act({ kind, ...payload })
      const title = { sign: '租约已签约', handover: '车辆已交车', return: '租约已退租', cancel: '租约已取消' }[kind]
      toast({ title, tone: 'success' })
      setAction(null)
    } catch (err) {
      toast({ title: '操作失败', description: errorText(err), tone: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <BackLink to="/leases">返回租约列表</BackLink>
      <LeaseHeader lease={lease} onAction={openAction} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <LeaseProgressCard lease={lease} />
          <LeaseBillsCard bills={lease.bills ?? []} />
          <LeaseTimeline events={lease.events ?? []} />
        </div>
        <LeaseSidePanel lease={lease} />
      </div>
      <LeaseActionModal
        action={action}
        lease={lease}
        onClose={() => setAction(null)}
        onConfirm={(kind) => void confirm(kind)}
        loading={state.acting}
        mileage={mileage}
        setMileage={setMileage}
        deductions={deductions}
        setDeductions={setDeductions}
        note={note}
        setNote={setNote}
      />
    </div>
  )
}