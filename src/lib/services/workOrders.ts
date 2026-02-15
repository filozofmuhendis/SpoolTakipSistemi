import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type JobOrder = Tables<'work_orders'>
export type JobOrderInsert = TablesInsert<'work_orders'>
export type JobOrderUpdate = TablesUpdate<'work_orders'>

export const jobOrderService = {
  // Tüm iş emirlerini getir
  async getAllJobOrders() {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('planned_start_date', { ascending: false })

    if (error) throw error
    return data as JobOrder[]
  },

  // İş emri oluştur
  async createJobOrder(jobOrder: JobOrderInsert) {
    const { data, error } = await supabase
      .from('work_orders')
      .insert(jobOrder)
      .select()
      .single()

    if (error) throw error
    return data as JobOrder
  },

  // İş emri güncelle
  async updateJobOrder(id: string, updates: JobOrderUpdate) {
    const { data, error } = await supabase
      .from('work_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as JobOrder
  },

  // İş emri sil
  async deleteJobOrder(id: string) {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // İş emri detayını getir
  async getJobOrderById(id: string) {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as JobOrder
  }
}

