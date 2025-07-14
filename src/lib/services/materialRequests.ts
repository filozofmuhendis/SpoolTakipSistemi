import { supabase } from '../supabase'
import { MaterialRequest, MaterialRequestItem } from '@/types'

export const materialRequestService = {
  // Tüm malzeme taleplerini getir
  async getAllRequests(): Promise<MaterialRequest[]> {
    const { data, error } = await supabase
      .from('material_requests')
      .select(`
        *,
        projects:project_id(name),
        spools:spool_id(name),
        profiles:requested_by(full_name),
        approver:approved_by(full_name)
      `)
      .order('requested_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) || []
  },

  // ID'ye göre talep getir
  async getRequestById(id: string): Promise<MaterialRequest | null> {
    const { data, error } = await supabase
      .from('material_requests')
      .select(`
        *,
        projects:project_id(name),
        spools:spool_id(name),
        profiles:requested_by(full_name),
        approver:approved_by(full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    
    if (!data) return null

    // Talep kalemlerini de getir
    const { data: items, error: itemsError } = await supabase
      .from('material_request_items')
      .select(`
        *,
        inventory:inventory_id(name)
      `)
      .eq('request_id', id)

    if (itemsError) throw itemsError

    return {
      ...data,
      projectName: data.projects?.name,
      spoolName: data.spools?.name,
      requestedByName: data.profiles?.full_name,
      approvedByName: data.approver?.full_name,
      items: items?.map(item => ({
        ...item,
        inventoryName: item.inventory?.name
      })) || []
    }
  },

  // Yeni talep oluştur
  async createRequest(request: Omit<MaterialRequest, 'id' | 'createdAt' | 'updatedAt' | 'projectName' | 'spoolName' | 'requestedByName' | 'approvedByName' | 'items'>): Promise<MaterialRequest> {
    const { data, error } = await supabase
      .from('material_requests')
      .insert({
        request_number: request.request_number,
        project_id: request.project_id,
        urun_alt_kalemi_id: request.urun_alt_kalemi_id,
        requested_by: request.requested_by,
        status: request.status,
        priority: request.priority,
        request_date: request.request_date,
        required_date: request.required_date,
        notes: request.notes
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Talep güncelle
  async updateRequest(id: string, updates: Partial<MaterialRequest>): Promise<MaterialRequest> {
    const { data, error } = await supabase
      .from('material_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Talep sil
  async deleteRequest(id: string): Promise<void> {
    // Önce talep kalemlerini sil
    const { error: itemsError } = await supabase
      .from('material_request_items')
      .delete()
      .eq('request_id', id)

    if (itemsError) throw itemsError

    // Sonra talebi sil
    const { error } = await supabase
      .from('material_requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Talep onayla
  async approveRequest(id: string, approvedBy: string, approvedAt?: string): Promise<MaterialRequest> {
    const { data, error } = await supabase
      .from('material_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: approvedAt || new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Talep reddet
  async rejectRequest(id: string, approvedBy: string, notes?: string): Promise<MaterialRequest> {
    const { data, error } = await supabase
      .from('material_requests')
      .update({
        status: 'rejected',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Talep tamamla
  async fulfillRequest(id: string): Promise<MaterialRequest> {
    const { data, error } = await supabase
      .from('material_requests')
      .update({
        status: 'fulfilled'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Duruma göre talepleri getir
  async getRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'fulfilled'): Promise<MaterialRequest[]> {
    const { data, error } = await supabase
      .from('material_requests')
      .select(`
        *,
        projects:project_id(name),
        spools:spool_id(name),
        profiles:requested_by(full_name),
        approver:approved_by(full_name)
      `)
      .eq('status', status)
      .order('requested_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) || []
  },

  // Projeye göre talepleri getir
  async getRequestsByProject(projectId: string): Promise<MaterialRequest[]> {
    const { data, error } = await supabase
      .from('material_requests')
      .select(`
        *,
        projects:project_id(name),
        spools:spool_id(name),
        profiles:requested_by(full_name),
        approver:approved_by(full_name)
      `)
      .eq('project_id', projectId)
      .order('requested_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) || []
  },

  // Kullanıcının taleplerini getir
  async getRequestsByUser(userId: string): Promise<MaterialRequest[]> {
    const { data, error } = await supabase
      .from('material_requests')
      .select(`
        *,
        projects:project_id(name),
        spools:spool_id(name),
        profiles:requested_by(full_name),
        approver:approved_by(full_name)
      `)
      .eq('requested_by', userId)
      .order('requested_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) || []
  },

  // Talep kalemi ekle
  async addRequestItem(item: Omit<MaterialRequestItem, 'id' | 'createdAt' | 'inventoryName'>): Promise<MaterialRequestItem> {
    const { data, error } = await supabase
      .from('material_request_items')
      .insert({
        request_id: item.request_id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Talep kalemi güncelle
  async updateRequestItem(id: string, updates: Partial<MaterialRequestItem>): Promise<MaterialRequestItem> {
    const { data, error } = await supabase
      .from('material_request_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Talep kalemi sil
  async deleteRequestItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('material_request_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Talep kalemlerini getir
  async getRequestItems(requestId: string): Promise<MaterialRequestItem[]> {
    const { data, error } = await supabase
      .from('material_request_items')
      .select(`
        *,
        inventory:inventory_id(name)
      `)
      .eq('request_id', requestId)

    if (error) throw error
    return data?.map(item => ({
      ...item,
      inventoryName: item.inventory?.name
    })) || []
  }
} 