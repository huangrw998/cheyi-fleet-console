import { errorText } from '@/lib/errors'
import { useToast } from '@/app/toast'
import { useEffect, useState } from 'react'
import type { MaintenanceCreateInput, Vehicle } from '@/types'
import { todayISO } from '@/lib/format'
import { Button, DatePicker, Field, Input, Modal, NumberInput, Select, Textarea } from '@/components/ui'


const emptyForm = { vehicle_id: '', type: 'maintenance', scheduled_at: todayISO(), cost_cents: '0', vendor: '', mileage_km: '0', description: '' }

export function MaintenanceCreateModal({ open, onClose, onCreate, creating, vehicles }: { open: boolean; onClose: () => void; onCreate: (input: MaintenanceCreateInput) => Promise<void>; creating: boolean; vehicles: Vehicle[] }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
    setError('')
  }, [open])

  const submit = async () => {
    if (!form.vehicle_id) {
      setError('')
      toast({ title: '请选择车辆', tone: 'warning' })
      return
    }
    setError('')
    try {
      await onCreate({
        vehicle_id: Number(form.vehicle_id),
        type: form.type,
        scheduled_at: form.scheduled_at,
        cost_cents: Math.round(Number(form.cost_cents || 0) * 100),
        vendor: form.vendor,
        mileage_km: Number(form.mileage_km || 0),
        description: form.description,
      })
      onClose()
    } catch (err) {
      setError(errorText(err, '创建失败'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="创建维保工单" description="工单创建后车辆会进入维保中状态，完成后自动释放。" width="max-w-2xl" footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={creating} onClick={() => void submit()}>创建工单</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="车辆" required className="sm:col-span-2">
          <Select value={form.vehicle_id} onChange={(value) => {
            const vehicle = vehicles.find((v) => v.id === Number(value))
            setForm({ ...form, vehicle_id: value, mileage_km: String(vehicle?.mileage_km ?? 0), vendor: form.vendor || '驰驿自营维修中心' })
          }}>
            <option value="">选择待租车辆</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate_no} · {vehicle.model?.name} · {vehicle.store?.name}</option>)}
          </Select>
        </Field>
        <Field label="工单类型">
          <Select value={form.type} onChange={(value) => setForm({ ...form, type: value })}>
            <option value="maintenance">常规保养</option>
            <option value="repair">维修</option>
            <option value="inspection">年检</option>
          </Select>
        </Field>
        <Field label="计划日期"><DatePicker value={form.scheduled_at} onChange={(value) => setForm({ ...form, scheduled_at: value })} /></Field>
        <Field label="供应商"><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="维修厂或服务商" /></Field>
        <Field label="预估费用（元）"><NumberInput value={form.cost_cents} onChange={(value) => setForm({ ...form, cost_cents: value })} suffix="元" min={0} step={100} /></Field>
        <Field label="当前里程（km）"><NumberInput value={form.mileage_km} onChange={(value) => setForm({ ...form, mileage_km: value })} suffix="km" min={0} step={100} /></Field>
        <Field label="工单说明" className="sm:col-span-2"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="保养项目、故障描述、预计工期等" /></Field>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
    </Modal>
  )
}
