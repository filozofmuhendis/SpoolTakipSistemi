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
  client_name?: string;
  description?: string;
  end_date?: string;
  status?: string;
}

export interface UrunAltKalemi {
  id: string;
  project_id?: string;
  name?: string;
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
