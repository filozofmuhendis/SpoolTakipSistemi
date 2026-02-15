import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Spool = Tables<'spools'>
export type SpoolInsert = TablesInsert<'spools'>
export type SpoolUpdate = TablesUpdate<'spools'>

export const spoolService = {
  // Tüm ürün alt kalemlerini getir
  async getAllSpools() {
    const { data, error } = await supabase
      .from('spools')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data as Spool[]
  },

  // Spools arama fonksiyonu
  async searchSpools(search: string) {
    const { data, error } = await supabase
      .from('spools')
      .select('*')
      .or(`name.ilike.%${search}%,material.ilike.%${search}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Ürün alt kalemi oluştur
  async createSpool(spool: SpoolInsert) {
    const { data, error } = await supabase
      .from('spools')
      .insert(spool)
      .select()
      .single()

    if (error) throw error
    return data as Spool
  },

  // Ürün alt kalemi güncelle
  async updateSpool(id: string, updates: SpoolUpdate) {
    const { data, error } = await supabase
      .from('spools')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Spool
  },

  // Ürün alt kalemi sil
  async deleteSpool(id: string) {
    const { error } = await supabase
      .from('spools')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Ürün alt kalemi detayını getir
  async getSpoolById(id: string) {
    const { data, error } = await supabase
      .from('spools')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Spool
  }
}

