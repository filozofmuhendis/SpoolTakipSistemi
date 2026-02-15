import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Inventory = Tables<'inventory'> & {
  project_name?: string
}

export type InventoryInsert = TablesInsert<'inventory'>
export type InventoryUpdate = TablesUpdate<'inventory'>

export const inventoryService = {
  // Tüm envanterleri getir
  async getAllInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects:project_id(name)
      `)
      .order('name', { ascending: true })

    if (error) throw error

    return data?.map(item => ({
      ...item,
      project_name: item.projects?.name
    })) as Inventory[]
  },

  // Envanter oluştur
  async createInventory(inventory: InventoryInsert) {
    // Varsayılan değerlerle birlikte envanter verisi hazırla
    const inventoryData = {
      ...inventory,
      code: inventory.code || `INV-${Date.now()}`, // Otomatik kod oluştur
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()
      .single()

    if (error) throw error
    return data as Inventory
  },

  // Envanter güncelle
  async updateInventory(id: string, updates: InventoryUpdate) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Inventory
  },

  // Envanter sil
  async deleteInventory(id: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Envanter detayını getir
  async getInventoryById(id: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects:project_id(name)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return {
      ...data,
      project_name: data.projects?.name
    } as Inventory
  },

  // Düşük stoklu ürünleri getir
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lt('quantity', 10) // 10'dan az stok
      .order('quantity', { ascending: true })

    if (error) throw error
    return data as Inventory[]
  },

  // Kategoriye göre envanter getir
  async getInventoryByCategory(category: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true })

    if (error) throw error
    return data as Inventory[]
  },

  // Envanter arama
  async searchInventory(search: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data as Inventory[]
  }
}