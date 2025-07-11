import { supabase } from '../supabase'
import { Shipment } from '@/types'

export const shipmentService = {
  // Tüm sevkiyatları getir
  async getAllShipments() {
    try {
      const { data, error } = await supabase
        .from('public.shipments')
        .select('id, project_id, shipment_date, status, notes, created_by')
        .order('shipment_date', { ascending: false })
      if (error) return [];
      if (!data || data.length === 0) return [];
      return data;
    } catch (error) {
      return [];
    }
  },

  // Sevkiyat oluştur
  async createShipment(shipment: Omit<Shipment, 'id'>) {
    const { data, error } = await supabase
      .from('public.shipments')
      .insert(shipment)
      .select('id, project_id, shipment_date, status, notes, created_by')
      .single()
    if (error) throw new Error(`Sevkiyat oluşturulamadı: ${error.message}`)
    return data;
  },

  // Sevkiyat güncelle
  async updateShipment(id: string, updates: Partial<Shipment>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
      .from('public.shipments')
      .update(updateData)
      .eq('id', id)
      .select('id, project_id, shipment_date, status, notes, created_by')
      .single()
    if (error) throw new Error(`Sevkiyat güncellenemedi: ${error.message}`)
    return data;
  },

  // Sevkiyat sil
  async deleteShipment(id: string) {
    const { error } = await supabase
      .from('public.shipments')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Sevkiyat silinemedi: ${error.message}`)
    return true;
  },

  // Sevkiyat detayını getir
  async getShipmentById(id: string) {
    const { data, error } = await supabase
      .from('public.shipments')
      .select('id, project_id, shipment_date, status, notes, created_by')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  }
}
