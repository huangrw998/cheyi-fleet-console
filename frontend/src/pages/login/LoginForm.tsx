import type { FieldErrors, UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from '@phosphor-icons/react'
import type { LoginFormValues } from './useLogin'
import { useToast } from '@/app/toast'
import { Button, Card, Field, Input, PasswordToggle } from '@/components/ui'
import { detectCarrier, formatPhone } from '@/lib/phone'

export function LoginForm({
  form,
  showPassword,
  setShowPassword,
  error,
  submitting,
  onSubmit,
  fillAdmin,
}: {
  form: UseFormReturn<LoginFormValues>
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  error: string
  submitting: boolean
  onSubmit: (values: LoginFormValues) => Promise<void>
  fillAdmin: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = form
  const { toast } = useToast()
  const phone = form.watch('phone')
  const carrier = detectCarrier(phone)
  const onInvalid = (formErrors: FieldErrors<LoginFormValues>) => {
    const message = formErrors.phone?.message ?? formErrors.password?.message ?? '请检查手机号和密码'
    toast({ title: '请检查登录信息', description: message, tone: 'warning' })
  }
  return (
    <div className="w-full max-w-lg">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] text-muted"><ShieldCheck size={13} className="text-success" /> 管理员账号已预置</div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">登录运营台</h2>
        <p className="mt-2 text-sm leading-6 text-muted">使用管理员账号进入运营台。</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <Field label="手机号" error={errors.phone?.message} hint={carrier ? `已识别：${carrier}` : undefined} required>
          <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="输入手机号" {...register('phone')} />
        </Field>
        <Field label="密码" error={errors.password?.message} required>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="输入密码" className="pr-10" {...register('password')} />
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
        </Field>
        {error ? <p className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>进入运营台 <ArrowRight size={16} /></Button>
      </form>

      <Card className="mt-5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-medium text-ink">管理员账号</p><p className="mt-1 font-mono text-[11px] text-muted">{formatPhone('12388888888')} / Cheyi@2026</p></div>
          <Button size="sm" variant="soft" onClick={fillAdmin}>一键填入</Button>
        </div>
      </Card>
      <p className="mt-4 text-center text-xs text-muted">还没有账号？<Link to="/register" className="text-accent hover:underline">注册运营账号</Link></p>
    </div>
  )
}