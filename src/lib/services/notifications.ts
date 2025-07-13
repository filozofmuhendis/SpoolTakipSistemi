import { supabase } from '../supabase'

export interface Notification {
  id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  entityType?: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
  entityId?: string
  read: boolean
  createdAt: string
  actionUrl?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  expiresAt?: string
}

export interface NotificationPreferences {
  id?: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  spoolUpdates: boolean
  projectUpdates: boolean
  personnelUpdates: boolean
  workOrderUpdates: boolean
  shipmentUpdates: boolean
  inventoryAlerts: boolean
}

export interface NotificationFilters {
  type?: 'all' | 'unread' | 'read'
  priority?: 'all' | 'low' | 'normal' | 'high' | 'urgent'
  entityType?: string
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export const notificationService = {
  // Bildirim oluştur
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          read: false,
          createdAt: new Date().toISOString(),
          priority: notification.priority || 'normal'
        })
        .select()
        .single()

      if (error) {
        console.log('Bildirim oluşturma hatası:', error)
        return null
      }

      return data
    } catch (error) {
      console.log('Bildirim oluşturma hatası:', error)
      return null
    }
  },

  // Kullanıcının bildirimlerini getir
  async getUserNotifications(userId: string, limit = 50, filters?: NotificationFilters): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)

      // Filtreler uygula
      if (filters) {
        if (filters.type === 'unread') {
          query = query.eq('read', false)
        } else if (filters.type === 'read') {
          query = query.eq('read', true)
        }

        if (filters.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority)
        }

        if (filters.entityType) {
          query = query.eq('entityType', filters.entityType)
        }

        if (filters.dateRange) {
          query = query
            .gte('createdAt', filters.dateRange.start)
            .lte('createdAt', filters.dateRange.end)
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`)
        }
      }

      const { data, error } = await query
        .order('createdAt', { ascending: false })
        .limit(limit)

      if (error) {
        console.log('Bildirim getirme hatası:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.log('Bildirim getirme hatası:', error)
      return []
    }
  },

  // Okunmamış bildirimleri getir
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .eq('read', false)
        .order('createdAt', { ascending: false })

      if (error) {
        console.log('Okunmamış bildirim getirme hatası:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.log('Okunmamış bildirim getirme hatası:', error)
      return []
    }
  },

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.log('Bildirim okundu işaretleme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Bildirim okundu işaretleme hatası:', error)
      return false
    }
  },

  // Toplu okundu işaretleme
  async markMultipleAsRead(notificationIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)

      if (error) {
        console.log('Toplu okundu işaretleme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Toplu okundu işaretleme hatası:', error)
      return false
    }
  },

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', userId)
        .eq('read', false)

      if (error) {
        console.log('Tüm bildirimleri okundu işaretleme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Tüm bildirimleri okundu işaretleme hatası:', error)
      return false
    }
  },

  // Bildirimi sil
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.log('Bildirim silme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Bildirim silme hatası:', error)
      return false
    }
  },

  // Toplu silme
  async deleteMultipleNotifications(notificationIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)

      if (error) {
        console.log('Toplu silme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Toplu silme hatası:', error)
      return false
    }
  },

  // Süresi dolmuş bildirimleri temizle
  async cleanupExpiredNotifications(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .not('expiresAt', 'is', null)
        .lt('expiresAt', new Date().toISOString())

      if (error) {
        console.log('Süresi dolmuş bildirimleri temizleme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Süresi dolmuş bildirimleri temizleme hatası:', error)
      return false
    }
  },

  // Bildirim tercihlerini getir
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('userId', userId)
        .single()

      if (error) {
        console.log('Bildirim tercihleri getirme hatası:', error)
        return null
      }

      return data
    } catch (error) {
      console.log('Bildirim tercihleri getirme hatası:', error)
      return null
    }
  },

  // Bildirim tercihlerini güncelle
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences> & { userId: string }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(preferences, { onConflict: 'userId' })

      if (error) {
        console.log('Bildirim tercihleri güncelleme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Bildirim tercihleri güncelleme hatası:', error)
      return false
    }
  },

  // Otomatik bildirimler oluştur
  async createSystemNotification(
    entityType: Notification['entityType'],
    entityId: string,
    action: 'created' | 'updated' | 'deleted' | 'status_changed',
    entityName: string,
    userIds: string[],
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<void> {
    const messages = {
      created: `${entityName} oluşturuldu`,
      updated: `${entityName} güncellendi`,
      deleted: `${entityName} silindi`,
      status_changed: `${entityName} durumu değişti`
    }

    const titles = {
      created: 'Yeni Kayıt',
      updated: 'Güncelleme',
      deleted: 'Silme',
      status_changed: 'Durum Değişikliği'
    }

    const types = {
      created: 'success' as const,
      updated: 'info' as const,
      deleted: 'warning' as const,
      status_changed: 'info' as const
    }

    for (const userId of userIds) {
      await this.createNotification({
        title: titles[action],
        message: messages[action],
        type: types[action],
        userId,
        entityType,
        entityId,
        actionUrl: `/${entityType}s/${entityId}`,
        priority
      })
    }
  },

  // Okunmamış bildirim sayısını getir
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId)
        .eq('read', false)

      if (error) {
        console.log('Okunmamış bildirim sayısı getirme hatası:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.log('Okunmamış bildirim sayısı getirme hatası:', error)
      return 0
    }
  },

  // Bildirim istatistiklerini getir
  async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    read: number
    byType: Record<string, number>
    byPriority: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)

      if (error) {
        console.log('Bildirim istatistikleri getirme hatası:', error)
        return {
          total: 0,
          unread: 0,
          read: 0,
          byType: {},
          byPriority: {}
        }
      }

      const notifications = data || []
      const byType: Record<string, number> = {}
      const byPriority: Record<string, number> = {}

      notifications.forEach(notification => {
        // Tür bazında sayım
        byType[notification.type] = (byType[notification.type] || 0) + 1
        
        // Öncelik bazında sayım
        const priority = notification.priority || 'normal'
        byPriority[priority] = (byPriority[priority] || 0) + 1
      })

      return {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        read: notifications.filter(n => n.read).length,
        byType,
        byPriority
      }
    } catch (error) {
      console.log('Bildirim istatistikleri getirme hatası:', error)
      return {
        total: 0,
        unread: 0,
        read: 0,
        byType: {},
        byPriority: {}
      }
    }
  },

  // Email bildirimi gönder (placeholder)
  async sendEmailNotification(userId: string, notification: Notification): Promise<boolean> {
    // Bu fonksiyon email servisi entegrasyonu için placeholder
    // Gerçek implementasyonda email servisi (SendGrid, Mailgun vb.) kullanılabilir
    console.log('Email bildirimi gönderiliyor:', { userId, notification })
    return true
  },

  // Push notification gönder
  async sendPushNotification(userId: string, notification: Notification): Promise<boolean> {
    try {
      // Service Worker üzerinden push notification gönder
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            url: notification.actionUrl,
            notificationId: notification.id
          }
        })
        return true
      }
      return false
    } catch (error) {
      console.log('Push notification gönderme hatası:', error)
      return false
    }
  }
} 
