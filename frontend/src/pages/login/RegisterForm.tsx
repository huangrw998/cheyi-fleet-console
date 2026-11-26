import { Link } from 'react-router-dom'
import type { FieldErrors, UseFormReturn } from 'react-hook-form'
import { ArrowRight, UserPlus } from '@phosphor-icons/react'
import type { RegisterFormValues } from './useRegister'
import { detectCarrier } from '@/lib/phone'
import { useToast } from '@/app/toast'
import { Button, Checkbox, Field, Input, PasswordToggle } from '@/components/ui'

export function RegisterForm({
  form,
  showPassword,
  setShowPassword,
  agreed,
  setAgreed,
  error,
  submitting,
  onSubmit,
}: {
  form: UseFormReturn<RegisterFormValues>
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  agreed: boolean
  setAgreed: (value: boolean) => void
  error: string
  submitting: boolean
  onSubmit: (values: RegisterFormValues) => Promise<void>
}) {
  const { register, handleSubmit, formState: { errors } } = form
  const { toast } = useToast()
  const carrier = detectCarrier(form.watch('phone'))
  const onInvalid = (formErrors: FieldErrors<RegisterFormValues>) => {
    const message = formErrors.name?.message ?? formErrors.phone?.message ?? formErrors.password?.message ?? formErrors.confirm?.message ?? '请检查注册信息'
    toast({ title: '请检查注册信息', description: message, tone: 'warning' })
  }
  return (
    <div className="w-full max-w-lg">
      <div className="mb-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] text-muted"><UserPlus size={13} className="text-accent" /> 创建运营账号</div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">注册运营台</h2>
        <p className="mt-2 text-sm leading-6 text-muted">使用中国大陆手机号注册，登录后可管理车队、司机、租约和账单。</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <Field label="姓名" error={errors.name?.message} required>
          <Input autoComplete="name" placeholder="请输入姓名" {...register('name')} />
        </Field>
        <Field label="手机号" error={errors.phone?.message} hint={carrier ? `已识别：${carrier}` : '仅支持中国大陆手机号'} required>
          <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="输入手机号" {...register('phone')} />
        </Field>
        <Field label="密码" error={errors.password?.message} hint="至少 8 位" required>
          <Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="设置登录密码" className="pr-10" {...register('password')} />
        </Field>
        <Field label="确认密码" error={errors.confirm?.message} required>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="再次输入密码" className="pr-10" {...register('confirm')} />
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
        </Field>

        <div>
          <Checkbox checked={agreed} onChange={setAgreed} label="我已知晓并同意账号使用规范。" />
        </div>

        {error ? <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>注册并进入运营台 <ArrowRight size={16} /></Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">已有账号？<Link to="/login" className="text-accent hover:underline">返回登录</Link></p>
    </div>
  )
}