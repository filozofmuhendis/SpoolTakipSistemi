import { supabase } from '../supabase'
import { InventoryTransaction } from '@/types'

export const inventoryTransactionService = {
  // Tüm envanter işlemlerini getir
  async getAllTransactions(): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(name),
        profiles:performed_by(full_name)
      `)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      inventoryName: item.inventory?.name,
      performedByName: item.profiles?.full_name
    })) || []
  },

  // ID'ye göre işlem getir
  async getTransactionById(id: string): Promise<InventoryTransaction | null> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(name),
        profiles:performed_by(full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? {
      ...data,
      inventoryName: data.inventory?.name,
      performedByName: data.profiles?.full_name
    } : null
  },

  // Envanter ID'sine göre işlemleri getir
  async getTransactionsByInventoryId(inventoryId: string): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(name),
        profiles:performed_by(full_name)
      `)
      .eq('inventory_id', inventoryId)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      inventoryName: item.inventory?.name,
      performedByName: item.profiles?.full_name
    })) || []
  },

  // Yeni işlem oluştur
  async createTransaction(transaction: Omit<InventoryTransaction, 'id' | 'createdAt' | 'inventoryName' | 'performedByName'>): Promise<InventoryTransaction> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: transaction.inventory_id,
        transaction_type: transaction.transaction_type,
        quantity: transaction.quantity,
        unit_cost: transaction.unit_cost,
        total_cost: transaction.total_cost,
        reference_type: transaction.reference_type,
        reference_id: transaction.reference_id,
        notes: transaction.notes,
        performed_by: transaction.performed_by,
        transaction_date: transaction.transaction_date
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // İşlem güncelle
  async updateTransaction(id: string, updates: Partial<InventoryTransaction>): Promise<InventoryTransaction> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // İşlem sil
  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Tarih aralığına göre işlemleri getir
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(name),
        profiles:performed_by(full_name)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      inventoryName: item.inventory?.name,
      performedByName: item.profiles?.full_name
    })) || []
  },

  // İşlem tipine göre filtrele
  async getTransactionsByType(type: 'in' | 'out' | 'adjustment' | 'transfer'): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(name),
        profiles:performed_by(full_name)
      `)
      .eq('transaction_type', type)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      inventoryName: item.inventory?.name,
      performedByName: item.profiles?.full_name
    })) || []
  },

  // Kullanıcıya göre işlemleri getir
  async getTransactionsByUser(userId: string): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(name),
        profiles:performed_by(full_name)
      `)
      .eq('performed_by', userId)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      inventoryName: item.inventory?.name,
      performedByName: item.profiles?.full_name
    })) || []
  },

  // Envanter giriş işlemi
  async createInTransaction(inventoryId: string, quantity: number, unitCost?: number, notes?: string): Promise<InventoryTransaction> {
    const totalCost = unitCost ? quantity * unitCost : undefined
    
    return this.createTransaction({
      inventory_id: inventoryId,
      transaction_type: 'in',
      quantity,
      unit_cost: unitCost,
      total_cost: totalCost,
      reference_type: 'purchase',
      notes,
      performed_by: (await supabase.auth.getUser()).data.user?.id || '',
      transaction_date: new Date().toISOString()
    })
  },

  // Envanter çıkış işlemi
  async createOutTransaction(inventoryId: string, quantity: number, referenceType?: 'production' | 'shipment', referenceId?: string, notes?: string): Promise<InventoryTransaction> {
    return this.createTransaction({
      inventory_id: inventoryId,
      transaction_type: 'out',
      quantity,
      reference_type: referenceType,
      reference_id: referenceId,
      notes,
      performed_by: (await supabase.auth.getUser()).data.user?.id || '',
      transaction_date: new Date().toISOString()
    })
  },

  // Stok düzeltme işlemi
  async createAdjustmentTransaction(inventoryId: string, quantity: number, notes?: string): Promise<InventoryTransaction> {
    return this.createTransaction({
      inventory_id: inventoryId,
      transaction_type: 'adjustment',
      quantity,
      reference_type: 'adjustment',
      notes,
      performed_by: (await supabase.auth.getUser()).data.user?.id || '',
      transaction_date: new Date().toISOString()
    })
  }
} 