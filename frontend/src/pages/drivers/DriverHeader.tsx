import { CheckCircle, Receipt, ShieldWarning, Star, SteeringWheel } from '@phosphor-icons/react'
import type { Bill, Driver, Lease, Violation } from '@/types'
import { formatMoney } from '@/lib/format'
import { Avatar, Button, ButtonLink, Card, Stat, StatusBadge } from '@/components/ui'

export function DriverHeader({ driver, leases, bills, violations, onEdit }: { driver: Driver; leases: Lease[]; bills: Bill[]; violations: Violation[]; onEdit: () => void }) {
  const paidTotal = bills.filter((bill) => bill.status === 'paid').reduce((sum, bill) => sum + bill.paid_amount_cents, 0)
  const openBills = bills.filter((bill) => bill.status === 'pending' || bill.status === 'overdue')
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={driver.name} className="h-14 w-14 text-sm" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">{driver.name}</h1>
                <StatusBadge status={driver.status} />
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted"><Star size={12} className="text-warning" /> {driver.rating.toFixed(1)}</span>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">{driver.phone} · 加入于 {driver.joined_at?.slice(0, 10)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onEdit}>编辑档案</Button>
            <ButtonLink to="/leases/new" variant="primary"><SteeringWheel size={15} /> 新建租约</ButtonLink>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-line border-t border-line sm:grid-cols-4 sm:divide-y-0">
        <div className="group px-5 py-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="租约总数" value={leases.length} icon={<Receipt size={15} />} /></div>
        <div className="group px-5 py-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="已收租金" value={formatMoney(paidTotal, true)} icon={<CheckCircle size={15} />} /></div>
        <div className="group px-5 py-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="待收账单" value={openBills.length} hint={formatMoney(openBills.reduce((sum, b) => sum + b.amount_cents, 0), true)} icon={<Receipt size={15} />} /></div>
        <div className="group px-5 py-4 transition-colors duration-200 hover:bg-card2/50"><Stat label="违章记录" value={violations.length} icon={<ShieldWarning size={15} />} /></div>
      </div>
    </Card>
  )
}
