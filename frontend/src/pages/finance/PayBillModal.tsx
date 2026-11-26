import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import type { Bill, PayBillInput } from '@/types'
import { billTypeLabel, formatMoney, todayISO } from '@/lib/format'
import { Button, DatePicker, Field, Modal, NumberInput, Select } from '@/components/ui'


export function PayBillModal({ bill, onClose, onPay, paying }: { bill: Bill | null; onClose: () => void; onPay: (id: number, input: PayBillInput) => Promise<void>; paying: boolean }) {
  const [form, setForm] = useState({ method: 'bank', paid_at: todayISO(), amount_cents: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!bill) return
    setForm({ method: 'bank', paid_at: todayISO(), amount_cents: String(bill.amount_cents / 100) })
    setError('')
  }, [bill])

  const submit = async () => {
    if (!bill) return
    setError('')
    try {
      await onPay(bill.id, {
        method: form.method,
        paid_at: form.paid_at,
        amount_cents: form.amount_cents ? Math.round(Number(form.amount_cents) * 100) : undefined,
      })
      onClose()
    } catch (err) {
      setError(errorText(err, '收款失败'))
    }
  }

  return (
    <Modal
      open={Boolean(bill)}
      onClose={onClose}
      title="登记收款"
      description={bill ? `${bill.bill_no} · ${billTypeLabel(bill.type)} · ${formatMoney(bill.amount_cents)}` : ''}
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={paying} onClick={() => void submit()}>确认收款</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="收款方式">
          <Select value={form.method} onChange={(value) => setForm({ ...form, method: value })}>
            <option value="bank">银行转账</option>
            <option value="alipay">支付宝</option>
            <option value="wechat">微信支付</option>
            <option value="cash">现金</option>
          </Select>
        </Field>
        <Field label="收款日期"><DatePicker value={form.paid_at} onChange={(value) => setForm({ ...form, paid_at: value })} /></Field>
        <Field label="收款金额（元）" className="sm:col-span-2"><NumberInput value={form.amount_cents} onChange={(value) => setForm({ ...form, amount_cents: value })} suffix="元" min={0} step={100} /></Field>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
    </Modal>
  )
}
