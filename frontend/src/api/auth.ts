import { apiGet, apiPost } from '@/lib/api'
import type { LoginInput, PublicOverview, RegisterInput, User } from '@/types'

export function getMe() {
  return apiGet<{ data: User }>('/auth/me')
}

export function login(input: LoginInput) {
  return apiPost<{ data: { user: User; expires_in: number } }>('/auth/login', input)
}

export function register(input: RegisterInput) {
  return apiPost<{ data: { user: User; expires_in: number } }>('/auth/register', input)
}

export function logout() {
  return apiPost<{ data: { ok: boolean } }>('/auth/logout')
}

export function getPublicOverview() {
  return apiGet<{ data: PublicOverview }>('/public/overview')
}