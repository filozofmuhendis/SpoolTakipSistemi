export type UserRole = 'admin' | 'manager' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Profile {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface Project {
  id: string;
  name: string;
  shipyard?: string | null;
  ship?: string | null;
  start_date?: string; // Assume required or handled
  delivery_date?: string | null;
  created_by?: string | null;
  manager_id?: string | null;
  client_name?: string | null;
  description?: string | null;
  end_date?: string | null;
  status?: string | null;
  priority?: string | null;
  project_code?: string | null;
}

export interface UrunAltKalemi {
  id: string;
  project_id?: string | null;
  name?: string | null;
  description?: string | null;
  material?: string | null;
  diameter?: number | null;
  thickness?: number | null;
  length?: number | null;
  weight?: number | null;
  status?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface JobOrder {
  id: string;
  project_id?: string | null;
  urun_alt_kalemi_id?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  created_by?: string | null;
}

export interface Shipment {
  id: string;
  project_id?: string | null;
  number?: string | null;
  destination?: string | null;
  shipment_date?: string | null;
  status?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Inventory {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  type?: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable' | null; // Allow null
  quantity: number | null;
  unit?: string | null;
  min_stock?: number | null;
  max_stock?: number | null;
  location: string | null;
  supplier?: string | null;
  project_id?: string | null;
  description?: string | null;
  specifications?: string | null;
  cost?: number | null;
  status?: 'active' | 'inactive' | 'discontinued' | null;
  last_updated?: string | null;
  reorder_point?: number | null;
  lead_time_days?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface Document {
  id: string;
  project_id?: string | null;
  name?: string | null;
  url?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  notes?: string | null;
}

export interface Personnel {
  id: string;
  full_name: string | null;
  email: string;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  hire_date?: string | null;
  status?: string | null;
  salary?: number | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  address?: string | null;
  skills?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number | null;
  total_cost?: number | null;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  performed_by?: string | null;
  transaction_date?: string | null;
  created_at?: string | null;
}

export interface MaterialRequest {
  id: string;
  request_number: string;
  project_id?: string | null;
  urun_alt_kalemi_id?: string | null;
  requested_by?: string | null;
  status?: string | null;
  priority?: string | null;
  request_date?: string | null;
  required_date?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MaterialRequestItem {
  id: string;
  request_id: string;
  inventory_id?: string | null;
  quantity: number;
  unit: string;
  notes?: string | null;
  created_at?: string | null;
}

export interface QualityCheck {
  id: string;
  urun_alt_kalemi_id: string;
  work_order_id?: string | null;
  inspector_id?: string | null;
  check_date: string;
  status?: string | null;
  notes?: string | null;
  measurements?: any;
  photos?: string[] | null;
  next_check_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
