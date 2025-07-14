import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Key mevcut' : 'Key eksik')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - Güncellenmiş ve genişletilmiş tip tanımları
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          department: string | null
          position: 'admin' | 'manager' | 'user'
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          department?: string | null
          position?: 'admin' | 'manager' | 'user'
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          department?: string | null
          position?: 'admin' | 'manager' | 'user'
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'active' | 'completed' | 'cancelled' | 'pending'
          start_date: string
          end_date: string | null
          manager_id: string | null
          budget: number | null
          location: string | null
          client_name: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'active' | 'completed' | 'cancelled' | 'pending'
          start_date: string
          end_date?: string | null
          manager_id?: string | null
          budget?: number | null
          location?: string | null
          client_name?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'completed' | 'cancelled' | 'pending'
          start_date?: string
          end_date?: string | null
          manager_id?: string | null
          budget?: number | null
          location?: string | null
          client_name?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
      }
      personnel: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          department: string
          position: string
          hire_date: string
          status: 'active' | 'inactive' | 'terminated' | 'on_leave'
          salary: number | null
          emergency_contact: string | null
          emergency_phone: string | null
          address: string | null
          skills: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          department: string
          position: string
          hire_date?: string
          status?: 'active' | 'inactive' | 'terminated' | 'on_leave'
          salary?: number | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          address?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          department?: string
          position?: string
          hire_date?: string
          status?: 'active' | 'inactive' | 'terminated' | 'on_leave'
          salary?: number | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          address?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      spools: {
        Row: {
          id: string
          name: string
          description: string | null
          project_id: string
          assigned_to: string | null
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          quantity: number
          completed_quantity: number
          start_date: string | null
          end_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          material_type: string | null
          dimensions: string | null
          weight: number | null
          specifications: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          project_id: string
          assigned_to?: string | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          quantity?: number
          completed_quantity?: number
          start_date?: string | null
          end_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          material_type?: string | null
          dimensions?: string | null
          weight?: number | null
          specifications?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          project_id?: string
          assigned_to?: string | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          quantity?: number
          completed_quantity?: number
          start_date?: string | null
          end_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          material_type?: string | null
          dimensions?: string | null
          weight?: number | null
          specifications?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          number: string
          title: string
          description: string | null
          project_id: string
          spool_id: string | null
          assigned_to: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string | null
          due_date: string | null
          completed_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          materials_used: string | null
          quality_check: boolean
          quality_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          title: string
          description?: string | null
          project_id: string
          spool_id?: string | null
          assigned_to: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          due_date?: string | null
          completed_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          materials_used?: string | null
          quality_check?: boolean
          quality_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          title?: string
          description?: string | null
          project_id?: string
          spool_id?: string | null
          assigned_to?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          due_date?: string | null
          completed_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          materials_used?: string | null
          quality_check?: boolean
          quality_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          number: string
          project_id: string
          destination: string
          carrier: string | null
          status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          scheduled_date: string
          actual_date: string | null
          total_weight: number | null
          tracking_number: string | null
          shipping_cost: number | null
          insurance_amount: number | null
          customs_info: string | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          project_id: string
          destination: string
          carrier?: string | null
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          scheduled_date: string
          actual_date?: string | null
          total_weight?: number | null
          tracking_number?: string | null
          shipping_cost?: number | null
          insurance_amount?: number | null
          customs_info?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          project_id?: string
          destination?: string
          carrier?: string | null
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          scheduled_date?: string
          actual_date?: string | null
          total_weight?: number | null
          tracking_number?: string | null
          shipping_cost?: number | null
          insurance_amount?: number | null
          customs_info?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          name: string
          code: string
          category: string
          type: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
          quantity: number
          unit: string
          min_stock: number
          max_stock: number
          location: string
          supplier: string
          project_id: string | null
          description: string | null
          specifications: string | null
          cost: number
          status: 'active' | 'inactive' | 'discontinued'
          last_updated: string
          reorder_point: number | null
          lead_time_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          category: string
          type: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
          quantity?: number
          unit: string
          min_stock?: number
          max_stock?: number
          location: string
          supplier: string
          project_id?: string | null
          description?: string | null
          specifications?: string | null
          cost?: number
          status?: 'active' | 'inactive' | 'discontinued'
          last_updated?: string
          reorder_point?: number | null
          lead_time_days?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          category?: string
          type?: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
          quantity?: number
          unit?: string
          min_stock?: number
          max_stock?: number
          location?: string
          supplier?: string
          project_id?: string | null
          description?: string | null
          specifications?: string | null
          cost?: number
          status?: 'active' | 'inactive' | 'discontinued'
          last_updated?: string
          reorder_point?: number | null
          lead_time_days?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          inventory_id: string
          transaction_type: 'in' | 'out' | 'adjustment' | 'transfer'
          quantity: number
          unit_cost: number | null
          total_cost: number | null
          reference_type: 'purchase' | 'production' | 'shipment' | 'adjustment' | null
          reference_id: string | null
          notes: string | null
          performed_by: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          inventory_id: string
          transaction_type: 'in' | 'out' | 'adjustment' | 'transfer'
          quantity: number
          unit_cost?: number | null
          total_cost?: number | null
          reference_type?: 'purchase' | 'production' | 'shipment' | 'adjustment' | null
          reference_id?: string | null
          notes?: string | null
          performed_by?: string | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          inventory_id?: string
          transaction_type?: 'in' | 'out' | 'adjustment' | 'transfer'
          quantity?: number
          unit_cost?: number | null
          total_cost?: number | null
          reference_type?: 'purchase' | 'production' | 'shipment' | 'adjustment' | null
          reference_id?: string | null
          notes?: string | null
          performed_by?: string | null
          transaction_date?: string
          created_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          name: string
          url: string
          size: number
          type: string
          uploaded_at: string
          uploaded_by: string
          entity_type: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
          entity_id: string
          description: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          size: number
          type: string
          uploaded_at?: string
          uploaded_by: string
          entity_type: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
          entity_id: string
          description?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          size?: number
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          entity_type?: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
          entity_id?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          user_id: string
          entity_type: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory' | null
          entity_id: string | null
          read: boolean
          action_url: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          user_id: string
          entity_type?: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory' | null
          entity_id?: string | null
          read?: boolean
          action_url?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          user_id?: string
          entity_type?: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory' | null
          entity_id?: string | null
          read?: boolean
          action_url?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          expires_at?: string | null
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          spool_updates: boolean
          project_updates: boolean
          personnel_updates: boolean
          work_order_updates: boolean
          shipment_updates: boolean
          inventory_alerts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          spool_updates?: boolean
          project_updates?: boolean
          personnel_updates?: boolean
          work_order_updates?: boolean
          shipment_updates?: boolean
          inventory_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          spool_updates?: boolean
          project_updates?: boolean
          personnel_updates?: boolean
          work_order_updates?: boolean
          shipment_updates?: boolean
          inventory_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string | null
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          user_id: string | null
          old_data: any | null
          new_data: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id?: string | null
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          user_id?: string | null
          old_data?: any | null
          new_data?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string | null
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          user_id?: string | null
          old_data?: any | null
          new_data?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          name: string
          type: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
          parameters: any | null
          generated_by: string
          file_url: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
          parameters?: any | null
          generated_by: string
          file_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
          parameters?: any | null
          generated_by?: string
          file_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
        }
      }
      work_hours: {
        Row: {
          id: string
          personnel_id: string
          project_id: string
          spool_id: string | null
          work_order_id: string | null
          start_time: string
          end_time: string | null
          hours_worked: number | null
          description: string | null
          is_overtime: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          personnel_id: string
          project_id: string
          spool_id?: string | null
          work_order_id?: string | null
          start_time: string
          end_time?: string | null
          hours_worked?: number | null
          description?: string | null
          is_overtime?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          personnel_id?: string
          project_id?: string
          spool_id?: string | null
          work_order_id?: string | null
          start_time?: string
          end_time?: string | null
          hours_worked?: number | null
          description?: string | null
          is_overtime?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      material_requests: {
        Row: {
          id: string
          request_number: string
          project_id: string
          spool_id: string | null
          requested_by: string
          status: 'pending' | 'approved' | 'rejected' | 'fulfilled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          requested_date: string
          needed_by_date: string | null
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_number: string
          project_id: string
          spool_id?: string | null
          requested_by: string
          status?: 'pending' | 'approved' | 'rejected' | 'fulfilled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          requested_date: string
          needed_by_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_number?: string
          project_id?: string
          spool_id?: string | null
          requested_by?: string
          status?: 'pending' | 'approved' | 'rejected' | 'fulfilled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          requested_date?: string
          needed_by_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      material_request_items: {
        Row: {
          id: string
          request_id: string
          inventory_id: string
          quantity_requested: number
          quantity_approved: number | null
          quantity_issued: number | null
          unit_cost: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          inventory_id: string
          quantity_requested: number
          quantity_approved?: number | null
          quantity_issued?: number | null
          unit_cost?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          inventory_id?: string
          quantity_requested?: number
          quantity_approved?: number | null
          quantity_issued?: number | null
          unit_cost?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      quality_checks: {
        Row: {
          id: string
          spool_id: string
          work_order_id: string | null
          inspector_id: string
          check_date: string
          status: 'pending' | 'passed' | 'failed' | 'conditional'
          notes: string | null
          defects_found: string | null
          corrective_actions: string | null
          next_check_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          spool_id: string
          work_order_id?: string | null
          inspector_id: string
          check_date: string
          status?: 'pending' | 'passed' | 'failed' | 'conditional'
          notes?: string | null
          defects_found?: string | null
          corrective_actions?: string | null
          next_check_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          spool_id?: string
          work_order_id?: string | null
          inspector_id?: string
          check_date?: string
          status?: 'pending' | 'passed' | 'failed' | 'conditional'
          notes?: string | null
          defects_found?: string | null
          corrective_actions?: string | null
          next_check_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          code: string
          type: string
          model: string | null
          manufacturer: string | null
          serial_number: string | null
          location: string | null
          status: 'active' | 'maintenance' | 'inactive' | 'retired'
          purchase_date: string | null
          warranty_expiry: string | null
          last_maintenance: string | null
          next_maintenance: string | null
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          type: string
          model?: string | null
          manufacturer?: string | null
          serial_number?: string | null
          location?: string | null
          status?: 'active' | 'maintenance' | 'inactive' | 'retired'
          purchase_date?: string | null
          warranty_expiry?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          type?: string
          model?: string | null
          manufacturer?: string | null
          serial_number?: string | null
          location?: string | null
          status?: 'active' | 'maintenance' | 'inactive' | 'retired'
          purchase_date?: string | null
          warranty_expiry?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      spool_progress: {
        Row: {
          id: string
          name: string
          project_id: string
          project_name: string | null
          status: string
          quantity: number
          completed_quantity: number
          progress_percentage: number | null
          start_date: string | null
          end_date: string | null
          assigned_to_name: string | null
        }
      }
      inventory_summary: {
        Row: {
          id: string
          name: string
          code: string
          category: string
          type: string
          quantity: number
          unit: string
          min_stock: number
          max_stock: number
          cost: number
          total_value: number | null
          stock_status: string | null
          location: string
          supplier: string
          project_name: string | null
        }
      }
      work_order_summary: {
        Row: {
          id: string
          number: string
          title: string
          project_id: string
          project_name: string | null
          status: string
          priority: string
          start_date: string | null
          due_date: string | null
          completed_date: string | null
          assigned_to_name: string | null
          spool_name: string | null
          estimated_hours: number | null
          actual_hours: number | null
        }
      }
      personnel_workload: {
        Row: {
          id: string
          name: string
          department: string
          position: string
          assigned_spools: number | null
          assigned_work_orders: number | null
          total_hours_worked: number | null
          avg_hours_per_day: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
