import { useQuery } from '@tanstack/react-query'
import { getPublicOverview } from '@/api/auth'

export function usePublicOverview() {
  return useQuery({
    queryKey: ['public-overview'],
    queryFn: getPublicOverview,
    staleTime: 60_000,
  })
}