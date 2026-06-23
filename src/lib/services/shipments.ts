import { supabase } from '../supabase'

export type Shipment = {
  id: string
  project_id: string
  shipment_date: string
  status: string
  notes?: string
  created_at: string
  updated_at?: string
}

export type ShipmentInsert = {
  project_id: string
  shipment_date: string
  status?: string
  notes?: string
}

export type ShipmentUpdate = Partial<ShipmentInsert>

export const shipmentService = {
  async getAllShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('shipment_date', { ascending: false })

    if (error) throw error
    return data as Shipment[]
  },

  async createShipment(shipment: ShipmentInsert) {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single()

    if (error) throw error
    return data as Shipment
  },

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

  async deleteShipment(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

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
