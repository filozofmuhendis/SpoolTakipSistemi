import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type QualityCheck = Tables<'quality_checks'> & {
  spoolName?: string
  workOrderNumber?: string
  inspectorName?: string
}

export type QualityCheckInsert = TablesInsert<'quality_checks'>
export type QualityCheckUpdate = TablesUpdate<'quality_checks'>

export const qualityCheckService = {
  // Tüm kalite kontrollerini getir
  async getAllQualityChecks() {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        profiles:inspector_id(full_name)
      `)
      .order('check_date', { ascending: false })

    if (error) throw error

    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.profiles?.full_name
    })) as QualityCheck[]
  },

  // ID'ye göre kalite kontrol getir
  async getQualityCheckById(id: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
          *,
          spools:spool_id(name),
          work_orders:work_order_id(number),
          profiles:inspector_id(full_name)
        `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      ...data,
      spoolName: data.spools?.name,
      workOrderNumber: data.work_orders?.number,
      inspectorName: data.profiles?.full_name
    } as QualityCheck
  },

  // Ürün alt kalemi ID'sine göre kalite kontrollerini getir
  async getQualityChecksBySpoolId(spoolId: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
          *,
          spools:spool_id(name),
          work_orders:work_order_id(number),
          profiles:inspector_id(full_name)
        `)
      .eq('spool_id', spoolId)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.profiles?.full_name
    })) as QualityCheck[]
  },

  // İş emri ID'sine göre kalite kontrollerini getir
  async getQualityChecksByWorkOrderId(workOrderId: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        profiles:inspector_id(full_name)
      `)
      .eq('work_order_id', workOrderId)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.profiles?.full_name
    })) as QualityCheck[]
  },

  // Yeni kalite kontrol oluştur
  async createQualityCheck(qualityCheck: QualityCheckInsert) {
    const { data, error } = await supabase
      .from('quality_checks')
      .insert(qualityCheck)
      .select()
      .single()

    if (error) throw error
    return data as QualityCheck
  },

  // Kalite kontrol güncelle
  async updateQualityCheck(id: string, updates: QualityCheckUpdate) {
    const { data, error } = await supabase
      .from('quality_checks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as QualityCheck
  },

  // Kalite kontrol sil
  async deleteQualityCheck(id: string) {
    const { error } = await supabase
      .from('quality_checks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Duruma göre kalite kontrollerini getir
  async getQualityChecksByStatus(status: 'pending' | 'passed' | 'failed' | 'conditional') {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        profiles:inspector_id(full_name)
      `)
      .eq('status', status)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.profiles?.full_name
    })) as QualityCheck[]
  },

  // Müfettişe göre kalite kontrollerini getir
  async getQualityChecksByInspector(inspectorId: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        profiles:inspector_id(full_name)
      `)
      .eq('inspector_id', inspectorId)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.profiles?.full_name
    })) as QualityCheck[]
  },

  // Tarih aralığına göre kalite kontrollerini getir
  async getQualityChecksByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        profiles:inspector_id(full_name)
      `)
      .gte('check_date', startDate)
      .lte('check_date', endDate)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.profiles?.full_name
    })) as QualityCheck[]
  },

  // Kalite kontrol geçir
  async passQualityCheck(id: string, notes?: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .update({
        status: 'passed',
        notes: notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as QualityCheck
  },

  // Kalite kontrol başarısız
  async failQualityCheck(id: string, defectsFound: string, correctiveActions?: string, nextCheckDate?: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .update({
        status: 'failed',
        defects_found: defectsFound,
        corrective_actions: correctiveActions,
        next_check_date: nextCheckDate
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as QualityCheck
  },

  // Koşullu geçer
  async conditionalPassQualityCheck(id: string, notes: string, nextCheckDate: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .update({
        status: 'conditional',
        notes: notes,
        next_check_date: nextCheckDate
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as QualityCheck
  },

  // Ürün alt kalemi için son kalite kontrol durumunu getir
  async getLastQualityCheckForSpool(spoolId: string) {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        profiles:inspector_id(full_name)
      `)
      .eq('spool_id', spoolId)
      .order('check_date', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data ? {
      ...data,
      spoolName: data.spools?.name,
      workOrderNumber: data.work_orders?.number,
      inspectorName: data.profiles?.full_name
    } as QualityCheck : null
  },

  // Kalite kontrol istatistikleri
  async getQualityCheckStats() {
    const { data, error } = await supabase
      .from('quality_checks')
      .select('status')

    if (error) throw error

    const total = data?.length || 0
    const passed = data?.filter(item => item.status === 'passed').length || 0
    const failed = data?.filter(item => item.status === 'failed').length || 0
    const conditional = data?.filter(item => item.status === 'conditional').length || 0
    const pending = data?.filter(item => item.status === 'pending').length || 0

    return {
      total,
      passed,
      failed,
      conditional,
      pending,
      passRate: total > 0 ? ((passed + conditional) / total) * 100 : 0
    }
  }
}