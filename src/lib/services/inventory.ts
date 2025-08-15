import { supabase } from '../supabase'
import { Inventory } from '@/types'

export const inventoryService = {
  // Tüm envanterleri getir
  async getAllInventory() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, description, quantity, unit, location, status, notes, created_by')
        .order('name', { ascending: true })
      if (error) return [];
      if (!data || data.length === 0) return [];
      return data;
    } catch (error) {
      return [];
    }
  },

  // Envanter oluştur
  async createInventory(inventory: Omit<Inventory, 'id'>) {
    // Varsayılan değerlerle birlikte envanter verisi hazırla
    const inventoryData = {
      name: inventory.name,
      code: inventory.code || `INV-${Date.now()}`, // Otomatik kod oluştur
      category: inventory.category || 'general',
      type: inventory.type || 'raw_material',
      quantity: inventory.quantity || 0,
      unit: inventory.unit || 'adet',
      min_stock: inventory.min_stock || 0,
      max_stock: inventory.max_stock || 100,
      location: inventory.location,
      supplier: inventory.supplier || 'Belirtilmemiş',
      project_id: inventory.project_id || null,
      description: inventory.description || null,
      specifications: inventory.specifications || null,
      cost: inventory.cost || 0,
      status: inventory.status || 'active',
      reorder_point: inventory.reorder_point || null,
      lead_time_days: inventory.lead_time_days || null
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select('id, name, description, quantity, unit, location, status')
      .single()
    if (error) throw new Error(`Envanter oluşturulamadı: ${error.message}`)
    return data;
  },

  // Envanter güncelle
  async updateInventory(id: string, updates: Partial<Inventory>) {
    const updateData: any = { ...updates };
    const { data, error } = await supabase
       .from('inventory')
       .update(updateData)
       .eq('id', id)
       .select('id, name, description, quantity, unit, location, status')
       .single()
    if (error) throw new Error(`Envanter güncellenemedi: ${error.message}`)
    return data;
  },

  // Envanter sil
  async deleteInventory(id: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Envanter silinemedi: ${error.message}`)
    return true;
  },

  // Envanter detayını getir
  async getInventoryById(id: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, name, description, quantity, unit, location, status, notes, created_by')
      .eq('id', id)
      .single()
    if (error) return null;
    return data;
  },

  // Düşük stoklu ürünleri getir
  async getLowStockItems() {
    try {
      const { data, error } = await supabase
        .from('public.inventory')
        .select('id, name, description, quantity, unit, location, status, notes, created_by')
        .lt('quantity', 10) // 10'dan az stok
        .order('quantity', { ascending: true })
      if (error) return [];
      return data || [];
    } catch (error) {
      return [];
    }
  },

  // Kategoriye göre envanter getir
  async getInventoryByCategory(category: string) {
    try {
      const { data, error } = await supabase
      .from('inventory')
      .select('id, name, description, quantity, unit, location, status, notes, created_by')
      .gte('quantity', 1)
      .order('name', { ascending: true })
      if (error) return [];
      return data || [];
    } catch (error) {
      return [];
    }
  },

  // Envanter arama
  async searchInventory(search: string) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, description, quantity, unit, location, status, notes, created_by')
        .or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        .order('name', { ascending: true })
      if (error) return [];
      return data || [];
    } catch (error) {
      return [];
    }
  }
}