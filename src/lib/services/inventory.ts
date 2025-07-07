import { supabase } from '../supabase'
import { Inventory } from '@/types'

export const inventoryService = {
  // Tüm envanter öğelerini getir
  async getAllInventory(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects(name)
      `)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name
    })) || []
  },

  // ID'ye göre envanter öğesi getir
  async getInventoryById(id: string): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? {
      ...data,
      projectName: data.projects?.name
    } : null
  },

  // Yeni envanter öğesi oluştur
  async createInventory(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        ...inventory,
        lastUpdated: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Envanter öğesini güncelle
  async updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...updates,
        lastUpdated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Envanter öğesini sil
  async deleteInventory(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Stok güncelleme
  async updateStock(id: string, quantity: number): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity,
        lastUpdated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Kategoriye göre filtrele
  async getInventoryByCategory(category: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects(name)
      `)
      .eq('category', category)
      .order('name')

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name
    })) || []
  },

  // Düşük stok uyarısı
  async getLowStockItems(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects(name)
      `)
      .filter('quantity', 'lte', 'minStock')
      .order('quantity')

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name
    })) || []
  },

  // Arama
  async searchInventory(query: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        projects(name)
      `)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name')

    if (error) throw error
    return data?.map(item => ({
      ...item,
      projectName: item.projects?.name
    })) || []
  }
} 