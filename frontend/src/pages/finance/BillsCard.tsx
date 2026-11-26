import { Link } from 'react-router-dom'
import { Receipt } from '@phosphor-icons/react'
import type { Bill, ListResponse } from '@/types'
import { billTypeLabel, formatDate } from '@/lib/format'
import { Button, Card, CardToolbar, DataTable, EmptyState, ErrorState, FilterBar, Money, Pagination, SearchInput, Select, StatusBadge, TableSkeleton, Tabs, Td, Th } from '@/components/ui'

const tabs = [
  { value: 'all', label: '全部账单' },
  { value: 'rent', label: '租金' },
  { value: 'deposit', label: '押金' },
  { value: 'violation', label: '违章' },
  { value: 'damage', label: '车损' },
]

export function BillsCard({
  data,
  loading,
  error,
  onRetry,
  tab,
  status,
  searchText,
  page,
  pageSize,
  update,
  onSearch,
  onPay,
}: {
  data?: ListResponse<Bill>
  loading: boolean
  error: boolean
  onRetry: () => void
  tab: string
  status: string
  searchText: string
  page: number
  pageSize: number
  update: (key: string, value: string) => void
  onSearch: (value: string) => void
  onPay: (bill: Bill) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardToolbar>
        <Tabs value={tab} onChange={(value) => update('type', value)} items={tabs.map((item) => ({ ...item, value: item.value }))} />
      </CardToolbar>
      <FilterBar right={<p className="text-[11px] text-muted">共 <span className="font-mono text-ink">{data?.meta.total ?? 0}</span> 张账单</p>}>
        <SearchInput value={searchText} onChange={onSearch} placeholder="搜索账单号、司机或车牌" className="lg:w-80" size="sm" debounce={250} />
        <Select value={status} onChange={(value) => update('status', value)} className="w-36" size="sm" aria-label="账单状态">
          <option value="all">全部状态</option>
          <option value="pending">待收</option>
          <option value="paid">已收</option>
          <option value="overdue">逾期</option>
        </Select>
      </FilterBar>

      {loading ? <TableSkeleton rows={8} cols={8} /> : error ? <ErrorState message="账单列表加载失败" onRetry={onRetry} /> : !data?.data.length ? (
        <EmptyState icon={<Receipt size={22} />} title="没有匹配的账单" description="调整筛选条件，或生成新的月租账单。" />
      ) : (
        <>
          <DataTable>
            <thead><tr><Th>账单号</Th><Th>租约 / 司机</Th><Th>车辆</Th><Th>类型</Th><Th>金额</Th><Th>到期日</Th><Th>状态</Th><Th>操作</Th></tr></thead>
            <tbody>
              {data.data.map((bill) => (
                <tr key={bill.id} className="transition hover:bg-card2/40">
                  <Td className="font-mono text-xs">{bill.bill_no}</Td>
                  <Td>
                    <Link to={`/leases/${bill.lease_id}`} className="text-xs text-accent hover:underline">{bill.lease?.lease_no ?? `#${bill.lease_id}`}</Link>
                    <p className="mt-0.5 text-[10px] text-muted">{bill.lease?.driver?.name ?? '-'}</p>
                  </Td>
                  <Td className="font-mono text-xs">{bill.lease?.vehicle?.plate_no ?? '-'}</Td>
                  <Td className="text-xs">{billTypeLabel(bill.type)}</Td>
                  <Td><Money cents={bill.amount_cents} className="text-xs" /></Td>
                  <Td className="font-mono text-xs text-muted">{formatDate(bill.due_date)}</Td>
                  <Td><StatusBadge status={bill.status} /></Td>
                  <Td>
                    {bill.status === 'pending' || bill.status === 'overdue'
                      ? <Button size="sm" variant="soft" onClick={() => onPay(bill)}>登记收款</Button>
                      : <Button size="sm" variant="secondary" disabled>{bill.status === 'paid' ? '已收款' : bill.status === 'waived' ? '已免收' : '已完成'}</Button>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <Pagination page={page} pageSize={pageSize} total={data.meta.total} onPage={(p) => update('page', String(p))} onPageSize={(s) => update('page_size', String(s))} />
        </>
      )}
    </Card>
  )
}
