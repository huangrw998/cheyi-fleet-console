import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getVehicleDetail, updateVehicle } from '@/api/vehicles'
import type { VehicleUpdateInput } from '@/types'

export function useVehicleDetail(id: string) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleDetail(id),
    enabled: Boolean(id),
  })
  const patchMutation = useMutation({
    mutationFn: (input: VehicleUpdateInput) => updateVehicle(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicle', id] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  return {
    ...query,
    updateVehicle: patchMutation.mutateAsync,
    updating: patchMutation.isPending,
  }
}