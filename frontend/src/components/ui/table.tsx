import type { ReactNode } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Skeleton } from './states'
import { Select } from './select'

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto scrollbar-thin', className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn('whitespace-nowrap border-b border-line bg-card2/50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted', className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('border-b border-line px-4 py-3 align-middle text-ink', className)}>{children}</td>
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, c) => <Skeleton key={c} className="h-4" />)}
        </div>
      ))}
    </div>
  )
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  onPageSize?: (size: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <p className="text-xs text-muted">
        共 <span className="font-mono text-ink">{total}</span> 条，第 <span className="font-mono text-ink">{page}</span> / {pages} 页
      </p>
      <div className="flex items-center gap-2">
        {onPageSize ? (
          <Select value={String(pageSize)} onChange={(value) => onPageSize(Number(value))} className="w-32" size="sm" aria-label="每页条数">
            {[10, 20, 50].map((size) => <option key={size} value={size}>{size} 条/页</option>)}
          </Select>
        ) : null}
        <Button size="icon" variant="secondary" className="h-10 w-10" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="上一页">
          <CaretLeft size={14} />
        </Button>
        <Button size="icon" variant="secondary" className="h-10 w-10" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="下一页">
          <CaretRight size={14} />
        </Button>
      </div>
    </div>
  )
}