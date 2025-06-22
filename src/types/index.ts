export type UserRole = 'admin' | 'manager' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Project {
  id: string
  name: string
  status: 'active' | 'completed' | 'pending'
  startDate: string
  endDate?: string
  managerId: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Spool {
  id: string
  name: string
  projectId: string
  status: 'pending' | 'active' | 'completed'
  assignedTo?: string
  quantity: number
  completedQuantity: number
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface WorkOrder {
  id: string
  number: string
  projectId: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  startDate: string
  dueDate: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Personnel {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  status: 'active' | 'inactive' | 'on_leave'
  hireDate: string
  createdAt: string
  updatedAt: string
}

export interface Shipment {
  id: string
  number: string
  projectId: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  destination: string
  scheduledDate: string
  actualDate?: string
  carrier: string
  trackingNumber?: string
  totalWeight: number
  createdAt: string
  updatedAt: string
}

export type Material = {
  id: string
  name: string
  type: string
  unit: string
  stock_quantity: number
  min_quantity?: number
  created_at: string
  updated_at?: string
}

export type Activity = {
  id: string
  user_id: string
  activity_type: 'create' | 'update' | 'delete' | 'login' | 'logout'
  description: string
  resource_type: 'project' | 'spool' | 'material' | 'personnel'
  resource_id: string
  created_at: string
}

export type WorkHours = {
  id: string
  personnel_id: string
  project_id: string
  start_time: string
  end_time: string
  description?: string
  created_at: string
}

export type MaterialEntry = {
  id: string
  material_id: string
  project_id: string
  quantity: number
  entry_date: string
  supplier: string
  created_at: string
}