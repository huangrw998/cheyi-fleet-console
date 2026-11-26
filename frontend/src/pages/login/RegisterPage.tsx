import { Navigate } from 'react-router-dom'
import { useHealth } from '@/hooks/useHealth'
import { AuthLayout } from './AuthLayout'
import { RegisterForm } from './RegisterForm'
import { useRegister } from './useRegister'

export default function RegisterPage() {
  const state = useRegister()
  const health = useHealth()
  if (state.user) return <Navigate to="/" replace />

  return (
    <AuthLayout label="创建运营账号" stats={state.overview} online={health.data !== false}>
      <RegisterForm
        form={state.form}
        showPassword={state.showPassword}
        setShowPassword={state.setShowPassword}
        agreed={state.agreed}
        setAgreed={state.setAgreed}
        error={state.error}
        submitting={state.submitting}
        onSubmit={state.onSubmit}
      />
    </AuthLayout>
  )
}