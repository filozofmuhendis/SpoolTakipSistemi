export type UserRole = 'admin' | 'manager' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Profile {
  id: string
  email: string
  fullName?: string
  phone?: string
  department?: string
  position: UserRole
  avatarUrl?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  startDate: string
  endDate?: string
  managerId: string
  managerName?: string
  budget?: number
  location?: string
  clientName?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
}

export interface Spool {
  id: string
  name: string
  description?: string
  projectId: string
  projectName?: string
  assignedTo?: string
  assignedToName?: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  quantity: number
  completedQuantity: number
  startDate?: string
  endDate?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  materialType?: string
  dimensions?: string
  weight?: number
  specifications?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WorkOrder {
  id: string
  number: string
  title: string
  description?: string
  projectId: string
  projectName?: string
  spoolId?: string
  spoolName?: string
  assignedTo: string
  assignedToName?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: string
  dueDate?: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  materialsUsed?: string
  qualityCheck: boolean
  qualityNotes?: string
  createdAt: string
  updatedAt: string
}

export interface Personnel {
  id: string
  name: string
  email: string
  phone?: string
  department: string
  position: string
  hireDate: string
  status: 'active' | 'inactive' | 'terminated' | 'on_leave'
  salary?: number
  emergencyContact?: string
  emergencyPhone?: string
  address?: string
  skills?: string[]
  createdAt: string
  updatedAt: string
}

export interface Shipment {
  id: string
  number: string
  projectId: string
  projectName?: string
  destination: string
  carrier?: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: string
  actualDate?: string
  totalWeight?: number
  trackingNumber?: string
  shippingCost?: number
  insuranceAmount?: number
  customsInfo?: string
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  id: string
  name: string
  code: string
  category: string
  type: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  location: string
  supplier: string
  projectId?: string
  projectName?: string
  description?: string
  specifications?: string
  cost: number
  status: 'active' | 'inactive' | 'discontinued'
  lastUpdated: string
  reorderPoint?: number
  leadTimeDays?: number
  createdAt: string
  updatedAt: string
}

export interface InventoryTransaction {
  id: string
  inventoryId: string
  inventoryName?: string
  transactionType: 'in' | 'out' | 'adjustment' | 'transfer'
  quantity: number
  unitCost?: number
  totalCost?: number
  referenceType?: 'purchase' | 'production' | 'shipment' | 'adjustment'
  referenceId?: string
  notes?: string
  performedBy?: string
  performedByName?: string
  transactionDate: string
  createdAt: string
}

export interface FileUpload {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
  uploadedBy: string
  uploadedByName?: string
  entityType: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
  entityId: string
  description?: string
  isPublic: boolean
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  entityType?: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
  entityId?: string
  read: boolean
  actionUrl?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  expiresAt?: string
  createdAt: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  spoolUpdates: boolean
  projectUpdates: boolean
  personnelUpdates: boolean
  workOrderUpdates: boolean
  shipmentUpdates: boolean
  inventoryAlerts: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  tableName: string
  recordId?: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  userId?: string
  userName?: string
  oldData?: any
  newData?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface Report {
  id: string
  name: string
  type: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
  parameters?: any
  generatedBy: string
  generatedByName?: string
  fileUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

export interface WorkHours {
  id: string
  personnelId: string
  personnelName?: string
  projectId: string
  projectName?: string
  spoolId?: string
  spoolName?: string
  workOrderId?: string
  workOrderNumber?: string
  startTime: string
  endTime?: string
  hoursWorked?: number
  description?: string
  isOvertime: boolean
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MaterialRequest {
  id: string
  requestNumber: string
  projectId: string
  projectName?: string
  spoolId?: string
  spoolName?: string
  requestedBy: string
  requestedByName?: string
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestedDate: string
  neededByDate?: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  notes?: string
  items?: MaterialRequestItem[]
  createdAt: string
  updatedAt: string
}

export interface MaterialRequestItem {
  id: string
  requestId: string
  inventoryId: string
  inventoryName?: string
  quantityRequested: number
  quantityApproved?: number
  quantityIssued?: number
  unitCost?: number
  notes?: string
  createdAt: string
}

export interface QualityCheck {
  id: string
  spoolId: string
  spoolName?: string
  workOrderId?: string
  workOrderNumber?: string
  inspectorId: string
  inspectorName?: string
  checkDate: string
  status: 'pending' | 'passed' | 'failed' | 'conditional'
  notes?: string
  defectsFound?: string
  correctiveActions?: string
  nextCheckDate?: string
  createdAt: string
  updatedAt: string
}

export interface Equipment {
  id: string
  name: string
  code: string
  type: string
  model?: string
  manufacturer?: string
  serialNumber?: string
  location?: string
  status: 'active' | 'maintenance' | 'inactive' | 'retired'
  purchaseDate?: string
  warrantyExpiry?: string
  lastMaintenance?: string
  nextMaintenance?: string
  assignedTo?: string
  assignedToName?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Activity = {
  id: string
  type: 'spool_created' | 'spool_updated' | 'work_order_created' | 'shipment_created' | 'inventory_updated' | 'quality_check_completed'
  description: string
  user: string
  timestamp: string
}

export type Material = {
  id: string
  name: string
  type: string
  quantity: number
  unit: string
  supplier: string
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

// Dashboard ve raporlama için tip tanımları
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalSpools: number
  completedSpools: number
  totalPersonnel: number
  activePersonnel: number
  totalInventory: number
  lowStockItems: number
  totalShipments: number
  pendingShipments: number
  totalWorkOrders: number
  completedWorkOrders: number
}

export interface SpoolProgress {
  id: string
  name: string
  projectId: string
  projectName: string
  status: string
  quantity: number
  completedQuantity: number
  progressPercentage: number
  startDate?: string
  endDate?: string
  assignedToName?: string
}

export interface InventorySummary {
  id: string
  name: string
  code: string
  category: string
  type: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  cost: number
  totalValue: number
  stockStatus: 'low' | 'warning' | 'normal'
  location: string
  supplier: string
  projectName?: string
}

export interface WorkOrderSummary {
  id: string
  number: string
  title: string
  projectId: string
  projectName: string
  status: string
  priority: string
  startDate?: string
  dueDate?: string
  completedDate?: string
  assignedToName?: string
  spoolName?: string
  estimatedHours?: number
  actualHours?: number
}

export interface PersonnelWorkload {
  id: string
  name: string
  department: string
  position: string
  assignedSpools: number
  assignedWorkOrders: number
  totalHoursWorked: number
  avgHoursPerDay: number
}

// Form tipleri
export interface SpoolFormData {
  name: string
  description?: string
  projectId: string
  assignedTo?: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  quantity: number
  completedQuantity?: number
  startDate?: string
  endDate?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  materialType?: string
  dimensions?: string
  weight?: number
  specifications?: string
  notes?: string
}

export interface WorkOrderFormData {
  number: string
  title: string
  description?: string
  projectId: string
  spoolId?: string
  assignedTo: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  materialsUsed?: string
  qualityNotes?: string
}

export interface InventoryFormData {
  name: string
  code: string
  category: string
  type: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  location: string
  supplier: string
  projectId?: string
  description?: string
  specifications?: string
  cost: number
  status: 'active' | 'inactive' | 'discontinued'
  reorderPoint?: number
  leadTimeDays?: number
}

export interface MaterialRequestFormData {
  requestNumber: string
  projectId: string
  spoolId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestedDate: string
  neededByDate?: string
  notes?: string
  items: {
    inventoryId: string
    quantityRequested: number
    notes?: string
  }[]
}

export interface QualityCheckFormData {
  spoolId: string
  workOrderId?: string
  inspectorId: string
  checkDate: string
  status: 'pending' | 'passed' | 'failed' | 'conditional'
  notes?: string
  defectsFound?: string
  correctiveActions?: string
  nextCheckDate?: string
}

// API Response tipleri
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filtre tipleri
export interface FilterOptions {
  search?: string
  status?: string
  category?: string
  type?: string
  priority?: string
  dateFrom?: string
  dateTo?: string
  assignedTo?: string
  projectId?: string
}

// Bildirim tipleri
export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  spoolUpdates: boolean
  projectUpdates: boolean
  personnelUpdates: boolean
  workOrderUpdates: boolean
  shipmentUpdates: boolean
  inventoryAlerts: boolean
}
