import { errorText } from '@/lib/errors'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { useToast } from '@/app/toast'
import { BackLink, Button, PageHeader } from '@/components/ui'
import { DriverStep } from './DriverStep'
import { LeaseStepper } from './LeaseStepper'
import { LeaseSummary } from './LeaseSummary'
import { PricingStep } from './PricingStep'
import { VehicleStep } from './VehicleStep'
import { useLeaseWizard } from './useLeaseWizard'

export default function NewLeasePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const state = useLeaseWizard()

  const next = async () => {
    const message = state.next()
    if (message) {
      toast({ title: message, tone: 'warning' })
      return
    }
    if (state.step !== 3) return
    try {
      const res = await state.createLease()
      toast({ title: '租约已创建', description: '车辆已锁定，等待司机签约。', tone: 'success' })
      navigate(`/leases/${res.data.id}`)
    } catch (err) {
      toast({ title: '租约创建失败', description: errorText(err, '创建租约失败'), tone: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <BackLink to="/leases">返回租约列表</BackLink>
      <PageHeader title="新建租约" description="选司机、选车、确认费用，三步生成租约和首期账单。创建后车辆会被锁定。" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <LeaseStepper step={state.step} onStep={state.setStep} />
          {state.step === 1 ? (
            <DriverStep drivers={state.drivers} driverId={state.driverId} search={state.driverSearch} onSearch={state.setDriverSearch} onSelect={state.setDriverId} loading={state.driversQuery.isLoading} error={state.driversQuery.isError} onRetry={() => void state.driversQuery.refetch()} />
          ) : null}
          {state.step === 2 ? (
            <VehicleStep vehicles={state.vehicles} vehicleId={state.vehicleId} modelName={state.modelName} modelSlug={state.modelSlug} search={state.vehicleSearch} onSearch={state.setVehicleSearch} onSelect={state.chooseVehicle} loading={state.vehiclesQuery.isLoading} error={state.vehiclesQuery.isError} onRetry={() => void state.vehiclesQuery.refetch()} />
          ) : null}
          {state.step === 3 ? (
            <PricingStep startDate={state.startDate} setStartDate={state.setStartDate} term={state.term} setTerm={state.setTerm} endDate={state.endDate} rentYuan={state.rentYuan} setRentYuan={state.setRentYuan} depositYuan={state.depositYuan} setDepositYuan={state.setDepositYuan} note={state.note} setNote={state.setNote} />
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => state.setStep((v) => Math.max(1, v - 1))} disabled={state.step === 1}><ArrowLeft size={15} /> 上一步</Button>
            <Button variant="primary" onClick={() => void next()} loading={state.creating}>{state.step === 3 ? '创建租约' : '下一步'} <ArrowRight size={15} /></Button>
          </div>
        </div>

        <LeaseSummary driver={state.selectedDriver} vehicle={state.selectedVehicle} startDate={state.startDate} endDate={state.endDate} rentYuan={state.rentYuan} depositYuan={state.depositYuan} />
      </div>
    </div>
  )
}