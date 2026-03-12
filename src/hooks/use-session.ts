'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/lib/types/auth'

interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  profileImage: string | null
}

export function useSession() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data) {
        setUser(data.data)
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    fetchSession().finally(() => setLoading(false))
  }, [fetchSession])

  const refreshSession = useCallback(async () => {
    await fetchSession()
  }, [fetchSession])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/login')
  }, [router])

  return { user, loading, logout, refreshSession }
}
