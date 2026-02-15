import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type MaterialRequest = Tables<'material_requests'> & {
  projectName?: string
  spoolName?: string
  requestedByName?: string
  approvedByName?: string
  items?: MaterialRequestItem[]
}

export type MaterialRequestItem = Tables<'material_request_items'> & {
  inventoryName?: string
}

export type MaterialRequestInsert = TablesInsert<'material_requests'>
export type MaterialRequestUpdate = TablesUpdate<'material_requests'>
export type MaterialRequestItemInsert = TablesInsert<'material_request_items'>
export type MaterialRequestItemUpdate = TablesUpdate<'material_request_items'>

export const materialRequestService = {
  // Tüm malzeme taleplerini getir
  async getAllRequests() {
    const { data, error } = await supabase
      .from('material_requests')
      .select(`
        *,
        projects:project_id(name),
        spools:spool_id(name),
        profiles:requested_by(full_name),
        approver:approved_by(full_name)
      `)
      .order('created_at', { ascending: false }) // requested_date might be null, created_at is safer

    if (error) throw error

    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) as MaterialRequest[]
  },

  // ID'ye göre talep getir
  async getRequestById(id: string) {
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
      }))
    } as MaterialRequest
  },

  // Yeni talep oluştur
  async createRequest(request: MaterialRequestInsert) {
    const { data, error } = await supabase
      .from('material_requests')
      .insert(request)
      .select()
      .single()

    if (error) throw error
    return data as MaterialRequest
  },

  // Talep güncelle
  async updateRequest(id: string, updates: MaterialRequestUpdate) {
    const { data, error } = await supabase
      .from('material_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MaterialRequest
  },

  // Talep sil
  async deleteRequest(id: string) {
    // Önce talep kalemlerini sil (ON DELETE CASCADE varsa gerek yok ama emin olalım)
    // Şemada ON DELETE CASCADE var: request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE
    // Bu yüzden kalemleri manuel silmeye gerek yok.

    const { error } = await supabase
      .from('material_requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Talep onayla
  async approveRequest(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('material_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MaterialRequest
  },

  // Talep reddet
  async rejectRequest(id: string, approvedBy: string, notes?: string) {
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
    return data as MaterialRequest
  },

  // Talep tamamla
  async fulfillRequest(id: string) {
    const { data, error } = await supabase
      .from('material_requests')
      .update({
        status: 'fulfilled'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MaterialRequest
  },

  // Duruma göre talepleri getir
  async getRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'fulfilled') {
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
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) as MaterialRequest[]
  },

  // Projeye göre talepleri getir
  async getRequestsByProject(projectId: string) {
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
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) as MaterialRequest[]
  },

  // Kullanıcının taleplerini getir
  async getRequestsByUser(userId: string) {
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
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name,
      spoolName: item.spools?.name,
      requestedByName: item.profiles?.full_name,
      approvedByName: item.approver?.full_name
    })) as MaterialRequest[]
  },

  // Talep kalemi ekle
  async addRequestItem(item: MaterialRequestItemInsert) {
    const { data, error } = await supabase
      .from('material_request_items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data as MaterialRequestItem
  },

  // Talep kalemi güncelle
  async updateRequestItem(id: string, updates: MaterialRequestItemUpdate) {
    const { data, error } = await supabase
      .from('material_request_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MaterialRequestItem
  },

  // Talep kalemi sil
  async deleteRequestItem(id: string) {
    const { error } = await supabase
      .from('material_request_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Talep kalemlerini getir
  async getRequestItems(requestId: string) {
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
    })) as MaterialRequestItem[]
  }
} 