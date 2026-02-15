import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Project = Tables<'projects'>
export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export const projectService = {
  // Tüm projeleri getir
  async getAllProjects() {
    const response = await fetch('/api/projects', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Projeler getirilemedi');
    }
    const result = await response.json();
    return result.data as Project[];
  },

  // Proje oluştur
  async createProject(project: ProjectInsert) {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Proje oluşturulamadı');
    }
    const result = await response.json();
    return result.data as Project;
  },

  // Proje güncelle
  async updateProject(_id: string, _updates: ProjectUpdate) {
    // Placeholder until API is ready
    return {} as Project;
  },

  // Proje sil
  async deleteProject(_id: string) {
    // Placeholder until API is ready
    return true;
  },

  // Proje detayını getir
  async getProjectById(_id: string) {
    // Placeholder until API is ready
    return {} as Project;
  }
}
