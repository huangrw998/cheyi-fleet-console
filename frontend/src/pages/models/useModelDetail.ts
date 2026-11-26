import { useQuery } from '@tanstack/react-query'
import { getModelDetail } from '@/api/models'

export function useModelDetail(slug: string) {
  return useQuery({
    queryKey: ['model', slug],
    queryFn: () => getModelDetail(slug),
    enabled: Boolean(slug),
  })
}