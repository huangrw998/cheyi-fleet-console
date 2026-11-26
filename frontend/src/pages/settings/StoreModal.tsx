import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import type { Store, StoreUpdateInput } from '@/types'
import { Button, Field, Input, Modal, NumberInput, Select } from '@/components/ui'


export function StoreModal({ open, store, onClose, onSave, saving }: { open: boolean; store: Store | null; onClose: () => void; onSave: (id: number, input: StoreUpdateInput) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState({ name: '', district: '', address: '', capacity: '0', status: 'active', image: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!store || !open) return
    setForm({ name: store.name, district: store.district, address: store.address, capacity: String(store.capacity), status: store.status, image: store.image })
    setError('')
  }, [store, open])

  const save = async () => {
    if (!store) return
    setError('')
    try {
      await onSave(store.id, { ...form, capacity: Number(form.capacity || 0) })
      onClose()
    } catch (err) {
      setError(errorText(err, '保存失败'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="编辑门店" footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={saving} onClick={() => void save()}>保存门店</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="门店名称"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="区域"><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Field>
        <Field label="地址" className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="容量"><NumberInput value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} suffix="台" min={0} max={200} /></Field>
        <Field label="状态">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
            <option value="active">营业中</option>
            <option value="paused">暂停营业</option>
          </Select>
        </Field>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
    </Modal>
  )
}
