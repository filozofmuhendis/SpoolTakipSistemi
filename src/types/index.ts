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
  shipyard?: string;
  ship?: string;
  start_date?: string;
  delivery_date?: string;
  created_by?: string;
  manager_id?: string;
  client_name?: string;
  description?: string;
  end_date?: string;
  status?: string;
}

export interface UrunAltKalemi {
  id: string;
  project_id?: string;
  name?: string;
  description?: string;
  material?: string;
  diameter?: number;
  thickness?: number;
  length?: number;
  weight?: number;
  status?: string;
  notes?: string;
  created_by?: string;
}

export interface JobOrder {
  id: string;
  project_id?: string;
  urun_alt_kalemi_id?: string;
  title?: string;
  description?: string;
  status?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  created_by?: string;
}

export interface Shipment {
  id: string;
  project_id?: string;
  number?: string;
  destination?: string;
  shipment_date?: string;
  status?: string;
  notes?: string;
  created_by?: string;
}

export interface Inventory {
  id: string;
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  status?: string;
  notes?: string;
  created_by?: string;
}

export interface Document {
  id: string;
  project_id?: string;
  name?: string;
  url?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  notes?: string;
}

export interface Personnel {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status?: string;
  salary?: number;
  emergency_contact?: string;
  emergency_phone?: string;
  address?: string;
  skills?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  performed_by?: string;
  transaction_date?: string;
  created_at?: string;
}

export interface MaterialRequest {
  id: string;
  request_number: string;
  project_id?: string;
  urun_alt_kalemi_id?: string;
  requested_by?: string;
  status?: string;
  priority?: string;
  request_date?: string;
  required_date?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialRequestItem {
  id: string;
  request_id: string;
  inventory_id?: string;
  quantity: number;
  unit: string;
  notes?: string;
  created_at?: string;
}

export interface QualityCheck {
  id: string;
  urun_alt_kalemi_id: string;
  work_order_id?: string;
  inspector_id?: string;
  check_date: string;
  status?: string;
  notes?: string;
  measurements?: any;
  photos?: string[];
  next_check_date?: string;
  created_at?: string;
  updated_at?: string;
}
