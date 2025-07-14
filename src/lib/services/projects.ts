import { supabase } from '../supabase'
import { Project } from '@/types'

export const projectService = {
  // Tüm projeleri getir
  async getAllProjects() {
    try {
      const { data, error } = await supabase
        .from('public.projects')
        .select('id, name, shipyard, ship, start_date, delivery_date, created_by, created_at, client_name, description, end_date, priority, project_code, status')
        .order('created_at', { ascending: false })
      if (error) return [];
      if (!data || data.length === 0) return [];
      return data;
    } catch (error) {
      return [];
    }
  },

  // Proje oluştur
  async createProject(project: Omit<Project, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('public.projects')
      .insert(project)
      .select('id, name, shipyard, ship, start_date, delivery_date, created_by, created_at, client_name, description, end_date, priority, project_code, status')
      .single()
    if (error) throw new Error(`Proje oluşturulamadı: ${error.message}`)
    return data;
  },

  // Proje güncelle
  async updateProject(id: string, updates: Partial<Project>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
      .from('public.projects')
      .update(updateData)
      .eq('id', id)
      .select('id, name, shipyard, ship, start_date, delivery_date, created_by, created_at, client_name, description, end_date, priority, project_code, status')
      .single()
    if (error) throw new Error(`Proje güncellenemedi: ${error.message}`)
    return data;
  },

  // Proje sil
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('public.projects')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Proje silinemedi: ${error.message}`)
    return true;
  },

  // Proje detayını getir
  async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('public.projects')
      .select('id, name, shipyard, ship, start_date, delivery_date, created_by, created_at, client_name, description, end_date, priority, project_code, status')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  }
} 
