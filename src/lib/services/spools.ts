import { supabase } from '../supabase'
import { UrunAltKalemi } from '@/types'

// Spool tipi için alias
type Spool = UrunAltKalemi

export const spoolService = {
  // Tüm ürün alt kalemlerini getir
  async getAllSpools() {
    try {
      const { data, error } = await supabase
        .from('public.spools')
        .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
        .order('name', { ascending: true })
      if (error) {
        console.log('Spools yüklenirken hata:', error)
        throw new Error(`Spools yüklenemedi: ${error.message}`)
      }
      return data || [];
    } catch (error) {
      console.log('Spools service hatası:', error)
      throw error;
    }
  },

  // Ürün alt kalemi oluştur
  async createSpool(spool: Omit<Spool, 'id'>) {
    const { data, error } = await supabase
      .from('public.spools')
      .insert(spool)
      .select('id, project_id, name, material, diameter, thickness, length, weight, status, notes, created_by')
      .single()
    if (error) throw new Error(`Ürün alt kalemi oluşturulamadı: ${error.message}`)
    return data;
  },

  // Ürün alt kalemi güncelle
  async updateSpool(id: string, updates: Partial<Spool>) {
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
