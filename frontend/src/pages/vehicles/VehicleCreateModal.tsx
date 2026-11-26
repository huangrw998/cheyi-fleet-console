import { errorText } from '@/lib/errors'
import { useToast } from '@/app/toast'
import { useState } from 'react'
import type { Store, VehicleCreateInput, VehicleModel } from '@/types'
import { Button, DatePicker, Field, InlineError, Input, Modal, NumberInput, Select } from '@/components/ui'

const emptyForm = {
  plate_no: '',
  model_id: '',
  store_id: '',
  color: '珍珠白',
  status: 'available',
  mileage_km: '0',
  insurance_expiry: '',
  inspection_expiry: '',
  vin: '',
}

export function VehicleCreateModal({
  open,
  onClose,
  onCreate,
  creating,
  models,
  stores,
}: {
  open: boolean
  onClose: () => void
  onCreate: (input: VehicleCreateInput) => Promise<void>
  creating: boolean
  models: VehicleModel[]
  stores: Store[]
}) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const submit = async () => {
    if (!form.plate_no.trim() || !form.model_id || !form.store_id) {
      setError('')
      toast({ title: '车牌、车型和门店不能为空', tone: 'warning' })
      return
    }
    setError('')
    try {
      await onCreate({
        plate_no: form.plate_no,
        model_id: Number(form.model_id),
        store_id: Number(form.store_id),
        color: form.color,
        status: form.status as VehicleCreateInput['status'],
        mileage_km: Number(form.mileage_km || 0),
        insurance_expiry: form.insurance_expiry,
        inspection_expiry: form.inspection_expiry,
        vin: form.vin,
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
      title="新增车辆"
      description="录入车辆档案后会立即进入车队资产池。"
      width="max-w-2xl"
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={creating} onClick={() => void submit()}>创建车辆</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="车牌号" required><Input value={form.plate_no} onChange={(e) => setForm({ ...form, plate_no: e.target.value })} placeholder="输入车牌号" /></Field>
        <Field label="车型" required>
          <Select value={form.model_id} onChange={(value) => setForm({ ...form, model_id: value })}>
            <option value="">选择车型</option>
            {models.map((model) => <option key={model.id} value={model.id}>{model.brand} {model.name}</option>)}
          </Select>
        </Field>
        <Field label="所属门店" required>
          <Select value={form.store_id} onChange={(value) => setForm({ ...form, store_id: value })}>
            <option value="">选择门店</option>
            {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </Select>
        </Field>
        <Field label="车身颜色">
          <Select value={form.color} onChange={(value) => setForm({ ...form, color: value })}>
            {['珍珠白', '曜石黑', '星河蓝', '云雾灰', '青柠绿'].map((color) => <option key={color}>{color}</option>)}
          </Select>
        </Field>
        <Field label="当前里程（km）"><NumberInput value={form.mileage_km} onChange={(value) => setForm({ ...form, mileage_km: value })} suffix="km" min={0} step={100} /></Field>
        <Field label="车辆状态">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
            <option value="available">待租</option>
            <option value="maintenance">维保中</option>
            <option value="retired">停运</option>
          </Select>
        </Field>
        <Field label="保险到期日"><DatePicker value={form.insurance_expiry} onChange={(value) => setForm({ ...form, insurance_expiry: value })} /></Field>
        <Field label="年检到期日"><DatePicker value={form.inspection_expiry} onChange={(value) => setForm({ ...form, inspection_expiry: value })} /></Field>
        <Field label="VIN" className="sm:col-span-2"><Input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} placeholder="17 位车架号" /></Field>
      </div>
      <InlineError message={error} className="mt-3" />
    </Modal>
  )
}
