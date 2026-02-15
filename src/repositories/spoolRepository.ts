import { supabase } from '@/lib/supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Spool = Tables<'spools'>
export type SpoolInsert = TablesInsert<'spools'>
export type SpoolUpdate = TablesUpdate<'spools'>

export const spoolRepository = {
    // Tüm makaraları getir
    async findAll() {
        const { data, error } = await supabase
            .from('spools')
            .select('*, projects:project_id(name)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Spool[]
    },

    // Arama yap
    async search(query: string) {
        const { data, error } = await supabase
            .from('spools')
            .select('*, projects:project_id(name)')
            .is('deleted_at', null)
            .ilike('name', `%${query}%`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Spool[]
    },

    // Ürün alt kalemi oluştur
    async create(spool: SpoolInsert) {
        const { data, error } = await supabase
            .from('spools')
            .insert(spool)
            .select()
            .single()

        if (error) throw error
        return data as Spool
    },

    // Ürün alt kalemi güncelle
    async update(id: string, updates: SpoolUpdate) {
        const { data, error } = await supabase
            .from('spools')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Spool
    },

    // Ürün alt kalemi sil
    async delete(id: string) {
        // Soft delete
        const { error } = await supabase
            .from('spools')
            .update({ deleted_at: new Date().toISOString() } as any)
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Ürün alt kalemi detayını getir
    async findById(id: string) {
        const { data, error } = await supabase
            .from('spools')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single()

        if (error) return null
        return data as Spool
    }
}
