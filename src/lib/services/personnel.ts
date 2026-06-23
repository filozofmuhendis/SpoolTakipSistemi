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
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        email: personnel.email,
        full_name: personnel.full_name,
        name: personnel.full_name,
        phone: personnel.phone || '',
        department: personnel.department || '',
        position: personnel.position || '',
        role: 'user',
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
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
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
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
  async updatePassword(_userId: string, _newPassword: string) {
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

