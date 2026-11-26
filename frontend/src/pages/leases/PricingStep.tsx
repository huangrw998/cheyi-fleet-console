import { Info } from '@phosphor-icons/react'
import { Card, DatePicker, Field, Input, NumberInput, RichTextEditor, Select } from '@/components/ui'


export function PricingStep({
  startDate,
  setStartDate,
  term,
  setTerm,
  endDate,
  rentYuan,
  setRentYuan,
  depositYuan,
  setDepositYuan,
  note,
  setNote,
}: {
  startDate: string
  setStartDate: (value: string) => void
  term: string
  setTerm: (value: string) => void
  endDate: string
  rentYuan: string
  setRentYuan: (value: string) => void
  depositYuan: string
  setDepositYuan: (value: string) => void
  note: string
  setNote: (value: string) => void
}) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">确认租期与费用</h2>
      <p className="mt-1 text-xs text-muted">首期账单会按起租日期生成，金额可在此调整。</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="起租日期" required><DatePicker value={startDate} onChange={setStartDate} /></Field>
        <Field label="租期" required>
          <Select value={term} onChange={(value) => setTerm(value)}>
            <option value="3">3 个月</option>
            <option value="6">6 个月</option>
            <option value="12">12 个月</option>
          </Select>
        </Field>
        <Field label="到期日期" hint="按起租日期自动计算"><Input value={endDate} readOnly className="bg-card2 text-muted" /></Field>
        <Field label="月租（元）" required><NumberInput value={rentYuan} onChange={setRentYuan} placeholder="4280" suffix="元" min={0} step={100} /></Field>
        <Field label="押金（元）"><NumberInput value={depositYuan} onChange={setDepositYuan} placeholder="10000" suffix="元" min={0} step={500} /></Field>
        <Field label="备注" className="sm:col-span-2"><RichTextEditor value={note} onChange={setNote} placeholder="交车地点、特殊约定等（可选）" minHeight={96} /></Field>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/20 bg-info-soft px-3 py-2 text-[11px] leading-5 text-info">
        <Info size={14} className="mt-0.5 shrink-0" />创建后车辆会进入“已锁定”状态，签约后待交车，交车后开始计租。若取消租约，车辆会自动释放。
      </div>
    </Card>
  )
}
