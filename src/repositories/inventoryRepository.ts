import { supabase } from '@/lib/supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Inventory = Tables<'inventory'> & {
    project_name?: string
}

export type InventoryInsert = TablesInsert<'inventory'>
export type InventoryUpdate = TablesUpdate<'inventory'>

export const inventoryRepository = {
    // Tüm envanterleri getir
    async findAll() {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
        *,
        projects:project_id(name)
      `)
            .is('deleted_at', null) // Added soft delete filter
            .order('created_at', { ascending: false }) // Changed order

        if (error) throw error

        return data?.map(item => ({
            ...item,
            project_name: item.projects?.name
        })) as Inventory[]
    },

    // Envanter oluştur
    async create(inventory: InventoryInsert) {
        const { data, error } = await supabase
            .from('inventory')
            .insert(inventory)
            .select()
            .single()

        if (error) throw error
        return data as Inventory
    },

    // Envanter güncelle
    async update(id: string, updates: InventoryUpdate) {
        const { data, error } = await supabase
            .from('inventory')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Inventory
    },

    // Envanter sil (Soft delete)
    async delete(id: string) {
        const { error } = await supabase
            .from('inventory')
            .update({ deleted_at: new Date().toISOString() } as any) // Soft delete implementation
            .eq('id', id)

        if (error) throw error
        return true
    },

    // Envanter detayını getir
    async findById(id: string) {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
        *,
        projects:project_id(name)
      `)
            .eq('id', id)
            .is('deleted_at', null) // Added soft delete filter
            .single()

        if (error) return null
        return {
            ...data,
            project_name: data.projects?.name
        } as Inventory
    },

    // Düşük stoklu ürünleri getir
    async findLowStock() {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .lt('quantity', 10) // 10'dan az stok (Should ideally be compared to min_stock col but logic was hardcoded 10)
            .order('quantity', { ascending: true })

        if (error) throw error
        return data as Inventory[]
    },

    // Kategoriye göre envanter getir
    async findByCategory(category: string) {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('category', category)
            .order('name', { ascending: true })

        if (error) throw error
        return data as Inventory[]
    },

    // Envanter arama
    async search(search: string) {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .or(`name.ilike.%${search}%,description.ilike.%${search}%`)
            .order('name', { ascending: true })

        if (error) throw error
        return data as Inventory[]
    }
}
