import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'manager' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'manager' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'manager' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          status: 'active' | 'completed' | 'pending'
          start_date: string
          end_date?: string
          manager_id: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'active' | 'completed' | 'pending'
          start_date: string
          end_date?: string
          manager_id: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'active' | 'completed' | 'pending'
          start_date?: string
          end_date?: string
          manager_id?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      spools: {
        Row: {
          id: string
          name: string
          project_id: string
          status: 'pending' | 'active' | 'completed'
          assigned_to?: string
          quantity: number
          completed_quantity: number
          start_date: string
          end_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          project_id: string
          status?: 'pending' | 'active' | 'completed'
          assigned_to?: string
          quantity: number
          completed_quantity?: number
          start_date: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          project_id?: string
          status?: 'pending' | 'active' | 'completed'
          assigned_to?: string
          quantity?: number
          completed_quantity?: number
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          number: string
          project_id: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to: string
          start_date: string
          due_date: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          project_id: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to: string
          start_date: string
          due_date: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          project_id?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string
          start_date?: string
          due_date?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      personnel: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          position: string
          department: string
          status: 'active' | 'inactive' | 'on_leave'
          hire_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          position: string
          department: string
          status?: 'active' | 'inactive' | 'on_leave'
          hire_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          position?: string
          department?: string
          status?: 'active' | 'inactive' | 'on_leave'
          hire_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          number: string
          project_id: string
          status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          destination: string
          scheduled_date: string
          actual_date?: string
          carrier: string
          tracking_number?: string
          total_weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          project_id: string
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          destination: string
          scheduled_date: string
          actual_date?: string
          carrier: string
          tracking_number?: string
          total_weight: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          project_id?: string
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          destination?: string
          scheduled_date?: string
          actual_date?: string
          carrier?: string
          tracking_number?: string
          total_weight?: number
          created_at?: string
          updated_at?: string
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