// Client-side mock useAuth hook
// Backed by localStorage to support fully client-side demo presentation

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      const sessionStr = localStorage.getItem('mock_user_session')
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr)
          setSession(parsed)
          setStatus('authenticated')
        } catch (e) {
          setSession(null)
          setStatus('unauthenticated')
        }
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    }
    
    checkSession()

    // Listen for storage changes or custom login/logout events
    window.addEventListener('storage', checkSession)
    window.addEventListener('mock-login-change', checkSession)
    return () => {
      window.removeEventListener('storage', checkSession)
      window.removeEventListener('mock-login-change', checkSession)
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || 'Kayıt başarısız')
    }

    // Auto login
    const newSession = {
      user: {
        id: data.data.id,
        email: data.data.email,
        name: data.data.full_name || data.data.name || name,
        role: data.data.role || 'user'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    localStorage.setItem('mock_user_session', JSON.stringify(newSession))
    window.dispatchEvent(new Event('mock-login-change'))
    
    return data.data
  }

  const updateProfile = async (data: { name?: string; role?: string; full_name?: string }) => {
    if (!session?.user?.email) throw new Error('No user logged in')

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()
    if (!response.ok) {
      throw new Error(responseData.error?.message || 'Güncelleme başarısız')
    }

    window.dispatchEvent(new Event('mock-login-change'))
    router.refresh()
  }

  const logout = async () => {
    localStorage.removeItem('mock_user_session')
    window.dispatchEvent(new Event('mock-login-change'))
    router.push('/login')
  }

  const forceLogout = async () => {
    localStorage.removeItem('mock_user_session')
    window.dispatchEvent(new Event('mock-login-change'))
    router.push('/login')
  }

  const getActiveSessions = async () => {
    if (session) return [session]
    return []
  }

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signUp,
    updateProfile,
    logout,
    forceLogout,
    getActiveSessions,
  }
}
