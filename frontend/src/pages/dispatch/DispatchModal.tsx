import { errorText } from '@/lib/errors'
import { useToast } from '@/app/toast'
import { useEffect, useState } from 'react'
import type { DispatchCreateInput, Store, Vehicle } from '@/types'
import { todayISO } from '@/lib/format'
import { Button, DatePicker, Field, InlineError, Input, Modal, Select } from '@/components/ui'


export function DispatchModal({
  open,
  initialVehicle,
  pool,
  stores,
  onClose,
  onCreate,
  creating,
}: {
  open: boolean
  initialVehicle?: Vehicle
  pool: Vehicle[]
  stores: Store[]
  onClose: () => void
  onCreate: (input: DispatchCreateInput) => Promise<void>
  creating: boolean
}) {
  const [form, setForm] = useState({ vehicle_id: '', to_store_id: '', scheduled_at: todayISO(), note: '' })
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    setForm({ vehicle_id: initialVehicle ? String(initialVehicle.id) : '', to_store_id: '', scheduled_at: todayISO(), note: '' })
    setError('')
  }, [open, initialVehicle])

  const submit = async () => {
    if (!form.vehicle_id || !form.to_store_id) {
      setError('')
      toast({ title: '车辆和目标门店不能为空', tone: 'warning' })
      return
    }
    setError('')
    try {
      await onCreate({ vehicle_id: Number(form.vehicle_id), to_store_id: Number(form.to_store_id), scheduled_at: form.scheduled_at, note: form.note })
      onClose()
    } catch (err) {
      setError(errorText(err, '创建失败'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="发起调拨" description="车辆会进入调拨中状态，完成调拨后归属门店自动更新。" footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={creating} onClick={() => void submit()}>创建调拨</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="车辆" required className="sm:col-span-2">
          <Select value={form.vehicle_id} onChange={(value) => setForm({ ...form, vehicle_id: value })}>
            <option value="">选择待租车辆</option>
            {pool.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate_no} · {vehicle.model?.name} · {vehicle.store?.name}</option>)}
          </Select>
        </Field>
        <Field label="目标门店" required>
          <Select value={form.to_store_id} onChange={(value) => setForm({ ...form, to_store_id: value })}>
            <option value="">选择门店</option>
            {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </Select>
        </Field>
        <Field label="计划日期"><DatePicker value={form.scheduled_at} onChange={(value) => setForm({ ...form, scheduled_at: value })} /></Field>
        <Field label="备注" className="sm:col-span-2"><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="调拨原因、司机安排等" /></Field>
      </div>
      <InlineError message={error} className="mt-3" />
    </Modal>
  )
}
