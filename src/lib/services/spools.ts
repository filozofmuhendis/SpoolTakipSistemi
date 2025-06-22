import { supabase } from '../supabase'
import { Spool } from '@/types'

export const spoolService = {
  // Tüm spool'ları getir
  async getAllSpools() {
    const { data, error } = await supabase
      .from('spools')
      .select(`
        *,
        projects!spools_project_id_fkey(name),
        profiles!spools_assigned_to_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Spool'lar getirilemedi: ${error.message}`)
    }

    return data.map(spool => ({
      id: spool.id,
      name: spool.name,
      projectId: spool.project_id,
      projectName: spool.projects?.name || 'Bilinmiyor',
      status: spool.status,
      assignedTo: spool.assigned_to,
      assignedToName: spool.profiles?.name || 'Atanmamış',
      quantity: spool.quantity,
      completedQuantity: spool.completed_quantity,
      startDate: spool.start_date,
      endDate: spool.end_date,
      createdAt: spool.created_at,
      updatedAt: spool.updated_at
    }))
  },

  // Spool oluştur
  async createSpool(spool: Omit<Spool, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('spools')
      .insert({
        name: spool.name,
        project_id: spool.projectId,
        status: spool.status,
        assigned_to: spool.assignedTo,
        quantity: spool.quantity,
        completed_quantity: spool.completedQuantity || 0,
        start_date: spool.startDate,
        end_date: spool.endDate
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Spool oluşturulamadı: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      status: data.status,
      assignedTo: data.assigned_to,
      quantity: data.quantity,
      completedQuantity: data.completed_quantity,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Spool güncelle
  async updateSpool(id: string, updates: Partial<Spool>) {
    const updateData: any = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.projectId) updateData.project_id = updates.projectId
    if (updates.status) updateData.status = updates.status
    if (updates.assignedTo) updateData.assigned_to = updates.assignedTo
    if (updates.quantity) updateData.quantity = updates.quantity
    if (updates.completedQuantity !== undefined) updateData.completed_quantity = updates.completedQuantity
    if (updates.startDate) updateData.start_date = updates.startDate
    if (updates.endDate) updateData.end_date = updates.endDate
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('spools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Spool güncellenemedi: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      status: data.status,
      assignedTo: data.assigned_to,
      quantity: data.quantity,
      completedQuantity: data.completed_quantity,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Spool sil
  async deleteSpool(id: string) {
    const { error } = await supabase
      .from('spools')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Spool silinemedi: ${error.message}`)
    }

    return true
  },

  // Spool detayını getir
  async getSpoolById(id: string) {
    const { data, error } = await supabase
      .from('spools')
      .select(`
        *,
        projects!spools_project_id_fkey(name),
        profiles!spools_assigned_to_fkey(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Spool bulunamadı: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      projectName: data.projects?.name || 'Bilinmiyor',
      status: data.status,
      assignedTo: data.assigned_to,
      assignedToName: data.profiles?.name || 'Atanmamış',
      quantity: data.quantity,
      completedQuantity: data.completed_quantity,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Proje bazlı spool'lar getir
  async getSpoolsByProject(projectId: string) {
    const { data, error } = await supabase
      .from('spools')
      .select(`
        *,
        profiles!spools_assigned_to_fkey(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Proje spool'ları getirilemedi: ${error.message}`)
    }

    return data.map(spool => ({
      id: spool.id,
      name: spool.name,
      projectId: spool.project_id,
      status: spool.status,
      assignedTo: spool.assigned_to,
      assignedToName: spool.profiles?.name || 'Atanmamış',
      quantity: spool.quantity,
      completedQuantity: spool.completed_quantity,
      startDate: spool.start_date,
      endDate: spool.end_date,
      createdAt: spool.created_at,
      updatedAt: spool.updated_at
    }))
  },

  // Durum bazlı spool'lar getir
  async getSpoolsByStatus(status: Spool['status']) {
    const { data, error } = await supabase
      .from('spools')
      .select(`
        *,
        projects!spools_project_id_fkey(name),
        profiles!spools_assigned_to_fkey(name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Durum bazlı spool'lar getirilemedi: ${error.message}`)
    }

    return data.map(spool => ({
      id: spool.id,
      name: spool.name,
      projectId: spool.project_id,
      projectName: spool.projects?.name || 'Bilinmiyor',
      status: spool.status,
      assignedTo: spool.assigned_to,
      assignedToName: spool.profiles?.name || 'Atanmamış',
      quantity: spool.quantity,
      completedQuantity: spool.completed_quantity,
      startDate: spool.start_date,
      endDate: spool.end_date,
      createdAt: spool.created_at,
      updatedAt: spool.updated_at
    }))
  },

  // İlerleme güncelle
  async updateProgress(id: string, completedQuantity: number) {
    const { data, error } = await supabase
      .from('spools')
      .update({
        completed_quantity: completedQuantity,
        status: completedQuantity >= (await this.getSpoolById(id)).quantity ? 'completed' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`İlerleme güncellenemedi: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      status: data.status,
      assignedTo: data.assigned_to,
      quantity: data.quantity,
      completedQuantity: data.completed_quantity,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
} 