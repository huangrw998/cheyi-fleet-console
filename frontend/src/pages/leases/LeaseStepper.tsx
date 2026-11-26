import { CarProfile, Check, CurrencyCny, User } from '@phosphor-icons/react'
import { Card } from '@/components/ui'

const steps = [
  { id: 1, label: '选择司机', icon: User },
  { id: 2, label: '选择车辆', icon: CarProfile },
  { id: 3, label: '确认费用', icon: CurrencyCny },
]

export function LeaseStepper({ step, onStep }: { step: number; onStep: (step: number) => void }) {
  return (
    <Card className="p-3">
      <div className="grid grid-cols-3 gap-1">
        {steps.map((item) => {
          const Icon = item.icon
          const active = step === item.id
          const done = step > item.id
          return (
            <button key={item.id} onClick={() => item.id < step && onStep(item.id)} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition ${active ? 'bg-ink text-canvas' : done ? 'text-accent hover:bg-accent-soft' : 'text-muted'}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${active ? 'border-canvas/30 bg-canvas/10' : done ? 'border-accent/30 bg-accent-soft' : 'border-line bg-card2'}`}>
                {done ? <Check size={13} weight="bold" /> : <Icon size={14} />}
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] opacity-60">第 {item.id} 步</span>
                <span className="block truncate text-xs font-medium">{item.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}