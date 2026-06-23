import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Project = Tables<'projects'>
export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export const projectService = {
  // Tüm projeleri getir
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as Project[]
  },

  // Proje oluştur
  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  // Proje güncelle
  async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  // Proje sil
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Proje detayını getir
  async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Project
  }
}
