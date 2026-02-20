import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const signUp = async (email: string, password: string, name: string) => {
    // Call our registration API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Kayıt başarısız')
    }

    // Auto login after signup?
    // User requested Login? Or just return user.
    // The previous implementation returned user object.
    // We can auto-login or let user login.
    // For seamless experience, we can try to signIn.
    // But usually we just redirect to login or dashboard.
    // Let's return the user data.
    return data.data
  }

  const updateProfile = async (data: { name?: string; role?: string }) => {
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

    router.refresh()
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.log('Çıkış hatası:', error)
    }
  }

  const forceLogout = async () => {
    try {
      // Just signOut, as we don't manage session tokens manually anymore
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.log('Zorla çıkış hatası:', error)
    }
  }

  const getActiveSessions = async () => {
    // Not implemented in NextAuth client side easily without API
    // Return current session as list
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
