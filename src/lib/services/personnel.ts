import { supabase, supabaseAdmin } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Personnel = Tables<'profiles'>
export type PersonnelInsert = TablesInsert<'profiles'>
export type PersonnelUpdate = TablesUpdate<'profiles'>

export const personnelService = {
  // Tüm personeli getir
  async getAllPersonnel() {
    // Server-side ise admin client kullan, client-side ise normal client
    const client = typeof window === 'undefined' && supabaseAdmin ? supabaseAdmin : supabase;

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw error
    return data as Personnel[]
  },

  // Aktif personeli getir
  async getActivePersonnel() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'active')
      .order('full_name', { ascending: true })

    if (error) throw error
    return data as Personnel[]
  },

  // Belirli departmandaki personeli getir
  async getPersonnelByDepartment(department: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', department)
      .order('full_name', { ascending: true })

    if (error) throw error
    return data as Personnel[]
  },

  // Personel oluştur
  async createPersonnel(personnel: {
    email: string
    password: string
    full_name: string
    phone?: string
    department?: string
    position?: string
  }) {
    const response = await fetch('/api/personnel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personnel),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create personnel')
    }

    const { data } = await response.json()
    return data as Personnel
  },

  // Personel güncelle
  async updatePersonnel(id: string, updates: PersonnelUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Personnel
  },

  // Personel sil
  async deletePersonnel(id: string) {
    const response = await fetch(`/api/personnel?id=${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete personnel')
    }

    return true
  },

  // Personel detayını getir
  async getPersonnelById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Personnel
  },

  // Email ile personel ara
  async getPersonnelByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) return null
    return data as Personnel
  },

  // Personel istatistiklerini getir
  async getPersonnelStats() {
    const { data, error } = await supabase
      .from('profiles')
      .select('department')

    if (error) throw error

    const personnel = data || []
    const byDepartment: Record<string, number> = {}

    personnel.forEach((person) => {
      const dept = person.department || 'Belirtilmemiş'
      byDepartment[dept] = (byDepartment[dept] || 0) + 1
    })

    return {
      total: personnel.length,
      byDepartment
    }
  },

  // Şifre değiştir
  async updatePassword(userId: string, newPassword: string) {
    const response = await fetch('/api/personnel/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update password')
    }

    return true
  },

  // Yöneticileri getir
  async getManagers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('position', 'manager')
      .order('full_name', { ascending: true })

    if (error) throw error
    return data as Personnel[]
  }
}

// Basit personel listesi için yardımcı fonksiyon
export async function getAllPersonnelBasic() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data || []
}

