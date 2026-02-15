import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Shipment = Tables<'shipments'>
export type ShipmentInsert = TablesInsert<'shipments'>
export type ShipmentUpdate = TablesUpdate<'shipments'>

export const shipmentService = {
  // Tüm sevkiyatları getir
  async getAllShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('shipment_date', { ascending: false })

    if (error) throw error
    return data as Shipment[]
  },

  // Sevkiyat oluştur
  async createShipment(shipment: ShipmentInsert) {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single()

    if (error) throw error
    return data as Shipment
  },

  // Sevkiyat güncelle
  async updateShipment(id: string, updates: ShipmentUpdate) {
    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Shipment
  },

  // Sevkiyat sil
  async deleteShipment(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Sevkiyat detayını getir
  async getShipmentById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Shipment
  }
}

