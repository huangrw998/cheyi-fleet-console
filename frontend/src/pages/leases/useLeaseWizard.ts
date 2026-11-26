import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDrivers } from '@/api/drivers'
import { createLease } from '@/api/leases'
import { getModelVehicles } from '@/api/models'
import { getVehicles } from '@/api/vehicles'
import type { LeaseCreateInput, Vehicle } from '@/types'
import { addMonthsISO, todayISO } from '@/lib/format'

export function useLeaseWizard() {
  const [params] = useSearchParams()
  const modelSlug = params.get('model') ?? ''
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [driverSearch, setDriverSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [driverId, setDriverId] = useState<number | null>(null)
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState(todayISO())
  const [term, setTerm] = useState('6')
  const [rentYuan, setRentYuan] = useState('')
  const [depositYuan, setDepositYuan] = useState('')
  const [note, setNote] = useState('')

  const driversQuery = useQuery({
    queryKey: ['drivers', 'eligible'],
    queryFn: () => getDrivers({ status: 'certified', pageSize: 500 }),
    staleTime: 30_000,
  })
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'available', modelSlug],
    queryFn: async () => {
      if (modelSlug) {
        const res = await getModelVehicles(modelSlug)
        return res.data.filter((v) => v.status === 'available')
      }
      const res = await getVehicles({ status: 'available', pageSize: 500 })
      return res.data
    },
    staleTime: 30_000,
  })

  const drivers = useMemo(() => (driversQuery.data?.data ?? []).filter((d) => !d.current_lease).filter((d) => !driverSearch || d.name.includes(driverSearch) || d.phone.includes(driverSearch)), [driversQuery.data, driverSearch])
  const vehicles = useMemo(() => (vehiclesQuery.data ?? []).filter((v) => !vehicleSearch || v.plate_no.includes(vehicleSearch) || `${v.model?.brand}${v.model?.name}`.toLowerCase().includes(vehicleSearch.toLowerCase())), [vehiclesQuery.data, vehicleSearch])
  const selectedDriver = driversQuery.data?.data.find((d) => d.id === driverId)
  const selectedVehicle = vehiclesQuery.data?.find((v) => v.id === vehicleId)
  const endDate = addMonthsISO(startDate, Number(term))
  const modelName = modelSlug ? selectedVehicle?.model?.name ?? modelSlug : ''

  const chooseVehicle = (vehicle: Vehicle) => {
    setVehicleId(vehicle.id)
    setRentYuan(String((vehicle.model?.monthly_rent_cents ?? 0) / 100))
    setDepositYuan(String((vehicle.model?.deposit_cents ?? 0) / 100))
  }

  const createMutation = useMutation({
    mutationFn: () => {
      if (driverId === null || vehicleId === null) throw new Error('请先选择司机和车辆')
      const input: LeaseCreateInput = {
        driver_id: driverId,
        vehicle_id: vehicleId,
        store_id: selectedVehicle?.store_id,
        start_date: startDate,
        end_date: endDate,
        monthly_rent_cents: Math.round(Number(rentYuan || 0) * 100),
        deposit_cents: Math.round(Number(depositYuan || 0) * 100),
        note,
      }
      return createLease(input)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leases'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  const next = (): string | null => {
    if (step === 1 && !driverId) return '请先选择一位司机'
    if (step === 2 && !vehicleId) return '请先选择一台车辆'
    if (step === 3 && (!rentYuan || Number(rentYuan) <= 0)) return '月租金额必须大于 0'
    if (step < 3) setStep((v) => Math.min(3, v + 1))
    return null
  }

  return {
    modelSlug,
    step,
    setStep,
    driverSearch,
    setDriverSearch,
    vehicleSearch,
    setVehicleSearch,
    driverId,
    setDriverId,
    vehicleId,
    chooseVehicle,
    startDate,
    setStartDate,
    term,
    setTerm,
    rentYuan,
    setRentYuan,
    depositYuan,
    setDepositYuan,
    note,
    setNote,
    driversQuery,
    vehiclesQuery,
    drivers,
    vehicles,
    selectedDriver,
    selectedVehicle,
    endDate,
    modelName,
    next,
    createLease: createMutation.mutateAsync,
    creating: createMutation.isPending,
  }
}