import { supabase } from '../supabase'

export interface Notification {
  id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  entityType?: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment'
  entityId?: string
  read: boolean
  createdAt: string
  actionUrl?: string
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
          createdAt: new Date().toISOString()
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
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
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
    userIds: string[]
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
        actionUrl: `/${entityType}s/${entityId}`
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
  }
} 
