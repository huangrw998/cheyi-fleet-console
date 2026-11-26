import { BatteryCharging, Calendar, CheckCircle, Gauge, Info, Ruler, Seat } from '@phosphor-icons/react'
import type { VehicleModel } from '@/types'
import { Card, SectionHeader } from '@/components/ui'

export function ModelSpecs({ model }: { model: VehicleModel }) {
  const items = [
    { label: 'CLTC 续航', value: `${model.range_km} km`, icon: Gauge },
    { label: '电池容量', value: `${model.battery_kwh} kWh`, icon: BatteryCharging },
    { label: '快充时间', value: `${model.fast_charge_min} 分钟`, icon: BatteryCharging },
    { label: '座位数', value: `${model.seats} 座`, icon: Seat },
    { label: '车身尺寸', value: `${model.length_mm} × ${model.width_mm} × ${model.height_mm} mm`, icon: Ruler },
    { label: '轴距', value: `${model.wheelbase_mm} mm`, icon: Ruler },
    { label: '能源类型', value: model.energy_type, icon: BatteryCharging },
    { label: '上市年份', value: String(model.launch_year), icon: Calendar },
  ]
  return (
    <Card className="p-5">
      <SectionHeader title="核心参数" description="实际以车辆登记信息为准" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="info-tile">
              <Icon size={15} className="text-muted" />
              <p className="mt-2 text-[10px] text-muted">{item.label}</p>
              <p className="mt-0.5 text-xs font-medium leading-5 text-ink">{item.value}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted">
        <Info size={15} className="mt-0.5 shrink-0 text-accent" />
        <p>3D 模型使用 CC0 通用车身资产，仅用于比例、空间和颜色参考，不代表具体车型 CAD。实车外观与配置以车型图片和车辆档案为准。</p>
      </div>
    </Card>
  )
}

export function ModelHighlights({ model }: { model: VehicleModel }) {
  return (
    <Card className="p-5">
      <SectionHeader title="车型亮点" description="从运营视角挑出的关键能力" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {model.highlights.map((highlight) => (
          <div key={highlight} className="info-tile">
            <CheckCircle size={16} className="text-success" />
            <p className="mt-2 text-xs font-medium leading-5 text-ink">{highlight}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}