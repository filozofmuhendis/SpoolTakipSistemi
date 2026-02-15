import { supabase } from '@/lib/supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type JobOrder = Tables<'work_orders'>
export type JobOrderInsert = TablesInsert<'work_orders'>
export type JobOrderUpdate = TablesUpdate<'work_orders'>

export const workOrderRepository = {
    // Tüm iş emirlerini getir
    async findAll() {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .is('deleted_at', null)
            .order('start_date', { ascending: false })

        if (error) throw error
        return data as JobOrder[]
    },

    async create(workOrder: JobOrderInsert) {
        const { data, error } = await supabase
            .from('work_orders')
            .insert(workOrder)
            .select()
            .single()

        if (error) throw error
        return data as JobOrder
    },

    async update(id: string, updates: JobOrderUpdate) {
        const { data, error } = await supabase
            .from('work_orders')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as JobOrder
    },

    async delete(id: string) {
        // Soft delete
        const { error } = await supabase
            .from('work_orders')
            .update({ deleted_at: new Date().toISOString() } as any)
            .eq('id', id)

        if (error) throw error
        return true
    },

    async findById(id: string) {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single()

        if (error) return null
        return data as JobOrder
    }
}
