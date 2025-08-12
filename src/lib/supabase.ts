import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Server-side only - client-side'da undefined olacak
const supabaseServiceRoleKey = typeof window === 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (only use on server)
export const supabaseAdmin = supabaseServiceRoleKey ? createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name?: string
          email: string
          phone?: string
          department?: string
          position?: string
          avatar_url?: string
          hire_date?: string
          status?: string
          salary?: number
          emergency_contact?: string
          emergency_phone?: string
          address?: string
          is_active?: boolean
          last_login?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          full_name?: string
          email: string
          phone?: string
          department?: string
          position?: string
          avatar_url?: string
          hire_date?: string
          status?: string
          salary?: number
          emergency_contact?: string
          emergency_phone?: string
          address?: string
          is_active?: boolean
          last_login?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          department?: string
          position?: string
          avatar_url?: string
          hire_date?: string
          status?: string
          salary?: number
          emergency_contact?: string
          emergency_phone?: string
          address?: string
          is_active?: boolean
          last_login?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          shipyard?: string
          ship?: string
          start_date?: string
          delivery_date?: string
          created_by?: string
          manager_id?: string
          client_name?: string
          description?: string
          end_date?: string
          status?: string
          priority?: string
          project_code?: string
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          shipyard?: string
          ship?: string
          start_date?: string
          delivery_date?: string
          created_by?: string
          manager_id?: string
          client_name?: string
          description?: string
          end_date?: string
          status?: string
          priority?: string
          project_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          shipyard?: string
          ship?: string
          start_date?: string
          delivery_date?: string
          created_by?: string
          manager_id?: string
          client_name?: string
          description?: string
          end_date?: string
          status?: string
          priority?: string
          project_code?: string
          created_at?: string
        }
      }
      spools: {
        Row: {
          id: string
          project_id?: string
          name?: string
          material?: string
          diameter?: number
          thickness?: number
          length?: number
          weight?: number
          status?: string
          notes?: string
          created_by?: string
          created_at?: string
        }
        Insert: {
          id?: string
          project_id?: string
          name?: string
          material?: string
          diameter?: number
          thickness?: number
          length?: number
          weight?: number
          status?: string
          notes?: string
          created_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          material?: string
          diameter?: number
          thickness?: number
          length?: number
          weight?: number
          status?: string
          notes?: string
          created_by?: string
          created_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          project_id?: string
          spool_id?: string
          description?: string
          status?: string
          planned_start_date?: string
          planned_end_date?: string
          actual_start_date?: string
          actual_end_date?: string
          created_by?: string
          created_at?: string
        }
        Insert: {
          id?: string
          project_id?: string
          spool_id?: string
          description?: string
          status?: string
          planned_start_date?: string
          planned_end_date?: string
          actual_start_date?: string
          actual_end_date?: string
          created_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          spool_id?: string
          description?: string
          status?: string
          planned_start_date?: string
          planned_end_date?: string
          actual_start_date?: string
          actual_end_date?: string
          created_by?: string
          created_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          project_id?: string
          shipment_date?: string
          status?: string
          notes?: string
          created_by?: string
          created_at?: string
        }
        Insert: {
          id?: string
          project_id?: string
          shipment_date?: string
          status?: string
          notes?: string
          created_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          shipment_date?: string
          status?: string
          notes?: string
          created_by?: string
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          name: string
          code?: string
          category?: string
          type?: string
          quantity: number
          unit?: string
          min_stock?: number
          max_stock?: number
          location: string
          supplier?: string
          project_id?: string
          description?: string
          specifications?: string
          cost?: number
          status?: string
          last_updated?: string
          reorder_point?: number
          lead_time_days?: number
          created_at?: string
          updated_at?: string
          notes?: string
          created_by?: string
        }
        Insert: {
          id?: string
          name: string
          code?: string
          category?: string
          type?: string
          quantity: number
          unit?: string
          min_stock?: number
          max_stock?: number
          location: string
          supplier?: string
          project_id?: string
          description?: string
          specifications?: string
          cost?: number
          status?: string
          last_updated?: string
          reorder_point?: number
          lead_time_days?: number
          created_at?: string
          updated_at?: string
          notes?: string
          created_by?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          category?: string
          type?: string
          quantity?: number
          unit?: string
          min_stock?: number
          max_stock?: number
          location?: string
          supplier?: string
          project_id?: string
          description?: string
          specifications?: string
          cost?: number
          status?: string
          last_updated?: string
          reorder_point?: number
          lead_time_days?: number
          created_at?: string
          updated_at?: string
          notes?: string
          created_by?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id?: string
          name?: string
          url?: string
          uploaded_by?: string
          uploaded_at?: string
          notes?: string
        }
        Insert: {
          id?: string
          project_id?: string
          name?: string
          url?: string
          uploaded_by?: string
          uploaded_at?: string
          notes?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          url?: string
          uploaded_by?: string
          uploaded_at?: string
          notes?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']