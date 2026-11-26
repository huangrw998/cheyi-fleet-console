import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '@/api/auth'
import type { LoginInput, RegisterInput, User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await getMe()).data,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => registerRequest(input),
  })

  const logoutMutation = useMutation({
    mutationFn: () => logoutRequest(),
  })

  useEffect(() => {
    const onUnauthorized = () => qc.setQueryData(['auth', 'me'], null)
    window.addEventListener('cheyi:unauthorized', onUnauthorized)
    return () => window.removeEventListener('cheyi:unauthorized', onUnauthorized)
  }, [qc])

  const login = useCallback(
    async (phone: string, password: string) => {
      const res = await loginMutation.mutateAsync({ phone, password })
      qc.setQueryData(['auth', 'me'], res.data.user)
      qc.invalidateQueries()
      return res.data.user
    },
    [loginMutation, qc],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await registerMutation.mutateAsync(input)
      qc.setQueryData(['auth', 'me'], res.data.user)
      qc.invalidateQueries()
      return res.data.user
    },
    [registerMutation, qc],
  )

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      qc.setQueryData(['auth', 'me'], null)
      qc.clear()
    }
  }, [logoutMutation, qc])

  const value = useMemo(
    () => ({
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      login,
      register,
      logout,
    }),
    [meQuery.data, meQuery.isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}