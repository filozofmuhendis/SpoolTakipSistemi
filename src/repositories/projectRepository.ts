import { supabase } from '@/lib/supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Project = Tables<'projects'>
export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export const projectRepository = {
    // Tüm projeleri getir (Active only)
    async findAll() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Project[]
    },

    // Proje oluştur
    async create(project: ProjectInsert) {
        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select()
            .single()

        if (error) throw error
        return data as Project
    },

    // Proje güncelle
    async update(id: string, updates: ProjectUpdate) {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Project
    },

    // Soft delete
    async delete(id: string) {
        const { error } = await supabase
            .from('projects')
            .update({ deleted_at: new Date().toISOString() } as any) // Cast to any if deleted_at not in types yet
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Proje detayını getir
    async findById(id: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single()

        if (error) return null
        return data as Project
    }
}
