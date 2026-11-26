import { errorText } from '@/lib/errors'
import { useToast } from '@/app/toast'
import { useState } from 'react'
import type { DriverCreateInput } from '@/types'
import { Button, DatePicker, Field, Input, Modal, NumberInput, Select, Textarea } from '@/components/ui'


const emptyForm = {
  name: '',
  phone: '',
  id_card_no: '',
  license_no: '',
  license_expiry: '',
  status: 'pending',
  rating: '4.8',
  emergency_contact: '',
  note: '',
}

export function DriverCreateModal({
  open,
  onClose,
  onCreate,
  creating,
}: {
  open: boolean
  onClose: () => void
  onCreate: (input: DriverCreateInput) => Promise<void>
  creating: boolean
}) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('')
      toast({ title: '姓名和手机号不能为空', tone: 'warning' })
      return
    }
    setError('')
    try {
      await onCreate({ ...form, status: form.status as DriverCreateInput['status'], rating: Number(form.rating || 0) })
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
      title="新增司机"
      description="创建后可继续补充证件和租约信息。"
      width="max-w-2xl"
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={creating} onClick={() => void submit()}>创建司机</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="姓名" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="周启明" /></Field>
        <Field label="手机号" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="139 0000 0000" /></Field>
        <Field label="身份证号"><Input value={form.id_card_no} onChange={(e) => setForm({ ...form, id_card_no: e.target.value })} placeholder="3101011990..." /></Field>
        <Field label="驾照号"><Input value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} /></Field>
        <Field label="驾照到期日"><DatePicker value={form.license_expiry} onChange={(value) => setForm({ ...form, license_expiry: value })} /></Field>
        <Field label="认证状态">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
            <option value="pending">待审核</option>
            <option value="certified">已认证</option>
            <option value="blacklisted">黑名单</option>
          </Select>
        </Field>
        <Field label="服务评分"><NumberInput value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} min={0} max={5} step={0.1} precision={1} /></Field>
        <Field label="紧急联系人"><Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} /></Field>
        <Field label="备注" className="sm:col-span-2"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="审核记录、特殊情况等" /></Field>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
    </Modal>
  )
}
