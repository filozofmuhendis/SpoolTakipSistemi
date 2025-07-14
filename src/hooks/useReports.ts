import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

export type ReportType = 'production' | 'personnel' | 'shipment' | 'material'

export function useReports() {
  const getReport = async (type: ReportType, startDate: Date, endDate: Date) => {
    let query;
    
    switch(type) {
      case 'production':
        query = supabase
          .from('productions')
          .select(`
            *,
            project:projects(name),
            spool:spools(code),
            personnel:profiles(name)
          `)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
        break;

      case 'personnel':
        query = supabase
          .from('work_hours')
          .select(`
            *,
            personnel:profiles(name),
            project:projects(name)
          `)
          .gte('start_time', startDate.toISOString())
          .lte('end_time', endDate.toISOString());
        break;

      case 'shipment':
        query = supabase
          .from('shipments')
          .select(`
            *,
            project:projects(name)
          `)
          .gte('shipment_date', startDate.toISOString())
          .lte('shipment_date', endDate.toISOString());
        break;

      case 'material':
        query = supabase
          .from('material_entries')
          .select(`
            *,
            material:materials(name),
            project:projects(name)
          `)
          .gte('entry_date', startDate.toISOString())
          .lte('entry_date', endDate.toISOString());
        break;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  const exportToExcel = (data: any[], type: ReportType) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
    XLSX.writeFile(workbook, `${type}_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }

  return {
    getReport,
    exportToExcel
  }
}
