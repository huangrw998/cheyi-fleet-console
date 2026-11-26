import { errorText } from '@/lib/errors'
import { useEffect, useState } from 'react'
import { Key } from '@phosphor-icons/react'
import type { PasswordInput, ProfileInput, SettingsData } from '@/types'
import { Button, Field, InlineError, Input, SectionHeader } from '@/components/ui'
import { detectCarrier, isValidPhoneShape } from '@/lib/phone'

export function AccountTab({
  profile,
  company,
  onSaveProfile,
  onChangePassword,
  savingProfile,
  savingPassword,
}: {
  profile: SettingsData['profile']
  company: SettingsData['company']
  onSaveProfile: (input: ProfileInput) => Promise<void>
  onChangePassword: (input: PasswordInput) => Promise<void>
  savingProfile: boolean
  savingPassword: boolean
}) {
  const [profileForm, setProfileForm] = useState({ name: profile.name, phone: profile.phone })
  const [password, setPassword] = useState({ current_password: '', new_password: '' })
  const [error, setError] = useState('')
  const carrier = detectCarrier(profileForm.phone)

  useEffect(() => {
    setProfileForm({ name: profile.name, phone: profile.phone })
  }, [profile])

  const saveProfile = async () => {
    setError('')
    try {
      await onSaveProfile(profileForm)
    } catch (err) {
      setError(errorText(err, '更新失败'))
    }
  }

  const savePassword = async () => {
    setError('')
    try {
      await onChangePassword(password)
      setPassword({ current_password: '', new_password: '' })
    } catch (err) {
      setError(errorText(err, '更新失败'))
    }
  }

  return (
    <div className="grid gap-8 p-5 lg:grid-cols-2">
      <section>
        <SectionHeader title="账号信息" description="用于登录和通知展示" />
        <div className="mt-4 space-y-4">
          <Field label="姓名"><Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></Field>
          <Field label="手机号" hint={carrier ? `已识别：${carrier}` : isValidPhoneShape(profileForm.phone) ? '管理员预留号段' : '仅支持中国大陆手机号'}><Input type="tel" inputMode="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></Field>
          <Button variant="primary" loading={savingProfile} onClick={() => void saveProfile()}>保存账号信息</Button>
        </div>
      </section>
      <section>
        <SectionHeader title="修改密码" description="登录密码可在此更新" />
        <div className="mt-4 space-y-4">
          <Field label="当前密码"><Input type="password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} /></Field>
          <Field label="新密码" hint="至少 8 位"><Input type="password" value={password.new_password} onChange={(e) => setPassword({ ...password, new_password: e.target.value })} /></Field>
          <Button variant="secondary" loading={savingPassword} onClick={() => void savePassword()}><Key size={15} /> 更新密码</Button>
        </div>
      </section>
      <section className="lg:col-span-2">
        <SectionHeader title="企业信息" description="展示在运营台与报表页" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="info-tile"><p className="text-[10px] text-muted">企业名称</p><p className="mt-1 text-xs text-ink">{company.name}</p></div>
          <div className="info-tile"><p className="text-[10px] text-muted">联系电话</p><p className="mt-1 font-mono text-xs text-ink">{company.contact}</p></div>
          <div className="info-tile"><p className="text-[10px] text-muted">地址</p><p className="mt-1 text-xs text-ink">{company.address}</p></div>
        </div>
      </section>
      <InlineError message={error} className="lg:col-span-2" />
    </div>
  )
}