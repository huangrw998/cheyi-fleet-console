import { errorText } from '@/lib/errors'
import { useToast } from '@/app/toast'
import { useEffect, useState } from 'react'
import type { Vehicle, ViolationCreateInput } from '@/types'
import { todayISO } from '@/lib/format'
import { Button, DatePicker, Field, InlineError, Input, Modal, NumberInput, Select } from '@/components/ui'


const emptyForm = { vehicle_id: '', reason: '', location: '', fine_cents: '100', points: '0', occurred_at: todayISO() }

export function ViolationModal({
  open,
  onClose,
  onCreate,
  creating,
  vehicles,
}: {
  open: boolean
  onClose: () => void
  onCreate: (input: ViolationCreateInput) => Promise<void>
  creating: boolean
  vehicles: Vehicle[]
}) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (open) setError('')
  }, [open])

  const submit = async () => {
    if (!form.vehicle_id || !form.reason.trim()) {
      setError('')
      toast({ title: '车辆和违章原因不能为空', tone: 'warning' })
      return
    }
    setError('')
    try {
      await onCreate({
        vehicle_id: Number(form.vehicle_id),
        reason: form.reason,
        location: form.location,
        fine_cents: Math.round(Number(form.fine_cents || 0) * 100),
        points: Number(form.points || 0),
        occurred_at: form.occurred_at,
      })
      setForm(emptyForm)
      onClose()
    } catch (err) {
      setError(errorText(err, '创建失败'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="记录违章"
      description="处理后会尝试关联当前生效租约并生成待收账单。"
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={creating} onClick={() => void submit()}>保存违章</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="车辆" required className="sm:col-span-2">
          <Select value={form.vehicle_id} onChange={(value) => setForm({ ...form, vehicle_id: value })}>
            <option value="">选择车辆</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate_no} · {vehicle.model?.name}</option>)}
          </Select>
        </Field>
        <Field label="违章原因" required><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="违停、超速等" /></Field>
        <Field label="发生日期"><DatePicker value={form.occurred_at} onChange={(value) => setForm({ ...form, occurred_at: value })} /></Field>
        <Field label="地点"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
        <Field label="罚款（元）"><NumberInput value={form.fine_cents} onChange={(value) => setForm({ ...form, fine_cents: value })} suffix="元" min={0} step={50} /></Field>
        <Field label="扣分"><NumberInput value={form.points} onChange={(value) => setForm({ ...form, points: value })} suffix="分" min={0} max={12} /></Field>
      </div>
      <InlineError message={error} className="mt-3" />
    </Modal>
  )
}
