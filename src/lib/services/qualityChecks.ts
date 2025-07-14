import { supabase } from '../supabase'
import { QualityCheck } from '@/types'

export const qualityCheckService = {
  // Tüm kalite kontrollerini getir
  async getAllQualityChecks(): Promise<QualityCheck[]> {
    try {
      const { data, error } = await supabase
        .from('quality_checks')
        .select(`
          *,
          spools:spool_id(name),
          work_orders:work_order_id(number),
          personnel:inspector_id(name)
        `)
        .order('check_date', { ascending: false })

      if (error) {
        console.error('Kalite kontrol listesi alma hatası:', error)
        throw new Error(`Kalite kontrol listesi alınamadı: ${error.message}`)
      }

      return data?.map(item => ({
        ...item,
        spoolName: item.spools?.name,
        workOrderNumber: item.work_orders?.number,
        inspectorName: item.personnel?.name
      })) || []
    } catch (error) {
      console.error('Kalite kontrol listesi alma hatası:', error)
      throw error
    }
  },

  // ID'ye göre kalite kontrol getir
  async getQualityCheckById(id: string): Promise<QualityCheck | null> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? {
      ...data,
      spoolName: data.spools?.name,
      workOrderNumber: data.work_orders?.number,
      inspectorName: data.personnel?.name
    } : null
  },

      // Ürün alt kalemi ID'sine göre kalite kontrollerini getir
    async getQualityChecksBySpoolId(spoolId: string): Promise<QualityCheck[]> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
      `)
      .eq('spool_id', spoolId)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.personnel?.name
    })) || []
  },

  // İş emri ID'sine göre kalite kontrollerini getir
  async getQualityChecksByWorkOrderId(workOrderId: string): Promise<QualityCheck[]> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
      `)
      .eq('work_order_id', workOrderId)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.personnel?.name
    })) || []
  },

  // Yeni kalite kontrol oluştur
  async createQualityCheck(qualityCheck: Omit<QualityCheck, 'id' | 'createdAt' | 'updatedAt' | 'spoolName' | 'workOrderNumber' | 'inspectorName'>): Promise<QualityCheck> {
    const { data, error } = await supabase
      .from('quality_checks')
      .insert({
        urun_alt_kalemi_id: qualityCheck.urun_alt_kalemi_id,
        work_order_id: qualityCheck.work_order_id,
        inspector_id: qualityCheck.inspector_id,
        check_date: qualityCheck.check_date,
        status: qualityCheck.status,
        notes: qualityCheck.notes,
        measurements: qualityCheck.measurements,
        photos: qualityCheck.photos,
        next_check_date: qualityCheck.next_check_date
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Kalite kontrol güncelle
  async updateQualityCheck(id: string, updates: Partial<QualityCheck>): Promise<QualityCheck> {
    const { data, error } = await supabase
      .from('quality_checks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Kalite kontrol sil
  async deleteQualityCheck(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_checks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Duruma göre kalite kontrollerini getir
  async getQualityChecksByStatus(status: 'pending' | 'passed' | 'failed' | 'conditional'): Promise<QualityCheck[]> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
      `)
      .eq('status', status)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.personnel?.name
    })) || []
  },

  // Müfettişe göre kalite kontrollerini getir
  async getQualityChecksByInspector(inspectorId: string): Promise<QualityCheck[]> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
      `)
      .eq('inspector_id', inspectorId)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.personnel?.name
    })) || []
  },

  // Tarih aralığına göre kalite kontrollerini getir
  async getQualityChecksByDateRange(startDate: string, endDate: string): Promise<QualityCheck[]> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
      `)
      .gte('check_date', startDate)
      .lte('check_date', endDate)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      ...item,
      spoolName: item.spools?.name,
      workOrderNumber: item.work_orders?.number,
      inspectorName: item.personnel?.name
    })) || []
  },

  // Kalite kontrol geçir
  async passQualityCheck(id: string, notes?: string): Promise<QualityCheck> {
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
    return data
  },

  // Kalite kontrol başarısız
  async failQualityCheck(id: string, defectsFound: string, correctiveActions?: string, nextCheckDate?: string): Promise<QualityCheck> {
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
    return data
  },

  // Koşullu geçer
  async conditionalPassQualityCheck(id: string, notes: string, nextCheckDate: string): Promise<QualityCheck> {
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
    return data
  },

      // Ürün alt kalemi için son kalite kontrol durumunu getir
    async getLastQualityCheckForSpool(spoolId: string): Promise<QualityCheck | null> {
    const { data, error } = await supabase
      .from('quality_checks')
      .select(`
        *,
        spools:spool_id(name),
        work_orders:work_order_id(number),
        personnel:inspector_id(name)
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
      inspectorName: data.personnel?.name
    } : null
  },

  // Kalite kontrol istatistikleri
  async getQualityCheckStats(): Promise<{
    total: number
    passed: number
    failed: number
    conditional: number
    pending: number
    passRate: number
  }> {
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