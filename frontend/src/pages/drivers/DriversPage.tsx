import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { DriverCreateInput } from '@/types'
import { Button, Card, FilterBar, PageHeader, SearchInput, Select, StatStrip } from '@/components/ui'
import { DriverCreateModal } from './DriverCreateModal'
import { DriversTable } from './DriversTable'
import { useDrivers } from './useDrivers'

export default function DriversPage() {
  const [searchText, setSearchText] = useState('')
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const state = useDrivers()
  const data = state.listQuery.data

  const create = async (input: DriverCreateInput) => {
    try {
      await state.createDriver(input)
      toast({ title: '司机已创建', description: '认证通过后即可创建租约。', tone: 'success' })
    } catch (err) {
      toast({ title: '司机创建失败', description: errorText(err), tone: 'error' })
      throw err
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="司机管理"
        description="认证、租约和证件有效期。一个司机同时只能有一份生效租约。"
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={16} /> 新增司机</Button>}
      />

      <StatStrip
        items={[
          { label: '司机总数', value: state.counts.all },
          { label: '已认证', value: state.counts.certified },
          { label: '租用中', value: state.counts.leased },
          { label: '待审核', value: state.counts.pending, hint: state.counts.blacklisted ? `黑名单 ${state.counts.blacklisted}` : '-' },
        ]}
        columns={4}
      />

      <Card className="overflow-hidden">
        <FilterBar right={<p className="text-[11px] text-muted">共 <span className="font-mono text-ink">{data?.meta.total ?? 0}</span> 位司机</p>}>
          <SearchInput value={searchText} onChange={(value) => { setSearchText(value); state.update('q', value) }} placeholder="搜索姓名、手机号或驾照号" className="lg:w-80" size="sm" debounce={250} />
          <Select value={state.status} onChange={(value) => state.update('status', value)} className="w-40" size="sm" aria-label="司机状态">
            <option value="all">全部状态</option>
            <option value="certified">已认证</option>
            <option value="leased">租用中</option>
            <option value="pending">待审核</option>
            <option value="blacklisted">黑名单</option>
          </Select>
        </FilterBar>

        <DriversTable
          data={data}
          loading={state.listQuery.isLoading}
          error={state.listQuery.isError}
          onRetry={() => void state.listQuery.refetch()}
          page={state.page}
          pageSize={state.pageSize}
          onPage={(page) => state.update('page', String(page))}
          onPageSize={(size) => state.update('page_size', String(size))}
        />
      </Card>

      <DriverCreateModal open={open} onClose={() => setOpen(false)} onCreate={create} creating={state.creating} />
    </div>
  )
}
