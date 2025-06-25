import { supabase } from '../supabase'
import { WorkOrder } from '@/types'

export const workOrderService = {
  // Tüm iş emirlerini getir
  async getAllWorkOrders() {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          projects!work_orders_project_id_fkey(name),
          personnel!work_orders_assigned_to_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('İş emirleri getirilemedi:', error)
        return []
      }

      // Veri yoksa boş array döndür
      if (!data || data.length === 0) {
        return []
      }

      return data.map(workOrder => ({
        id: workOrder.id,
        number: workOrder.number,
        projectId: workOrder.project_id,
        projectName: workOrder.projects?.name || 'Bilinmiyor',
        status: workOrder.status,
        priority: workOrder.priority,
        assignedTo: workOrder.assigned_to,
        assignedToName: workOrder.personnel?.name || 'Bilinmiyor',
        startDate: workOrder.start_date,
        dueDate: workOrder.due_date,
        description: workOrder.description,
        createdAt: workOrder.created_at,
        updatedAt: workOrder.updated_at
      }))
    } catch (error) {
      console.log('İş emirleri getirilemedi:', error)
      return []
    }
  },

  // İş emri oluştur
  async createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        number: workOrder.number,
        project_id: workOrder.projectId,
        status: workOrder.status,
        priority: workOrder.priority,
        assigned_to: workOrder.assignedTo,
        start_date: workOrder.startDate,
        due_date: workOrder.dueDate,
        description: workOrder.description
      })
      .select()
      .single()

    if (error) {
      throw new Error(`İş emri oluşturulamadı: ${error.message}`)
    }

    return {
      id: data.id,
      number: data.number,
      projectId: data.project_id,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assigned_to,
      startDate: data.start_date,
      dueDate: data.due_date,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // İş emri güncelle
  async updateWorkOrder(id: string, updates: Partial<WorkOrder>) {
    const updateData: any = {}
    
    if (updates.number) updateData.number = updates.number
    if (updates.projectId) updateData.project_id = updates.projectId
    if (updates.status) updateData.status = updates.status
    if (updates.priority) updateData.priority = updates.priority
    if (updates.assignedTo) updateData.assigned_to = updates.assignedTo
    if (updates.startDate) updateData.start_date = updates.startDate
    if (updates.dueDate) updateData.due_date = updates.dueDate
    if (updates.description) updateData.description = updates.description
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`İş emri güncellenemedi: ${error.message}`)
    }

    return {
      id: data.id,
      number: data.number,
      projectId: data.project_id,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assigned_to,
      startDate: data.start_date,
      dueDate: data.due_date,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // İş emri sil
  async deleteWorkOrder(id: string) {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`İş emri silinemedi: ${error.message}`)
    }

    return true
  },

  // İş emri detayını getir
  async getWorkOrderById(id: string) {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          projects!work_orders_project_id_fkey(name),
          personnel!work_orders_assigned_to_fkey(name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.log('İş emri bulunamadı:', error)
        return null
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        number: data.number,
        projectId: data.project_id,
        projectName: data.projects?.name || 'Bilinmiyor',
        status: data.status,
        priority: data.priority,
        assignedTo: data.assigned_to,
        assignedToName: data.personnel?.name || 'Bilinmiyor',
        startDate: data.start_date,
        dueDate: data.due_date,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.log('İş emri bulunamadı:', error)
      return null
    }
  },

  // Proje bazlı iş emirleri getir
  async getWorkOrdersByProject(projectId: string) {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        personnel!work_orders_assigned_to_fkey(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Proje iş emirleri getirilemedi: ${error.message}`)
    }

    return data.map(workOrder => ({
      id: workOrder.id,
      number: workOrder.number,
      projectId: workOrder.project_id,
      status: workOrder.status,
      priority: workOrder.priority,
      assignedTo: workOrder.assigned_to,
      assignedToName: workOrder.personnel?.name || 'Bilinmiyor',
      startDate: workOrder.start_date,
      dueDate: workOrder.due_date,
      description: workOrder.description,
      createdAt: workOrder.created_at,
      updatedAt: workOrder.updated_at
    }))
  }
} 
