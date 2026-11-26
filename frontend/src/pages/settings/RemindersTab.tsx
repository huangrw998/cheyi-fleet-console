import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import { ShieldCheck } from '@phosphor-icons/react'
import type { RemindersInput, SettingsData } from '@/types'
import { Button, Field, InlineError, NumberInput, SectionHeader } from '@/components/ui'


export function RemindersTab({ reminders, onSave, saving }: { reminders: SettingsData['reminders']; onSave: (input: RemindersInput) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState(reminders)
  const [error, setError] = useState('')

  useEffect(() => setForm(reminders), [reminders])

  const save = async () => {
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(errorText(err, '保存失败'))
    }
  }

  return (
    <div className="p-5">
      <div className="max-w-2xl">
        <SectionHeader title="提醒规则" description="影响总览的风险提醒与通知" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="保险提前提醒（天）"><NumberInput value={form.insurance_days} onChange={(value) => setForm({ ...form, insurance_days: value })} suffix="天" min={1} max={365} /></Field>
          <Field label="保养里程间隔（km）"><NumberInput value={form.maintenance_km} onChange={(value) => setForm({ ...form, maintenance_km: value })} suffix="km" min={1000} step={500} /></Field>
          <Field label="租金逾期提醒（天）"><NumberInput value={form.overdue_days} onChange={(value) => setForm({ ...form, overdue_days: value })} suffix="天" min={1} max={30} /></Field>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-info/20 bg-info-soft px-3 py-2 text-[11px] leading-5 text-info">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />规则保存后会立即作用于总览的风险提醒。当前环境不会发送短信或邮件。
        </div>
        <InlineError message={error} className="mt-3" />
        <Button className="mt-5" variant="primary" loading={saving} onClick={() => void save()}>保存提醒规则</Button>
      </div>
    </div>
  )
}