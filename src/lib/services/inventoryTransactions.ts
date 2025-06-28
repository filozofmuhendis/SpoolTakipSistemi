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
        inventory_id: transaction.inventoryId,
        transaction_type: transaction.transactionType,
        quantity: transaction.quantity,
        unit_cost: transaction.unitCost,
        total_cost: transaction.totalCost,
        reference_type: transaction.referenceType,
        reference_id: transaction.referenceId,
        notes: transaction.notes,
        performed_by: transaction.performedBy,
        transaction_date: transaction.transactionDate
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
      inventoryId,
      transactionType: 'in',
      quantity,
      unitCost,
      totalCost,
      referenceType: 'purchase',
      notes,
      performedBy: (await supabase.auth.getUser()).data.user?.id || '',
      transactionDate: new Date().toISOString()
    })
  },

  // Envanter çıkış işlemi
  async createOutTransaction(inventoryId: string, quantity: number, referenceType?: 'production' | 'shipment', referenceId?: string, notes?: string): Promise<InventoryTransaction> {
    return this.createTransaction({
      inventoryId,
      transactionType: 'out',
      quantity,
      referenceType,
      referenceId,
      notes,
      performedBy: (await supabase.auth.getUser()).data.user?.id || '',
      transactionDate: new Date().toISOString()
    })
  },

  // Stok düzeltme işlemi
  async createAdjustmentTransaction(inventoryId: string, quantity: number, notes?: string): Promise<InventoryTransaction> {
    return this.createTransaction({
      inventoryId,
      transactionType: 'adjustment',
      quantity,
      referenceType: 'adjustment',
      notes,
      performedBy: (await supabase.auth.getUser()).data.user?.id || '',
      transactionDate: new Date().toISOString()
    })
  }
} 