import { useState } from 'react'
import { useToast } from '@/app/toast'
import { errorText } from '@/lib/errors'
import type { PasswordInput, PlanInput, PricingPlan, ProfileInput, RemindersInput, Store, StoreUpdateInput } from '@/types'
import { Card, CardToolbar, ErrorState, PageHeader, Skeleton, Tabs } from '@/components/ui'
import { AccountTab } from './AccountTab'
import { PlanModal, type PlanModalValue } from './PlanModal'
import { PlansTab } from './PlansTab'
import { RemindersTab } from './RemindersTab'
import { StoreModal } from './StoreModal'
import { StoresTab } from './StoresTab'
import { useSettings } from './useSettings'

export default function SettingsPage() {
  const [tab, setTab] = useState('stores')
  const [storeModal, setStoreModal] = useState<Store | null>(null)
  const [planModal, setPlanModal] = useState<PlanModalValue>(null)
  const { toast } = useToast()
  const state = useSettings()
  const data = state.data

  if (state.settingsQuery.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-72" /></div>
  if (state.settingsQuery.isError || !data) return <ErrorState message="设置加载失败" onRetry={() => void state.settingsQuery.refetch()} />

  const notifyFailure = (title: string, err: unknown) => {
    toast({ title, description: errorText(err), tone: 'error' })
  }
  const saveStore = async (id: number, input: StoreUpdateInput) => {
    try {
      await state.updateStore({ id, input })
      toast({ title: '门店已更新', tone: 'success' })
    } catch (err) {
      notifyFailure('门店保存失败', err)
      throw err
    }
  }
  const savePlan = async (id: number | undefined, input: PlanInput) => {
    try {
      await state.savePlan({ id, input })
      toast({ title: '价格方案已保存', tone: 'success' })
    } catch (err) {
      notifyFailure('价格方案保存失败', err)
      throw err
    }
  }
  const saveProfile = async (input: ProfileInput) => {
    try {
      await state.updateProfile(input)
      toast({ title: '账号信息已更新', tone: 'success' })
    } catch (err) {
      notifyFailure('账号信息保存失败', err)
      throw err
    }
  }
  const changePassword = async (input: PasswordInput) => {
    try {
      await state.updatePassword(input)
      toast({ title: '密码已更新', tone: 'success' })
    } catch (err) {
      notifyFailure('密码更新失败', err)
      throw err
    }
  }
  const saveReminders = async (input: RemindersInput) => {
    try {
      await state.updateReminders(input)
      toast({ title: '提醒规则已保存', tone: 'success' })
    } catch (err) {
      notifyFailure('提醒规则保存失败', err)
      throw err
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="系统设置" description="门店容量、价格方案、账号安全和提醒规则。修改后会立即影响运营看板。" />
      <Card className="overflow-hidden">
        <CardToolbar>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'stores', label: '门店与容量' },
              { value: 'plans', label: '价格方案' },
              { value: 'account', label: '账号与安全' },
              { value: 'reminders', label: '提醒规则' },
            ]}
          />
        </CardToolbar>
        {tab === 'stores' ? <StoresTab stores={data.stores} vehicles={state.vehicles} onEdit={setStoreModal} /> : null}
        {tab === 'plans' ? <PlansTab plans={data.pricing_plans} onNew={() => setPlanModal('new')} onEdit={(plan: PricingPlan) => setPlanModal(plan)} /> : null}
        {tab === 'account' ? <AccountTab profile={data.profile} company={data.company} onSaveProfile={saveProfile} onChangePassword={changePassword} savingProfile={state.updatingProfile} savingPassword={state.updatingPassword} /> : null}
        {tab === 'reminders' ? <RemindersTab reminders={data.reminders} onSave={saveReminders} saving={state.updatingReminders} /> : null}
      </Card>
      <StoreModal open={Boolean(storeModal)} store={storeModal} onClose={() => setStoreModal(null)} onSave={saveStore} saving={state.updatingStore} />
      <PlanModal value={planModal} onClose={() => setPlanModal(null)} onSave={savePlan} saving={state.savingPlan} />
    </div>
  )
}