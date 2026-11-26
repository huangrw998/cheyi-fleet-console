import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLease, runLeaseAction } from '@/api/leases'
import type { LeaseActionInput } from '@/types'

export function useLeaseDetail(id: string) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['lease', id],
    queryFn: () => getLease(id),
    enabled: Boolean(id),
  })
  const actionMutation = useMutation({
    mutationFn: (input: LeaseActionInput) => runLeaseAction(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lease', id] })
      qc.invalidateQueries({ queryKey: ['leases'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
  return {
    ...query,
    act: actionMutation.mutateAsync,
    acting: actionMutation.isPending,
  }
}