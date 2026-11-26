import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDriverDetail, updateDriver } from '@/api/drivers'
import type { DriverUpdateInput } from '@/types'

export function useDriverDetail(id: string) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['driver', id],
    queryFn: () => getDriverDetail(id),
    enabled: Boolean(id),
  })
  const patchMutation = useMutation({
    mutationFn: (input: DriverUpdateInput) => updateDriver(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['driver', id] })
      qc.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
  return { ...query, updateDriver: patchMutation.mutateAsync, updating: patchMutation.isPending }
}