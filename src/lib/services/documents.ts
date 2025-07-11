import { supabase } from '../supabase'
import { Document } from '@/types'

export const documentService = {
  // Tüm dokümanları getir
  async getAllDocuments() {
    try {
      const { data, error } = await supabase
        .from('public.documents')
        .select('id, project_id, name, url, uploaded_by, uploaded_at, notes')
        .order('uploaded_at', { ascending: false })
      if (error) return [];
      if (!data || data.length === 0) return [];
      return data;
    } catch (error) {
      return [];
    }
  },

  // Doküman oluştur
  async createDocument(document: Omit<Document, 'id'>) {
    const { data, error } = await supabase
      .from('public.documents')
      .insert(document)
      .select('id, project_id, name, url, uploaded_by, uploaded_at, notes')
      .single()
    if (error) throw new Error(`Doküman oluşturulamadı: ${error.message}`)
    return data;
  },

  // Doküman güncelle
  async updateDocument(id: string, updates: Partial<Document>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
      .from('public.documents')
      .update(updateData)
      .eq('id', id)
      .select('id, project_id, name, url, uploaded_by, uploaded_at, notes')
      .single()
    if (error) throw new Error(`Doküman güncellenemedi: ${error.message}`)
    return data;
  },

  // Doküman sil
  async deleteDocument(id: string) {
    const { error } = await supabase
      .from('public.documents')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Doküman silinemedi: ${error.message}`)
    return true;
  },

  // Doküman detayını getir
  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from('public.documents')
      .select('id, project_id, name, url, uploaded_by, uploaded_at, notes')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  }
} 