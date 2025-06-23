'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Calendar, Save, Key, Bell, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { notificationService, NotificationPreferences } from '@/lib/services/notifications'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  department?: string
  position?: string
  avatar_url?: string
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: '',
    position: ''
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
      loadNotificationPreferences()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profil yükleme hatası:', error)
        return
      }

      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      })
    } catch (error) {
      console.error('Profil yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationPreferences = async () => {
    if (!user) return

    try {
      const prefs = await notificationService.getNotificationPreferences(user.id)
      setNotificationPrefs(prefs)
    } catch (error) {
      console.error('Bildirim tercihleri yükleme hatası:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' })
      await loadProfile()
    } catch (error) {
      console.error('Profil güncelleme hatası:', error)
      setMessage({ type: 'error', text: 'Profil güncellenirken hata oluştu.' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' })
      return
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' })
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' })
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error)
      setMessage({ type: 'error', text: 'Şifre değiştirilirken hata oluştu.' })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationPrefsUpdate = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user || !notificationPrefs) return

    try {
      const updatedPrefs = { ...notificationPrefs, [key]: value }
      const success = await notificationService.updateNotificationPreferences(updatedPrefs)
      
      if (success) {
        setNotificationPrefs(updatedPrefs)
        setMessage({ type: 'success', text: 'Bildirim tercihleri güncellendi!' })
      }
    } catch (error) {
      console.error('Bildirim tercihleri güncelleme hatası:', error)
      setMessage({ type: 'error', text: 'Bildirim tercihleri güncellenirken hata oluştu.' })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Hesap bilgilerinizi ve tercihlerinizi yönetin
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ad soyadınızı girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Telefon numaranızı girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departman
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Departmanınızı girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pozisyon
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Pozisyonunuzu girin"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Key className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Yeni şifrenizi girin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Şifrenizi tekrar girin"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Key className="w-4 h-4" />
              {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Bell className="w-6 h-6 text-purple-500 mr-2" />
          <h2 className="text-xl font-semibold">Bildirim Tercihleri</h2>
        </div>

        {notificationPrefs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Genel Bildirimler</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Bildirimleri</p>
                  <p className="text-xs text-gray-500">Önemli güncellemeler e-posta ile gönderilsin</p>
                </div>
                <button
                  onClick={() => handleNotificationPrefsUpdate('emailNotifications', !notificationPrefs.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Bildirimleri</p>
                  <p className="text-xs text-gray-500">Anlık bildirimler gösterilsin</p>
                </div>
                <button
                  onClick={() => handleNotificationPrefsUpdate('pushNotifications', !notificationPrefs.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.pushNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Özel Bildirimler</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Spool Güncellemeleri</p>
                  <p className="text-xs text-gray-500">Spool durumu değişiklikleri</p>
                </div>
                <button
                  onClick={() => handleNotificationPrefsUpdate('spoolUpdates', !notificationPrefs.spoolUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.spoolUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.spoolUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Proje Güncellemeleri</p>
                  <p className="text-xs text-gray-500">Proje durumu değişiklikleri</p>
                </div>
                <button
                  onClick={() => handleNotificationPrefsUpdate('projectUpdates', !notificationPrefs.projectUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.projectUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.projectUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sevkiyat Güncellemeleri</p>
                  <p className="text-xs text-gray-500">Sevkiyat durumu değişiklikleri</p>
                </div>
                <button
                  onClick={() => handleNotificationPrefsUpdate('shipmentUpdates', !notificationPrefs.shipmentUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.shipmentUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.shipmentUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 