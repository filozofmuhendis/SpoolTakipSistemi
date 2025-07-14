'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Save, X, Check } from 'lucide-react'
import { notificationService, NotificationPreferences } from '@/lib/services/notifications'
import { useAuth } from '@/hooks/useAuth'

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadPreferences()
    }
  }, [user?.id])

  const loadPreferences = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const data = await notificationService.getNotificationPreferences(user.id)
      if (data) {
        setPreferences(data)
      } else {
        // Varsayılan tercihler oluştur
        setPreferences({
          userId: user.id,
          emailNotifications: true,
          pushNotifications: true,
          spoolUpdates: true,
          projectUpdates: true,
          personnelUpdates: true,
          workOrderUpdates: true,
          shipmentUpdates: true,
          inventoryAlerts: true
        })
      }
    } catch (error) {
      console.log('Bildirim tercihleri yüklenirken hata:', error)
      setMessage({ type: 'error', text: 'Bildirim tercihleri yüklenirken hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return
    
    setPreferences(prev => prev ? { ...prev, [key]: value } : null)
  }

  const savePreferences = async () => {
    if (!preferences || !user?.id) return
    
    try {
      setSaving(true)
      const success = await notificationService.updateNotificationPreferences(preferences)
      
      if (success) {
        setMessage({ type: 'success', text: 'Bildirim tercihleri başarıyla kaydedildi' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Bildirim tercihleri kaydedilirken hata oluştu' })
      }
    } catch (error) {
      console.log('Bildirim tercihleri kaydedilirken hata:', error)
      setMessage({ type: 'error', text: 'Bildirim tercihleri kaydedilirken hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (!user?.id) return
    
    setPreferences({
      userId: user.id,
      emailNotifications: true,
      pushNotifications: true,
      spoolUpdates: true,
      projectUpdates: true,
      personnelUpdates: true,
      workOrderUpdates: true,
      shipmentUpdates: true,
      inventoryAlerts: true
    })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Ayarlar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bildirim Ayarları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bildirim tercihlerinizi özelleştirin ve yönetin
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {preferences && (
          <div className="space-y-6">
            {/* Notification Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Bildirim Kanalları
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email Bildirimleri</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Önemli güncellemeler için email bildirimleri alın
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Push Bildirimleri</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tarayıcı push bildirimleri ile anlık güncellemeler alın
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Bildirim Türleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Spool Güncellemeleri</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Spool durumu ve atama değişiklikleri
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.spoolUpdates}
                      onChange={(e) => updatePreference('spoolUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Proje Güncellemeleri</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Proje durumu ve detay değişiklikleri
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.projectUpdates}
                      onChange={(e) => updatePreference('projectUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Personel Güncellemeleri</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Personel atama ve durum değişiklikleri
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.personnelUpdates}
                      onChange={(e) => updatePreference('personnelUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">İş Emri Güncellemeleri</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      İş emri durumu ve atama değişiklikleri
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.workOrderUpdates}
                      onChange={(e) => updatePreference('workOrderUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Sevkiyat Güncellemeleri</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sevkiyat durumu ve detay değişiklikleri
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.shipmentUpdates}
                      onChange={(e) => updatePreference('shipmentUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Stok Uyarıları</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Düşük stok ve kritik seviye uyarıları
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.inventoryAlerts}
                      onChange={(e) => updatePreference('inventoryAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={resetToDefaults}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Varsayılana Sıfırla
              </button>
              
              <button
                onClick={savePreferences}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 