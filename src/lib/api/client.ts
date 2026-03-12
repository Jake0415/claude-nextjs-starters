import type { ApiResponse } from '@/lib/types/auth'

const BASE_URL = ''

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return res.json()
}

export function apiGet<T>(url: string) {
  return request<T>(url)
}

export function apiPost<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPut<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPatch<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete<T>(url: string) {
  return request<T>(url, { method: 'DELETE' })
}

// FormData 전송용 (Content-Type 헤더를 브라우저가 자동 설정)
export async function apiUpload<T>(
  url: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return res.json()
}
