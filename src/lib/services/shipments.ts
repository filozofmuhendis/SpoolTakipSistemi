import { supabase } from '../supabase'
import { Shipment } from '@/types'

export const shipmentService = {
  // Tüm sevkiyatları getir
  async getAllShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        projects!shipments_project_id_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Sevkiyatlar getirilemedi: ${error.message}`)
    }

    return data.map(shipment => ({
      id: shipment.id,
      number: shipment.number,
      projectId: shipment.project_id,
      projectName: shipment.projects?.name || 'Bilinmiyor',
      status: shipment.status,
      priority: shipment.priority,
      destination: shipment.destination,
      scheduledDate: shipment.scheduled_date,
      actualDate: shipment.actual_date,
      carrier: shipment.carrier,
      trackingNumber: shipment.tracking_number,
      totalWeight: shipment.total_weight,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at
    }))
  },

  // Sevkiyat detayını getir
  async getShipmentById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        projects!shipments_project_id_fkey(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Sevkiyat bulunamadı: ${error.message}`)
    }

    return {
      id: data.id,
      number: data.number,
      projectId: data.project_id,
      projectName: data.projects?.name || 'Bilinmiyor',
      status: data.status,
      priority: data.priority,
      destination: data.destination,
      scheduledDate: data.scheduled_date,
      actualDate: data.actual_date,
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      totalWeight: data.total_weight,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Yeni sevkiyat oluştur
  async createShipment(data: {
    number: string
    projectId: string
    status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    destination: string
    scheduledDate: string
    actualDate?: string
    carrier: string
    trackingNumber?: string
    totalWeight: number
  }) {
    const { data: shipment, error } = await supabase
      .from('shipments')
      .insert([{
        number: data.number,
        project_id: data.projectId,
        status: data.status,
        priority: data.priority,
        destination: data.destination,
        scheduled_date: data.scheduledDate,
        actual_date: data.actualDate,
        carrier: data.carrier,
        tracking_number: data.trackingNumber,
        total_weight: data.totalWeight
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Sevkiyat oluşturulamadı: ${error.message}`)
    }

    return shipment
  },

  // Sevkiyat güncelle
  async updateShipment(id: string, data: {
    number?: string
    projectId?: string
    status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    destination?: string
    scheduledDate?: string
    actualDate?: string
    carrier?: string
    trackingNumber?: string
    totalWeight?: number
  }) {
    const updateData: any = {}
    
    if (data.number) updateData.number = data.number
    if (data.projectId) updateData.project_id = data.projectId
    if (data.status) updateData.status = data.status
    if (data.priority) updateData.priority = data.priority
    if (data.destination) updateData.destination = data.destination
    if (data.scheduledDate) updateData.scheduled_date = data.scheduledDate
    if (data.actualDate !== undefined) updateData.actual_date = data.actualDate
    if (data.carrier) updateData.carrier = data.carrier
    if (data.trackingNumber !== undefined) updateData.tracking_number = data.trackingNumber
    if (data.totalWeight) updateData.total_weight = data.totalWeight

    const { data: shipment, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Sevkiyat güncellenemedi: ${error.message}`)
    }

    return shipment
  },

  // Sevkiyat sil
  async deleteShipment(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Sevkiyat silinemedi: ${error.message}`)
    }
  },

  // Proje bazlı sevkiyatlar getir
  async getShipmentsByProject(projectId: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Proje sevkiyatları getirilemedi: ${error.message}`)
    }

    return data.map(shipment => ({
      id: shipment.id,
      number: shipment.number,
      projectId: shipment.project_id,
      status: shipment.status,
      priority: shipment.priority,
      destination: shipment.destination,
      scheduledDate: shipment.scheduled_date,
      actualDate: shipment.actual_date,
      carrier: shipment.carrier,
      trackingNumber: shipment.tracking_number,
      totalWeight: shipment.total_weight,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at
    }))
  },

  // Durum bazlı sevkiyatlar getir
  async getShipmentsByStatus(status: Shipment['status']) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        projects!shipments_project_id_fkey(name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Durum bazlı sevkiyatlar getirilemedi: ${error.message}`)
    }

    return data.map(shipment => ({
      id: shipment.id,
      number: shipment.number,
      projectId: shipment.project_id,
      projectName: shipment.projects?.name || 'Bilinmiyor',
      status: shipment.status,
      priority: shipment.priority,
      destination: shipment.destination,
      scheduledDate: shipment.scheduled_date,
      actualDate: shipment.actual_date,
      carrier: shipment.carrier,
      trackingNumber: shipment.tracking_number,
      totalWeight: shipment.total_weight,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at
    }))
  }
} 