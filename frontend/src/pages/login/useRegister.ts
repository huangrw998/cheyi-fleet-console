import { errorText } from '@/lib/errors'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/app/auth'
import { useToast } from '@/app/toast'
import { isValidMainlandPhone } from '@/lib/phone'
import { usePublicOverview } from '@/hooks/usePublicOverview'

const schema = z.object({
  name: z.string().trim().min(1, '请输入姓名'),
  phone: z.string().refine((value) => isValidMainlandPhone(value), '请输入有效的中国大陆手机号'),
  password: z.string().min(8, '密码至少 8 位'),
  confirm: z.string(),
}).refine((values) => values.password === values.confirm, {
  path: ['confirm'],
  message: '两次输入的密码不一致',
})

export type RegisterFormValues = z.infer<typeof schema>

export function useRegister() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const overviewQuery = usePublicOverview()
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', password: '', confirm: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setError('')
    if (!agreed) {
      toast({ title: '请先勾选账号使用规范', tone: 'warning' })
      return
    }
    setSubmitting(true)
    try {
      await register({ name: values.name, phone: values.phone, password: values.password })
      navigate('/', { replace: true })
    } catch (err) {
      const message = errorText(err, '注册失败，请稍后重试')
      setError(message)
      toast({ title: '注册失败', description: message, tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    user,
    overview: overviewQuery.data?.data,
    form,
    showPassword,
    setShowPassword,
    agreed,
    setAgreed,
    error,
    submitting,
    onSubmit,
  }
}