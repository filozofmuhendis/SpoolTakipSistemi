import { supabase } from '../supabase'

export interface AuditLog {
  id: string
  table_name: string
  record_id: string | null
  action: string
  user_id: string | null
  old_data: any
  new_data: any
  created_at: string
}

export async function getAuditLogs({
  tableName,
  userId,
  action,
  limit = 50,
  from,
  to
}: {
  tableName?: string
  userId?: string
  action?: string
  limit?: number
  from?: string
  to?: string
} = {}): Promise<AuditLog[]> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tableName) query = query.eq('table_name', tableName)
  if (userId) query = query.eq('user_id', userId)
  if (action) query = query.eq('action', action)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as AuditLog[]
} 
