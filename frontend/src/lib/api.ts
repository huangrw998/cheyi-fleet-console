import type { ApiErrorShape } from '@/types'

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const init: RequestInit = {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  }
  if (body !== undefined) init.body = JSON.stringify(body)

  let response: Response
  try {
    response = await fetch(`/api/v1${path}`, init)
  } catch {
    throw new ApiError(0, 'network_error', '网络连接失败，请检查后端服务是否启动')
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/me' && path !== '/auth/login') {
      window.dispatchEvent(new CustomEvent('cheyi:unauthorized'))
    }
    const shape = payload as ApiErrorShape
    const message = shape?.error?.message ?? (typeof payload === 'string' ? payload : '请求失败')
    const code = shape?.error?.code ?? 'request_failed'
    throw new ApiError(response.status, code, message)
  }
  return payload as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body })
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body })
}

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function download(path: string) {
  const a = document.createElement('a')
  a.href = path
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}