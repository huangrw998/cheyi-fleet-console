import { errorText } from '@/lib/errors'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/app/auth'
import { useToast } from '@/app/toast'
import { isValidPhoneShape } from '@/lib/phone'
import { usePublicOverview } from '@/hooks/usePublicOverview'

const schema = z.object({
  phone: z.string().refine((value) => isValidPhoneShape(value), '请输入 11 位手机号'),
  password: z.string().min(6, '密码至少 6 位'),
})

export type LoginFormValues = z.infer<typeof schema>

export function useLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<LoginFormValues>({ resolver: zodResolver(schema), defaultValues: { phone: '', password: '' } })

  const overviewQuery = usePublicOverview()

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    setError('')
    try {
      await login(values.phone, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      const message = errorText(err, '登录失败，请重试')
      setError(message)
      toast({ title: '登录失败', description: message, tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const fillAdmin = () => {
    form.setValue('phone', '12388888888', { shouldValidate: true })
    form.setValue('password', 'Cheyi@2026', { shouldValidate: true })
  }

  return {
    user,
    showPassword,
    setShowPassword,
    error,
    submitting,
    form,
    overview: overviewQuery.data?.data,
    onSubmit,
    fillAdmin,
  }
}