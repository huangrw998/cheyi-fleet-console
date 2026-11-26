import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import type { Driver, DriverUpdateInput } from '@/types'
import { Button, DatePicker, Field, InlineError, Modal, NumberInput, Select } from '@/components/ui'


export function DriverEditModal({ open, driver, onClose, onSave, saving }: { open: boolean; driver?: Driver; onClose: () => void; onSave: (input: DriverUpdateInput) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState({ status: '', license_expiry: '', rating: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!driver || !open) return
    setForm({ status: driver.status, license_expiry: driver.license_expiry?.slice(0, 10) ?? '', rating: String(driver.rating) })
    setError('')
  }, [driver, open])

  const save = async () => {
    setError('')
    try {
      await onSave({ status: form.status as DriverUpdateInput['status'], license_expiry: form.license_expiry || undefined, rating: form.rating ? Number(form.rating) : undefined })
      onClose()
    } catch (err) {
      setError(errorText(err, '更新失败'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="编辑司机档案" description="更新认证状态、驾照到期日和评分。" footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={saving} onClick={() => void save()}>保存档案</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="认证状态">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
            <option value="pending">待审核</option>
            <option value="certified">已认证</option>
            <option value="leased">租用中</option>
            <option value="blacklisted">黑名单</option>
          </Select>
        </Field>
        <Field label="驾照到期日"><DatePicker value={form.license_expiry} onChange={(value) => setForm({ ...form, license_expiry: value })} /></Field>
        <Field label="服务评分"><NumberInput value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} min={0} max={5} step={0.1} precision={1} /></Field>
      </div>
      <InlineError message={error} className="mt-3" />
    </Modal>
  )
}
