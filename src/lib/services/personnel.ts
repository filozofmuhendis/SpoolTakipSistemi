import { supabase } from '../supabase'

export interface Personnel {
  id: string
  email: string
  fullName: string
  phone?: string
  department?: string
  position?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export const personnelService = {
  // Tüm personeli getir
  async getAllPersonnel(): Promise<Personnel[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.log('Personel getirme hatası:', error)
        return []
      }
      
      return data || []
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
    fullName: string
    phone?: string
    department?: string
    position?: string
  }): Promise<Personnel | null> {
    try {
      // Önce auth.users'a kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: personnel.email,
        password: personnel.password,
        email_confirm: true,
        user_metadata: {
          full_name: personnel.fullName,
          department: personnel.department,
          position: personnel.position
        }
      })

      if (authError) {
        console.log('Auth kullanıcı oluşturma hatası:', authError)
        return null
      }

      if (!authData.user) {
        console.log('Auth kullanıcı oluşturulamadı')
        return null
      }

      // Sonra profiles tablosuna ekle
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: personnel.email,
          full_name: personnel.fullName,
          phone: personnel.phone,
          department: personnel.department,
          position: personnel.position
        })
        .select()
        .single()
      
      if (error) {
        console.log('Profil oluşturma hatası:', error)
        // Auth kullanıcısını sil
        await supabase.auth.admin.deleteUser(authData.user.id)
        return null
      }
      
      return data
    } catch (error) {
      console.log('Personel oluşturma hatası:', error)
      return null
    }
  },

  // Personel güncelle
  async updatePersonnel(id: string, updates: Partial<Personnel>): Promise<Personnel | null> {
    try {
      const updateData: any = {}
      if (updates.fullName) updateData.full_name = updates.fullName
      if (updates.email) updateData.email = updates.email
      if (updates.phone) updateData.phone = updates.phone
      if (updates.department) updateData.department = updates.department
      if (updates.position) updateData.position = updates.position
      if (updates.avatarUrl) updateData.avatar_url = updates.avatarUrl

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
      // Önce auth.users'dan sil
      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      
      if (authError) {
        console.log('Auth kullanıcı silme hatası:', authError)
        return false
      }

      // Profiles tablosundan otomatik silinir (CASCADE)
      return true
    } catch (error) {
      console.log('Personel silme hatası:', error)
      return false
    }
  },

  // Personel detayını getir
  async getPersonnelById(id: string): Promise<Personnel | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.log('Personel detay getirme hatası:', error)
        return null
      }
      
      return data
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

      personnel.forEach(person => {
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
      const { error } = await supabase.auth.admin.updateUserById(userId, {
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
