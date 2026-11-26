import { Link } from 'react-router-dom'
import { ArrowRight, Plus, SteeringWheel } from '@phosphor-icons/react'
import { formatDate, formatMoney } from '@/lib/format'
import {
  ButtonLink,
  Card,
  CardToolbar,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  Money,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatStrip,
  StatusBadge,
  TableSkeleton,
  Tabs,
  Td,
  Th,
} from '@/components/ui'
import { useLeases } from './useLeases'

export default function LeasesPage() {
  const state = useLeases()
  const data = state.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="租约订单"
        description="从待签约到退租结算，所有租约状态和费用节点集中管理。"
        actions={<ButtonLink to="/leases/new" variant="primary"><Plus size={16} /> 新建租约</ButtonLink>}
      />

      <StatStrip
        columns={4}
        items={[
          { label: '生效中', value: state.counts.active, hint: '含逾期未退', icon: <SteeringWheel size={16} /> },
          { label: '待签约', value: state.counts.pending_sign, hint: '等待司机确认' },
          { label: '待交车', value: state.counts.pending_pickup, hint: '车辆已锁定' },
          { label: '在租月租', value: formatMoney(state.monthlyRent, true), hint: '按月租合计' },
        ]}
      />

      <Card className="overflow-hidden">
        <CardToolbar>
          <Tabs
            value={state.status}
            onChange={(value) => state.update('status', value)}
            items={[
              { value: 'all', label: '全部', count: state.counts.all },
              { value: 'pending_sign', label: '待签约', count: state.counts.pending_sign },
              { value: 'pending_pickup', label: '待交车', count: state.counts.pending_pickup },
              { value: 'active', label: '租用中', count: state.counts.active },
              { value: 'overdue', label: '逾期' },
              { value: 'returned', label: '已退租', count: state.counts.returned },
              { value: 'cancelled', label: '已取消', count: state.counts.cancelled },
            ]}
          />
        </CardToolbar>
        <FilterBar right={<p className="text-[11px] text-muted">共 <span className="font-mono text-ink">{data?.meta.total ?? 0}</span> 条租约</p>}>
          <SearchInput value={state.search} onChange={(value) => state.update('q', value)} placeholder="搜索租约号、司机或车牌" className="lg:w-80" size="sm" debounce={250} />
          <Select value={state.storeId} onChange={(value) => state.update('store', value)} className="w-40" size="sm" aria-label="门店">
            <option value="">全部门店</option>
            {state.stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </Select>
        </FilterBar>

        {state.listQuery.isLoading ? <TableSkeleton rows={8} cols={7} /> : state.listQuery.isError ? (
          <ErrorState message="租约列表加载失败" onRetry={() => void state.listQuery.refetch()} />
        ) : !data?.data.length ? (
          <EmptyState icon={<SteeringWheel size={22} />} title="没有匹配的租约" description="调整筛选条件，或新建一份租约。" action={<ButtonLink to="/leases/new" size="sm" variant="primary">新建租约</ButtonLink>} />
        ) : (
          <>
            <DataTable>
              <thead><tr><Th>租约号 / 司机</Th><Th>车辆</Th><Th>门店</Th><Th>租期</Th><Th>月租</Th><Th>状态</Th><Th>操作</Th></tr></thead>
              <tbody>
                {data.data.map((lease) => {
                  const overdue = lease.status === 'active' && new Date(lease.end_date).getTime() < Date.now()
                  return (
                    <tr key={lease.id} className="transition hover:bg-card2/40">
                      <Td><Link to={`/leases/${lease.id}`} className="group block"><span className="block font-mono text-xs text-ink group-hover:text-accent">{lease.lease_no}</span><span className="mt-0.5 block text-[10px] text-muted">{lease.driver?.name ?? '-'} · {lease.driver?.phone ?? ''}</span></Link></Td>
                      <Td><span className="block font-mono text-xs text-ink">{lease.vehicle?.plate_no ?? '-'}</span><span className="mt-0.5 block text-[10px] text-muted">{lease.vehicle?.model?.brand} {lease.vehicle?.model?.name}</span></Td>
                      <Td className="text-xs text-muted">{lease.store?.name ?? '-'}</Td>
                      <Td className="font-mono text-xs text-muted">{formatDate(lease.start_date)}<br />{formatDate(lease.end_date)}</Td>
                      <Td><Money cents={lease.monthly_rent_cents} className="text-xs" /></Td>
                      <Td><StatusBadge status={overdue ? 'overdue' : lease.status} /></Td>
                      <Td><Link to={`/leases/${lease.id}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">详情 <ArrowRight size={12} /></Link></Td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
            <Pagination page={state.page} pageSize={state.pageSize} total={data.meta.total} onPage={(page) => state.update('page', String(page))} onPageSize={(size) => state.update('page_size', String(size))} />
          </>
        )}
      </Card>
    </div>
  )
}
