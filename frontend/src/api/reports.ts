import { apiGet, qs } from '@/lib/api'
import type { ReportQuery, ReportsData } from '@/types'

export function getReports(query: ReportQuery) {
  return apiGet<{ data: ReportsData }>(`/reports${qs({
    from: query.from,
    to: query.to,
    store_id: query.storeId,
  })}`)
}