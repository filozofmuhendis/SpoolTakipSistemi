import { supabase } from '@/lib/supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Personnel = Tables<'profiles'>
export type PersonnelInsert = TablesInsert<'profiles'>
export type PersonnelUpdate = TablesUpdate<'profiles'>

export const personnelRepository = {
    // Tüm personeli getir
    async findAll() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true })

        if (error) throw error
        return data as Personnel[]
    },

    async findActive() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('status', 'active')
            .order('full_name', { ascending: true })

        if (error) throw error
        return data as Personnel[]
    },

    async findByDepartment(department: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('department', department)
            .order('full_name', { ascending: true })

        if (error) throw error
        return data as Personnel[]
    },

    async update(id: string, updates: PersonnelUpdate) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Personnel
    },

    async findById(id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null
        return data as Personnel
    },

    async findByEmail(email: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (error) return null
        return data as Personnel
    },

    async findManagers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('position', 'manager')
            .order('full_name', { ascending: true })

        if (error) throw error
        return data as Personnel[]
    }
}
