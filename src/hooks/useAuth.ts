import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const signUp = async (email: string, password: string, name: string) => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, name, role: 'user' }])

      if (profileError) throw profileError
    }

    return user
  }

  const updateProfile = async (data: { name?: string; role?: string }) => {
    if (!session?.user?.email) throw new Error('No user logged in')

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', session.user.email)

    if (error) throw error

    router.refresh()
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('Çıkış hatası:', error)
    }
  }

  const forceLogout = async () => {
    try {
      // Tüm oturumları sonlandır
      await supabase.auth.signOut()
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('Zorla çıkış hatası:', error)
    }
  }

  const getActiveSessions = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session ? [session] : []
    } catch (error) {
      console.error('Aktif oturumlar alınamadı:', error)
      return []
    }
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
