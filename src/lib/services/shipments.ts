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

  // Sevkiyat oluştur
  async createShipment(shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('shipments')
      .insert({
        number: shipment.number,
        project_id: shipment.projectId,
        status: shipment.status,
        priority: shipment.priority,
        destination: shipment.destination,
        scheduled_date: shipment.scheduledDate,
        actual_date: shipment.actualDate,
        carrier: shipment.carrier,
        tracking_number: shipment.trackingNumber,
        total_weight: shipment.totalWeight
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Sevkiyat oluşturulamadı: ${error.message}`)
    }

    return {
      id: data.id,
      number: data.number,
      projectId: data.project_id,
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

  // Sevkiyat güncelle
  async updateShipment(id: string, updates: Partial<Shipment>) {
    const updateData: any = {}
    
    if (updates.number) updateData.number = updates.number
    if (updates.projectId) updateData.project_id = updates.projectId
    if (updates.status) updateData.status = updates.status
    if (updates.priority) updateData.priority = updates.priority
    if (updates.destination) updateData.destination = updates.destination
    if (updates.scheduledDate) updateData.scheduled_date = updates.scheduledDate
    if (updates.actualDate) updateData.actual_date = updates.actualDate
    if (updates.carrier) updateData.carrier = updates.carrier
    if (updates.trackingNumber) updateData.tracking_number = updates.trackingNumber
    if (updates.totalWeight) updateData.total_weight = updates.totalWeight
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Sevkiyat güncellenemedi: ${error.message}`)
    }

    return {
      id: data.id,
      number: data.number,
      projectId: data.project_id,
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

  // Sevkiyat sil
  async deleteShipment(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Sevkiyat silinemedi: ${error.message}`)
    }

    return true
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