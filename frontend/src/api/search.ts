import { apiGet } from '@/lib/api'
import type { SearchResults } from '@/types'

export function searchAll(query: string) {
  return apiGet<{ data: SearchResults }>(`/search?q=${encodeURIComponent(query)}`)
}