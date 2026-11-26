import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import type { Vehicle, VehicleUpdateInput } from '@/types'
import { Button, DatePicker, Field, Input, Modal, NumberInput, Select } from '@/components/ui'


export function VehicleEditModal({
  open,
  vehicle,
  onClose,
  onSave,
  saving,
}: {
  open: boolean
  vehicle?: Vehicle
  onClose: () => void
  onSave: (input: VehicleUpdateInput) => Promise<void>
  saving: boolean
}) {
  const [form, setForm] = useState({ status: '', mileage_km: '', insurance_expiry: '', note: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!vehicle || !open) return
    setForm({
      status: vehicle.status,
      mileage_km: String(vehicle.mileage_km),
      insurance_expiry: vehicle.insurance_expiry?.slice(0, 10) ?? '',
      note: vehicle.note ?? '',
    })
    setError('')
  }, [vehicle, open])

  const save = async () => {
    setError('')
    try {
      await onSave({
        status: form.status as VehicleUpdateInput['status'],
        mileage_km: Number(form.mileage_km || 0),
        insurance_expiry: form.insurance_expiry || undefined,
        note: form.note,
      })
      onClose()
    } catch (err) {
      setError(errorText(err, '更新失败'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="编辑车辆档案"
      description="状态和里程变更会同步到车队看板。"
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={saving} onClick={() => void save()}>保存档案</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="车辆状态">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
            <option value="available">待租</option>
            <option value="rented">在租</option>
            <option value="reserved">已锁定</option>
            <option value="maintenance">维保中</option>
            <option value="dispatch">调拨中</option>
            <option value="retired">停运</option>
          </Select>
        </Field>
        <Field label="当前里程（km）"><NumberInput value={form.mileage_km} onChange={(value) => setForm({ ...form, mileage_km: value })} suffix="km" min={0} step={100} /></Field>
        <Field label="保险到期日"><DatePicker value={form.insurance_expiry} onChange={(value) => setForm({ ...form, insurance_expiry: value })} /></Field>
        <Field label="备注" className="sm:col-span-2"><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="车辆状况或运营备注" /></Field>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
    </Modal>
  )
}
