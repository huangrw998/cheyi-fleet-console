import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPlan, getSettings, getSettingsVehicles, updatePassword, updatePlan, updateProfile, updateReminders, updateStore } from '@/api/settings'
import type { PasswordInput, PlanInput, ProfileInput, RemindersInput, StoreUpdateInput } from '@/types'

export function useSettings() {
  const qc = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'settings-all'],
    queryFn: getSettingsVehicles,
    staleTime: 30_000,
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['settings'] })

  const storeMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: StoreUpdateInput }) => updateStore(id, input),
    onSuccess: invalidate,
  })
  const planMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: PlanInput }) => id ? updatePlan(id, input) : createPlan(input),
    onSuccess: invalidate,
  })
  const profileMutation = useMutation({
    mutationFn: (input: ProfileInput) => updateProfile(input),
    onSuccess: invalidate,
  })
  const passwordMutation = useMutation({
    mutationFn: (input: PasswordInput) => updatePassword(input),
  })
  const remindersMutation = useMutation({
    mutationFn: (input: RemindersInput) => updateReminders(input),
    onSuccess: invalidate,
  })

  return {
    settingsQuery,
    data: settingsQuery.data?.data,
    vehicles: vehiclesQuery.data?.data ?? [],
    updateStore: storeMutation.mutateAsync,
    updatingStore: storeMutation.isPending,
    savePlan: planMutation.mutateAsync,
    savingPlan: planMutation.isPending,
    updateProfile: profileMutation.mutateAsync,
    updatingProfile: profileMutation.isPending,
    updatePassword: passwordMutation.mutateAsync,
    updatingPassword: passwordMutation.isPending,
    updateReminders: remindersMutation.mutateAsync,
    updatingReminders: remindersMutation.isPending,
  }
}