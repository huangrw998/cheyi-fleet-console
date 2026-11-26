import type { Lease, LeaseActionKind } from '@/types'
import {
  Button,
  ConfirmDialog,
  Field,
  Modal,
  NumberInput,
  Textarea,
} from '@/components/ui'

export function LeaseActionModal({
  action,
  lease,
  onClose,
  onConfirm,
  loading,
  mileage,
  setMileage,
  deductions,
  setDeductions,
  note,
  setNote,
}: {
  action: LeaseActionKind | null
  lease: Lease
  onClose: () => void
  onConfirm: (kind: LeaseActionKind) => void
  loading: boolean
  mileage: string
  setMileage: (value: string) => void
  deductions: string
  setDeductions: (value: string) => void
  note: string
  setNote: (value: string) => void
}) {
  const confirmActions: Record<'sign' | 'cancel', { title: string; description: string; confirm: string; tone: 'primary' | 'danger' }> = {
    sign: { title: '确认签约', description: '确认司机已完成签约，租约进入待交车状态。', confirm: '确认签约', tone: 'primary' },
    cancel: { title: '取消租约', description: '取消后车辆会释放，已生成的账单保留在财务记录中。', confirm: '确认取消', tone: 'danger' },
  }

  if (action === 'sign' || action === 'cancel') {
    const config = confirmActions[action]
    return <ConfirmDialog open onClose={onClose} onConfirm={() => onConfirm(action)} title={config.title} description={config.description} confirmLabel={config.confirm} tone={config.tone} loading={loading} />
  }

  const isReturn = action === 'return'
  return (
    <Modal
      open={action === 'handover' || action === 'return'}
      onClose={onClose}
      title={isReturn ? '办理退租' : '办理交车'}
      description={isReturn ? '记录还车里程和扣款，租约完成结算，车辆释放。' : '记录交车里程后，租约进入租用中，车辆状态变为在租。'}
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" loading={loading} onClick={() => action && onConfirm(action)}>{isReturn ? '完成退租' : '确认交车'}</Button></>}
    >
      <div className="space-y-4">
        <Field label={isReturn ? '还车里程（km）' : '取车里程（km）'} required><NumberInput value={mileage} onChange={setMileage} suffix="km" min={0} step={100} /></Field>
        {isReturn ? <Field label="扣款金额（元）" hint="车损、违章代缴等，会生成一张待收账单"><NumberInput value={deductions} onChange={setDeductions} suffix="元" min={0} step={100} /></Field> : null}
        <Field label="备注"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="验车情况、随车物品、交接说明等" /></Field>
      </div>
    </Modal>
  )
}

export function defaultMileage(lease: Lease, action: LeaseActionKind | null) {
  return String(action === 'return' ? lease.return_mileage || lease.vehicle?.mileage_km || 0 : lease.vehicle?.mileage_km || 0)
}