import { supabase } from '../supabase'
import { Project } from '@/types'

export const projectService = {
  // Tüm projeleri getir
  async getAllProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_manager_id_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Projeler getirilemedi:', error)
        return []
      }

      // Veri yoksa boş array döndür
      if (!data || data.length === 0) {
        return []
      }

      return data.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        managerId: project.manager_id,
        managerName: project.profiles?.name || 'Bilinmiyor',
        description: project.description,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }))
    } catch (error) {
      console.log('Projeler getirilemedi:', error)
      return []
    }
  },

  // Proje oluştur
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        manager_id: project.managerId,
        description: project.description
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Proje oluşturulamadı: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      managerId: data.manager_id,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Proje güncelle
  async updateProject(id: string, updates: Partial<Project>) {
    const updateData: any = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.status) updateData.status = updates.status
    if (updates.startDate) updateData.start_date = updates.startDate
    if (updates.endDate) updateData.end_date = updates.endDate
    if (updates.managerId) updateData.manager_id = updates.managerId
    if (updates.description) updateData.description = updates.description
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Proje güncellenemedi: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      managerId: data.manager_id,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Proje sil
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Proje silinemedi: ${error.message}`)
    }

    return true
  },

  // Proje detayını getir
  async getProjectById(id: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_manager_id_fkey(name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.log('Proje bulunamadı:', error)
        return null
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        name: data.name,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        managerId: data.manager_id,
        managerName: data.profiles?.name || 'Bilinmiyor',
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.log('Proje bulunamadı:', error)
      return null
    }
  }
} 
