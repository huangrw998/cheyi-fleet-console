import { useState } from 'react'
import { CheckCircle, Download, Plus, Receipt, ShieldWarning, Wallet } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { Bill, PayBillInput, ViolationCreateInput } from '@/types'
import { formatMoney } from '@/lib/format'
import { download } from '@/lib/api'
import { Button, PageHeader, StatStrip } from '@/components/ui'
import { BillsCard } from './BillsCard'
import { PayBillModal } from './PayBillModal'
import { ViolationModal } from './ViolationModal'
import { ViolationsCard } from './ViolationsCard'
import { useFinance } from './useFinance'

export default function FinancePage() {
  const [searchText, setSearchText] = useState('')
  const [payBill, setPayBill] = useState<Bill | null>(null)
  const [violationOpen, setViolationOpen] = useState(false)
  const { toast } = useToast()
  const state = useFinance()

  const showError = (err: unknown) => toast({ title: '操作失败', description: errorText(err), tone: 'error' })

  const generate = async () => {
    try {
      const res = await state.generateBills() as { data: { created: number } }
      toast({ title: '月租账单已生成', description: `新增 ${res.data.created} 张账单。`, tone: 'success' })
    } catch (err) {
      showError(err)
    }
  }

  const pay = async (id: number, input: PayBillInput) => {
    try {
      await state.payBill({ id, input })
      toast({ title: '收款已登记', tone: 'success' })
    } catch (err) {
      showError(err)
      throw err
    }
  }

  const handleViolation = async (id: number) => {
    try {
      await state.handleViolation(id)
      toast({ title: '违章已处理', description: '已生成待收账单。', tone: 'success' })
    } catch (err) {
      showError(err)
    }
  }

  const createViolation = async (input: ViolationCreateInput) => {
    try {
      await state.createViolation(input)
      toast({ title: '违章已记录', tone: 'success' })
    } catch (err) {
      showError(err)
      throw err
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="财务账单"
        description="租金、押金、违章和车损统一收款。逾期账单会在总览和通知里提醒。"
        actions={
          <>
            <Button variant="secondary" onClick={() => download('/api/v1/bills/export.csv')}><Download size={15} /> 导出 CSV</Button>
            <Button variant="secondary" loading={state.generating} onClick={() => void generate()}><Receipt size={15} /> 生成月租</Button>
            <Button variant="primary" onClick={() => setViolationOpen(true)}><Plus size={16} /> 记录违章</Button>
          </>
        }
      />

      <StatStrip
        columns={4}
        items={[
          { label: '待收金额', value: formatMoney(state.stats.unpaidCents, true), hint: `${state.stats.unpaidCount} 张待收账单`, icon: <Wallet size={16} /> },
          { label: '本月已收', value: formatMoney(state.stats.paidThisMonth, true), hint: '按收款日期统计', icon: <CheckCircle size={16} /> },
          { label: '逾期账单', value: state.stats.overdueCount, hint: '需优先跟进', icon: <ShieldWarning size={16} /> },
          { label: '押金池', value: formatMoney(state.stats.depositPool, true), hint: '已收押金合计', icon: <Receipt size={16} /> },
        ]}
      />

      <BillsCard
        data={state.billsQuery.data}
        loading={state.billsQuery.isLoading}
        error={state.billsQuery.isError}
        onRetry={() => void state.billsQuery.refetch()}
        tab={state.tab}
        status={state.status}
        searchText={searchText}
        page={state.page}
        pageSize={state.pageSize}
        update={state.update}
        onSearch={(value) => { setSearchText(value); state.update('q', value) }}
        onPay={setPayBill}
      />

      {state.billsQuery.isLoading ? null : <ViolationsCard violations={state.violations} onHandle={(id) => void handleViolation(id)} handling={state.handlingViolation} />}

      <PayBillModal bill={payBill} onClose={() => setPayBill(null)} onPay={pay} paying={state.paying} />
      <ViolationModal open={violationOpen} onClose={() => setViolationOpen(false)} onCreate={createViolation} creating={state.creatingViolation} vehicles={state.vehicles} />
    </div>
  )
}