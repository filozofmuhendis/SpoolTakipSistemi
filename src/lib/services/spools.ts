import { supabase } from '../supabase'
import { UrunAltKalemi } from '@/types'

export const spoolService = {
  // Tüm ürün alt kalemlerini getir
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

  // Ürün alt kalemi oluştur
  async createSpool(spool: Omit<UrunAltKalemi, 'id'>) {
    const { data, error } = await supabase
      .from('public.spools')
      .insert(spool)
      .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
      .single()
    if (error) throw new Error(`Ürün alt kalemi oluşturulamadı: ${error.message}`)
    return data;
  },

  // Ürün alt kalemi güncelle
  async updateSpool(id: string, updates: Partial<UrunAltKalemi>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
      .from('public.spools')
      .update(updateData)
      .eq('id', id)
      .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
      .single()
    if (error) throw new Error(`Ürün alt kalemi güncellenemedi: ${error.message}`)
    return data;
  },

  // Ürün alt kalemi sil
  async deleteSpool(id: string) {
    const { error } = await supabase
      .from('public.spools')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Ürün alt kalemi silinemedi: ${error.message}`)
    return true;
  },

  // Ürün alt kalemi detayını getir
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
