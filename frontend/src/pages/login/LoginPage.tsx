import { Navigate } from 'react-router-dom'
import { useHealth } from '@/hooks/useHealth'
import { AuthLayout } from './AuthLayout'
import { LoginForm } from './LoginForm'
import { useLogin } from './useLogin'

export default function LoginPage() {
  const state = useLogin()
  const health = useHealth()
  if (state.user) return <Navigate to="/" replace />

  return (
    <AuthLayout label="安全登录 · 运营管理员" stats={state.overview} online={health.data !== false}>
      <LoginForm
        form={state.form}
        showPassword={state.showPassword}
        setShowPassword={state.setShowPassword}
        error={state.error}
        submitting={state.submitting}
        onSubmit={state.onSubmit}
        fillAdmin={state.fillAdmin}
      />
    </AuthLayout>
  )
}