import { supabase } from '../supabase'
import { Profile } from '@/types'

export const personnelService = {
  // Tüm personeli getir
  async getAllPersonnel() {
    try {
      const { data, error } = await supabase
        .from('public.profiles')
        .select('id, name, role, email')
        .order('name', { ascending: true })
      if (error) return [];
      if (!data || data.length === 0) return [];
      return data;
    } catch (error) {
      return [];
    }
  },

  // Sadece manager rolündekileri getir
  async getManagers() {
    const { data, error } = await supabase
      .from('public.profiles')
      .select('id, name, role, email')
      .eq('role', 'manager')
      .order('name', { ascending: true });
    if (error) return [];
    return data;
  },

  // Profil oluştur
  async createPersonnel(profile: Omit<Profile, 'id'>) {
    const { data, error } = await supabase
      .from('public.profiles')
      .insert({
        name: profile.name,
        role: profile.role,
        email: profile.email
      })
      .select('id, name, role, email')
      .single()
    if (error) throw new Error(`Profil oluşturulamadı: ${error.message}`)
    return data;
  },

  // Profil güncelle
  async updatePersonnel(id: string, updates: Partial<Profile>) {
    const updateData: any = {}
    if (updates.name) updateData.name = updates.name
    if (updates.role) updateData.role = updates.role
    if (updates.email) updateData.email = updates.email
    const { data, error } = await supabase
      .from('public.profiles')
      .update(updateData)
      .eq('id', id)
      .select('id, name, role, email')
      .single()
    if (error) throw new Error(`Profil güncellenemedi: ${error.message}`)
    return data;
  },

  // Profil sil
  async deletePersonnel(id: string) {
    const { error } = await supabase
      .from('public.profiles')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Profil silinemedi: ${error.message}`)
    return true;
  },

  // Profil detayını getir
  async getPersonnelById(id: string) {
    const { data, error } = await supabase
      .from('public.profiles')
      .select('id, name, role, email')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  }
}

export async function getAllPersonnelBasic() {
  const { data, error } = await supabase
    .from('public.profiles')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) return [];
  return data || [];
} 
