import { supabase } from '../supabase'
import { JobOrder } from '@/types'

export const jobOrderService = {
  // Tüm iş emirlerini getir
  async getAllJobOrders() {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('id, project_id, spool_id, description, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_by')
        .order('planned_start_date', { ascending: false })
      if (error) {
        console.log('İş emirleri yüklenirken hata:', error)
        throw new Error(`İş emirleri yüklenemedi: ${error.message}`)
      }
      return data || [];
    } catch (error) {
      console.log('Job orders service hatası:', error)
      throw error;
    }
  },

  // İş emri oluştur
  async createJobOrder(jobOrder: Omit<JobOrder, 'id'>) {
    const { data, error } = await supabase
      .from('work_orders')
      .insert(jobOrder)
      .select('id, project_id, spool_id, description, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_by')
      .single()
    if (error) throw new Error(`İş emri oluşturulamadı: ${error.message}`)
    return data;
  },

  // İş emri güncelle
  async updateJobOrder(id: string, updates: Partial<JobOrder>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', id)
      .select('id, project_id, spool_id, description, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_by')
      .single()
    if (error) throw new Error(`İş emri güncellenemedi: ${error.message}`)
    return data;
  },

  // İş emri sil
  async deleteJobOrder(id: string) {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`İş emri silinemedi: ${error.message}`)
    return true;
  },

  // İş emri detayını getir
  async getJobOrderById(id: string) {
    const { data, error } = await supabase
      .from('work_orders')
      .select('id, project_id, spool_id, description, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_by')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  }
}
