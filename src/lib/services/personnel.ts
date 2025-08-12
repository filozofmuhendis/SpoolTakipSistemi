import { supabase, supabaseAdmin } from '../supabase'

export interface Personnel {
  id: string
  email: string
  full_name: string
  phone?: string
  department?: string
  position?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export const personnelService = {
  // Tüm personeli getir
  async getAllPersonnel(): Promise<Personnel[]> {
    try {
      const response = await fetch('/api/personnel')
      const result = await response.json()
      
      if (!result.success) {
        console.log('Personel getirme hatası:', result.error)
        return []
      }
      
      return result.data || []
    } catch (error) {
      console.log('Personel getirme hatası:', error)
      return []
    }
  },

  // Aktif personeli getir (auth.users'dan aktif kullanıcıları)
  async getActivePersonnel(): Promise<Personnel[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.log('Aktif personel getirme hatası:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.log('Aktif personel getirme hatası:', error)
      return []
    }
  },

  // Belirli departmandaki personeli getir
  async getPersonnelByDepartment(department: string): Promise<Personnel[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('department', department)
        .order('full_name', { ascending: true })
      
      if (error) {
        console.log('Departman personeli getirme hatası:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.log('Departman personeli getirme hatası:', error)
      return []
    }
  },

  // Personel oluştur (auth.users ile birlikte)
  async createPersonnel(personnel: {
    email: string
    password: string
    full_name: string
    phone?: string
    department?: string
    position?: string
  }): Promise<Personnel | null> {
    try {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personnel)
      })
      
      const result = await response.json()
      
      if (!result.success) {
        console.log('Personel oluşturma hatası:', result.error)
        return null
      }
      
      return result.data
    } catch (error) {
      console.log('Personel oluşturma hatası:', error)
      return null
    }
  },

  // Personel güncelle
  async updatePersonnel(id: string, updates: Partial<Personnel>): Promise<Personnel | null> {
    try {
      const updateData: any = {}
      if (updates.full_name) updateData.full_name = updates.full_name
      if (updates.email) updateData.email = updates.email
      if (updates.phone) updateData.phone = updates.phone
      if (updates.department) updateData.department = updates.department
      if (updates.position) updateData.position = updates.position
      if (updates.avatar_url) updateData.avatar_url = updates.avatar_url

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.log('Personel güncelleme hatası:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.log('Personel güncelleme hatası:', error)
      return null
    }
  },

  // Personel sil (auth.users'dan da sil)
  async deletePersonnel(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/personnel/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!result.success) {
        console.log('Personel silme hatası:', result.error)
        return false
      }

      return true
    } catch (error) {
      console.log('Personel silme hatası:', error)
      return false
    }
  },

  // Personel detayını getir
  async getPersonnelById(id: string): Promise<Personnel | null> {
    try {
      const response = await fetch(`/api/personnel/${id}`)
      const result = await response.json()
      
      if (!result.success) {
        console.log('Personel detay getirme hatası:', result.error)
        return null
      }
      
      return result.data
    } catch (error) {
      console.log('Personel detay getirme hatası:', error)
      return null
    }
  },

  // Email ile personel ara
  async getPersonnelByEmail(email: string): Promise<Personnel | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) {
        console.log('Email ile personel arama hatası:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.log('Email ile personel arama hatası:', error)
      return null
    }
  },

  // Personel istatistiklerini getir
  async getPersonnelStats(): Promise<{
    total: number
    byDepartment: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      
      if (error) {
        console.log('Personel istatistikleri getirme hatası:', error)
        return {
          total: 0,
          byDepartment: {}
        }
      }

      const personnel = data || []
      const byDepartment: Record<string, number> = {}

      personnel.forEach((person: Personnel) => {
        const dept = person.department || 'Belirtilmemiş'
        byDepartment[dept] = (byDepartment[dept] || 0) + 1
      })

      return {
        total: personnel.length,
        byDepartment
      }
    } catch (error) {
      console.log('Personel istatistikleri getirme hatası:', error)
      return {
        total: 0,
        byDepartment: {}
      }
    }
  },

  // Şifre değiştir
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      // supabaseAdmin kontrolü
      if (!supabaseAdmin) {
        console.log('supabaseAdmin mevcut değil, SUPABASE_SERVICE_ROLE_KEY gerekli')
        return false
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      })

      if (error) {
        console.log('Şifre güncelleme hatası:', error)
        return false
      }

      return true
    } catch (error) {
      console.log('Şifre güncelleme hatası:', error)
      return false
    }
  },

  // Yöneticileri getir
  async getManagers(): Promise<Personnel[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('position', 'manager')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.log('Yönetici getirme hatası:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.log('Yönetici getirme hatası:', error)
      return []
    }
  }
}

// Basit personel listesi için yardımcı fonksiyon
export async function getAllPersonnelBasic() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name', { ascending: true })
    
    if (error) {
      console.log('Basit personel listesi getirme hatası:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.log('Basit personel listesi getirme hatası:', error)
    return []
  }
}
