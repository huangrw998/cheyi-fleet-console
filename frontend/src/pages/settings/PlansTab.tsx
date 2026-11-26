import { Plus } from '@phosphor-icons/react'
import type { PricingPlan } from '@/types'
import { Badge, Button, CardToolbar, DataTable, Money, Td, Th } from '@/components/ui'

export function PlansTab({ plans, onNew, onEdit }: { plans: PricingPlan[]; onNew: () => void; onEdit: (plan: PricingPlan) => void }) {
  return (
    <div>
      <CardToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink">价格方案</h2>
          <p className="mt-1 text-xs text-muted">新租约的月租和押金默认值，可在创建时调整。</p>
        </div>
        <Button size="sm" variant="primary" onClick={onNew}><Plus size={14} /> 新增方案</Button>
      </CardToolbar>
      <DataTable>
        <thead><tr><Th>方案</Th><Th>车身类型</Th><Th>月租</Th><Th>押金</Th><Th>最短租期</Th><Th>状态</Th><Th /></tr></thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="transition hover:bg-card2/40">
              <Td className="text-[13px] font-medium">{plan.name}</Td>
              <Td className="text-[13px] text-muted">{plan.body_type}</Td>
              <Td><Money cents={plan.monthly_rent_cents} className="text-[13px]" /></Td>
              <Td><Money cents={plan.deposit_cents} className="text-[13px]" /></Td>
              <Td className="font-mono text-[13px]">{plan.min_term_months} 个月</Td>
              <Td><Badge tone={plan.status === 'active' ? 'success' : 'neutral'}>{plan.status === 'active' ? '启用' : '停用'}</Badge></Td>
              <Td><Button size="sm" variant="ghost" onClick={() => onEdit(plan)}>编辑</Button></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}