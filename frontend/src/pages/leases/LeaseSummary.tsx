import { SteeringWheel } from '@phosphor-icons/react'
import type { Driver, Vehicle } from '@/types'
import { formatMoney } from '@/lib/format'
import { Avatar, Card } from '@/components/ui'

export function LeaseSummary({
  driver,
  vehicle,
  startDate,
  endDate,
  rentYuan,
  depositYuan,
}: {
  driver?: Driver
  vehicle?: Vehicle
  startDate: string
  endDate: string
  rentYuan: string
  depositYuan: string
}) {
  return (
    <aside className="space-y-4">
      <Card className="p-5 xl:sticky xl:top-20">
        <h3 className="text-sm font-semibold text-ink">租约摘要</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={driver?.name} />
            <div className="min-w-0"><p className="text-xs font-medium text-ink">{driver?.name ?? '尚未选择司机'}</p><p className="mt-0.5 text-[10px] text-muted">{driver?.phone ?? '第 1 步选择'}</p></div>
          </div>
          <div className="info-tile">
            {vehicle ? (
              <div className="flex items-center gap-3">
                <img src={vehicle.model?.hero_image} alt="" className="h-12 w-16 rounded-lg object-cover" loading="lazy" decoding="async" />
                <div className="min-w-0"><p className="font-mono text-xs text-ink">{vehicle.plate_no}</p><p className="mt-0.5 truncate text-[10px] text-muted">{vehicle.model?.brand} {vehicle.model?.name}</p><p className="mt-0.5 text-[10px] text-muted">{vehicle.store?.name}</p></div>
              </div>
            ) : <p className="py-2 text-center text-[11px] text-muted">第 2 步选择车辆</p>}
          </div>
          <div className="space-y-2 border-t border-line pt-3 text-xs">
            <div className="flex justify-between"><span className="text-muted">起租</span><span className="font-mono text-ink">{startDate}</span></div>
            <div className="flex justify-between"><span className="text-muted">到期</span><span className="font-mono text-ink">{endDate}</span></div>
            <div className="flex justify-between"><span className="text-muted">月租</span><span className="font-mono text-ink">{rentYuan ? formatMoney(Number(rentYuan) * 100) : '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted">押金</span><span className="font-mono text-ink">{depositYuan ? formatMoney(Number(depositYuan) * 100) : '-'}</span></div>
            <div className="flex justify-between border-t border-line pt-2"><span className="font-medium text-ink">首期合计</span><span className="font-mono text-base font-semibold text-accent">{formatMoney((Number(rentYuan || 0) + Number(depositYuan || 0)) * 100)}</span></div>
          </div>
          <div className="text-[10px] leading-5 text-muted">当前选择：{driver ? driver.name : '未选司机'} / {vehicle ? vehicle.plate_no : '未选车辆'}</div>
        </div>
      </Card>
      <Card className="p-4"><div className="flex items-start gap-2 text-[11px] leading-5 text-muted"><SteeringWheel size={15} className="mt-0.5 shrink-0 text-accent" />租约创建后可在详情页完成签约、交车和退租。首期账单会出现在财务账单中。</div></Card>
    </aside>
  )
}