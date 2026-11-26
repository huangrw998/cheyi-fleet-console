import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import type { PlanInput, PricingPlan } from '@/types'
import { Button, Field, Input, Modal, NumberInput, Select } from '@/components/ui'


export type PlanModalValue = PricingPlan | 'new' | null

const emptyForm = { name: '', body_type: 'sedan', monthly_rent_cents: '', deposit_cents: '', min_term_months: '6', status: 'active' }

export function PlanModal({ value, onClose, onSave, saving }: { value: PlanModalValue; onClose: () => void; onSave: (id: number | undefined, input: PlanInput) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!value) return
    if (value === 'new') setForm(emptyForm)
    else setForm({
      name: value.name,
      body_type: value.body_type,
      monthly_rent_cents: String(value.monthly_rent_cents / 100),
      deposit_cents: String(value.deposit_cents / 100),
      min_term_months: String(value.min_term_months),
      status: value.status,
    })
    setError('')
  }, [value])

  const save = async () => {
    if (!value) return
    setError('')
    try {
      await onSave(value === 'new' ? undefined : value.id, {
        ...form,
        monthly_rent_cents: Math.round(Number(form.monthly_rent_cents || 0) * 100),
        deposit_cents: Math.round(Number(form.deposit_cents || 0) * 100),
        min_term_months: Number(form.min_term_months || 0),
      })
      onClose()
    } catch (err) {
      setError(errorText(err, '保存失败'))
    }
  }

  return (
    <Modal open={Boolean(value)} onClose={onClose} title={value === 'new' ? '新增价格方案' : '编辑价格方案'} footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={saving} onClick={() => void save()}>保存方案</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="方案名称" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="舒适轿车月租" /></Field>
        <Field label="车身类型">
          <Select value={form.body_type} onChange={(value) => setForm({ ...form, body_type: value })}>
            <option value="sedan">轿车</option>
            <option value="suv">SUV</option>
            <option value="mpv">MPV</option>
            <option value="hatchback">两厢</option>
            <option value="wagon">旅行车</option>
          </Select>
        </Field>
        <Field label="最短租期（月）"><NumberInput value={form.min_term_months} onChange={(value) => setForm({ ...form, min_term_months: value })} suffix="月" min={1} max={36} /></Field>
        <Field label="月租（元）"><NumberInput value={form.monthly_rent_cents} onChange={(value) => setForm({ ...form, monthly_rent_cents: value })} suffix="元" min={0} step={100} /></Field>
        <Field label="押金（元）"><NumberInput value={form.deposit_cents} onChange={(value) => setForm({ ...form, deposit_cents: value })} suffix="元" min={0} step={500} /></Field>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
    </Modal>
  )
}
