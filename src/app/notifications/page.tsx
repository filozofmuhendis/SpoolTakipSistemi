'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Filter, Trash2, Check, Eye, EyeOff, Settings, RefreshCw } from 'lucide-react'
import { notificationService, Notification } from '@/lib/services/notifications'
import { useAuth } from '@/hooks/useAuth'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [user?.id])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchTerm, filterType, filterPriority])

  const loadNotifications = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const data = await notificationService.getUserNotifications(user.id, 100)
      setNotifications(data)
    } catch (error) {
      console.log('Bildirimler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Okunma durumu filtresi
    if (filterType === 'unread') {
      filtered = filtered.filter(notification => !notification.read)
    } else if (filterType === 'read') {
      filtered = filtered.filter(notification => notification.read)
    }

    // Öncelik filtresi
    if (filterPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === filterPriority)
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.log('Bildirim okundu işaretlenirken hata:', error)
    }
  }

  const markSelectedAsRead = async () => {
    try {
      for (const id of selectedNotifications) {
        await notificationService.markAsRead(id)
      }
      setNotifications(prev => 
        prev.map(n => selectedNotifications.includes(n.id!) ? { ...n, read: true } : n)
      )
      setSelectedNotifications([])
    } catch (error) {
      console.log('Seçili bildirimler okundu işaretlenirken hata:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId))
    } catch (error) {
      console.log('Bildirim silinirken hata:', error)
    }
  }

  const deleteSelected = async () => {
    try {
      for (const id of selectedNotifications) {
        await notificationService.deleteNotification(id)
      }
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id!)))
      setSelectedNotifications([])
    } catch (error) {
      console.log('Seçili bildirimler silinirken hata:', error)
    }
  }

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id!))
  }

  const deselectAll = () => {
    setSelectedNotifications([])
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'warning':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      case 'error':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[priority as keyof typeof colors] || colors.normal}`}>
        {priority === 'low' ? 'Düşük' : 
         priority === 'normal' ? 'Normal' : 
         priority === 'high' ? 'Yüksek' : 'Acil'}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Az önce'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat önce`
    } else {
      return date.toLocaleDateString('tr-TR')
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bildirimler
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sistem bildirimlerinizi yönetin ve takip edin
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadNotifications}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              title="Yenile"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              title="Ayarlar"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Bildirim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tümü</option>
              <option value="unread">Okunmamış</option>
              <option value="read">Okunmuş</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="low">Düşük</option>
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={markSelectedAsRead}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Okundu İşaretle ({selectedNotifications.length})
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Sil ({selectedNotifications.length})
                </button>
              </div>
            )}
          </div>

          {/* Select All */}
          {filteredNotifications.length > 0 && (
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={selectedNotifications.length === filteredNotifications.length ? deselectAll : selectAll}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {selectedNotifications.length === filteredNotifications.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
              {selectedNotifications.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.length} bildirim seçildi
                </span>
              )}
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Bildirimler yükleniyor...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {notifications.length === 0 ? 'Henüz bildirim yok' : 'Arama kriterlerinize uygun bildirim bulunamadı'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedNotifications.includes(notification.id!) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id!)}
                      onChange={() => toggleSelection(notification.id!)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Icon */}
                    {getNotificationIcon(notification.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority || 'normal')}
                            {!notification.read && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Yeni
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(notification.createdAt)}</span>
                            {notification.entityType && (
                              <span className="capitalize">{notification.entityType}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => notification.id && markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Okundu işaretle"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => notification.id && deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {notifications.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Bildirim</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter(n => !n.read).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Okunmamış</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.read).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Okunmuş</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Yüksek Öncelik</div>
          </div>
        </div>
      </div>
    </div>
  )
} 