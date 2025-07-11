import { supabase } from '../supabase'
import { Spool } from '@/types'

export const spoolService = {
  // Tüm spool'ları getir
  async getAllSpools() {
    try {
      const { data, error } = await supabase
        .from('public.spools')
        .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
        .order('name', { ascending: true })
      if (error) return [];
      if (!data || data.length === 0) return [];
      return data;
    } catch (error) {
      return [];
    }
  },

  // Spool oluştur
  async createSpool(spool: Omit<Spool, 'id'>) {
    const { data, error } = await supabase
      .from('public.spools')
      .insert(spool)
      .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
      .single()
    if (error) throw new Error(`Spool oluşturulamadı: ${error.message}`)
    return data;
  },

  // Spool güncelle
  async updateSpool(id: string, updates: Partial<Spool>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
      .from('public.spools')
      .update(updateData)
      .eq('id', id)
      .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
      .single()
    if (error) throw new Error(`Spool güncellenemedi: ${error.message}`)
    return data;
  },

  // Spool sil
  async deleteSpool(id: string) {
    const { error } = await supabase
      .from('public.spools')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Spool silinemedi: ${error.message}`)
    return true;
  },

  // Spool detayını getir
  async getSpoolById(id: string) {
    const { data, error } = await supabase
      .from('public.spools')
      .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  }
} 
