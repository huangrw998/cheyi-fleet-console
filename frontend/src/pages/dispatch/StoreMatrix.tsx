import type { Store } from '@/types'
import { CardToolbar, DataTable, Td, Th } from '@/components/ui'
import { dispatchStatusColumns } from './useDispatch'

export function StoreMatrix({ matrix }: { matrix: { store: Store; row: Record<string, number> }[] }) {
  return (
    <div>
      <CardToolbar><h2 className="text-base font-semibold tracking-tight text-ink">门店库存矩阵</h2><p className="mt-1 text-xs text-muted">按车辆状态统计，帮助判断调拨方向。</p></CardToolbar>
      <DataTable>
        <thead><tr><Th>门店</Th>{dispatchStatusColumns.map((column) => <Th key={column.key} className="text-center">{column.label}</Th>)}<Th className="text-center">容量</Th></tr></thead>
        <tbody>
          {matrix.map(({ store, row }) => (
            <tr key={store.id} className="transition hover:bg-card2/40">
              <Td><p className="text-xs font-medium text-ink">{store.name}</p><p className="mt-0.5 text-[10px] text-muted">{store.district}</p></Td>
              {dispatchStatusColumns.map((column) => (
                <Td key={column.key} className="text-center">
                  <span className={`inline-flex min-w-7 justify-center rounded-md px-1.5 py-0.5 font-mono text-xs ${row[column.key] ? (column.key === 'available' ? 'bg-success-soft text-success' : column.key === 'rented' ? 'bg-info-soft text-info' : 'bg-card2 text-muted') : 'text-muted/40'}`}>{row[column.key] ?? 0}</span>
                </Td>
              ))}
              <Td className="text-center font-mono text-xs text-muted">{store.capacity}</Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}