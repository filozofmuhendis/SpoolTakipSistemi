export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

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
                    position: 'admin' | 'manager' | 'user' | null
                    avatar_url: string | null
                    hire_date: string | null
                    salary: number | null
                    emergency_contact: string | null
                    emergency_phone: string | null
                    address: string | null
                    status: 'active' | 'inactive' | 'terminated' | null
                    is_active: boolean | null
                    last_login: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    phone?: string | null
                    department?: string | null
                    position?: 'admin' | 'manager' | 'user' | null
                    avatar_url?: string | null
                    hire_date?: string | null
                    salary?: number | null
                    emergency_contact?: string | null
                    emergency_phone?: string | null
                    address?: string | null
                    status?: 'active' | 'inactive' | 'terminated' | null
                    is_active?: boolean | null
                    last_login?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    phone?: string | null
                    department?: string | null
                    position?: 'admin' | 'manager' | 'user' | null
                    avatar_url?: string | null
                    hire_date?: string | null
                    salary?: number | null
                    emergency_contact?: string | null
                    emergency_phone?: string | null
                    address?: string | null
                    status?: 'active' | 'inactive' | 'terminated' | null
                    is_active?: boolean | null
                    last_login?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            projects: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    status: 'active' | 'completed' | 'cancelled' | 'pending' | null
                    start_date: string
                    end_date: string | null
                    manager_id: string | null
                    budget: number | null
                    location: string | null
                    client_name: string | null
                    priority: 'low' | 'medium' | 'high' | 'urgent' | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    status?: 'active' | 'completed' | 'cancelled' | 'pending' | null
                    start_date: string
                    end_date?: string | null
                    manager_id?: string | null
                    budget?: number | null
                    location?: string | null
                    client_name?: string | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    status?: 'active' | 'completed' | 'cancelled' | 'pending' | null
                    start_date?: string
                    end_date?: string | null
                    manager_id?: string | null
                    budget?: number | null
                    location?: string | null
                    client_name?: string | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            spools: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    project_id: string
                    assigned_to: string | null
                    status: 'pending' | 'active' | 'completed' | 'cancelled' | null
                    quantity: number | null
                    completed_quantity: number | null
                    start_date: string | null
                    end_date: string | null
                    priority: 'low' | 'medium' | 'high' | 'urgent' | null
                    material_type: string | null
                    dimensions: string | null
                    weight: number | null
                    specifications: string | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    project_id: string
                    assigned_to?: string | null
                    status?: 'pending' | 'active' | 'completed' | 'cancelled' | null
                    quantity?: number | null
                    completed_quantity?: number | null
                    start_date?: string | null
                    end_date?: string | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    material_type?: string | null
                    dimensions?: string | null
                    weight?: number | null
                    specifications?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    project_id?: string
                    assigned_to?: string | null
                    status?: 'pending' | 'active' | 'completed' | 'cancelled' | null
                    quantity?: number | null
                    completed_quantity?: number | null
                    start_date?: string | null
                    end_date?: string | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    material_type?: string | null
                    dimensions?: string | null
                    weight?: number | null
                    specifications?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
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
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null
                    priority: 'low' | 'medium' | 'high' | 'urgent' | null
                    start_date: string | null
                    due_date: string | null
                    completed_date: string | null
                    estimated_hours: number | null
                    actual_hours: number | null
                    materials_used: string | null
                    quality_check: boolean | null
                    quality_notes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    number: string
                    title: string
                    description?: string | null
                    project_id: string
                    spool_id?: string | null
                    assigned_to: string
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    start_date?: string | null
                    due_date?: string | null
                    completed_date?: string | null
                    estimated_hours?: number | null
                    actual_hours?: number | null
                    materials_used?: string | null
                    quality_check?: boolean | null
                    quality_notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    number?: string
                    title?: string
                    description?: string | null
                    project_id?: string
                    spool_id?: string | null
                    assigned_to?: string
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    start_date?: string | null
                    due_date?: string | null
                    completed_date?: string | null
                    estimated_hours?: number | null
                    actual_hours?: number | null
                    materials_used?: string | null
                    quality_check?: boolean | null
                    quality_notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            shipments: {
                Row: {
                    id: string
                    number: string
                    project_id: string
                    destination: string
                    carrier: string | null
                    status: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | null
                    priority: 'low' | 'medium' | 'high' | 'urgent' | null
                    scheduled_date: string
                    actual_date: string | null
                    total_weight: number | null
                    tracking_number: string | null
                    shipping_cost: number | null
                    insurance_amount: number | null
                    customs_info: string | null
                    special_instructions: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    number: string
                    project_id: string
                    destination: string
                    carrier?: string | null
                    status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    scheduled_date: string
                    actual_date?: string | null
                    total_weight?: number | null
                    tracking_number?: string | null
                    shipping_cost?: number | null
                    insurance_amount?: number | null
                    customs_info?: string | null
                    special_instructions?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    number?: string
                    project_id?: string
                    destination?: string
                    carrier?: string | null
                    status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    scheduled_date?: string
                    actual_date?: string | null
                    total_weight?: number | null
                    tracking_number?: string | null
                    shipping_cost?: number | null
                    insurance_amount?: number | null
                    customs_info?: string | null
                    special_instructions?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            inventory: {
                Row: {
                    id: string
                    name: string
                    code: string
                    category: string
                    type: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
                    quantity: number | null
                    unit: string
                    min_stock: number | null
                    max_stock: number | null
                    location: string
                    supplier: string
                    project_id: string | null
                    description: string | null
                    specifications: string | null
                    cost: number
                    status: 'active' | 'inactive' | 'discontinued' | null
                    last_updated: string | null
                    reorder_point: number | null
                    lead_time_days: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    category: string
                    type: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
                    quantity?: number | null
                    unit: string
                    min_stock?: number | null
                    max_stock?: number | null
                    location: string
                    supplier: string
                    project_id?: string | null
                    description?: string | null
                    specifications?: string | null
                    cost: number
                    status?: 'active' | 'inactive' | 'discontinued' | null
                    last_updated?: string | null
                    reorder_point?: number | null
                    lead_time_days?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    category?: string
                    type?: 'raw_material' | 'finished_product' | 'semi_finished' | 'consumable'
                    quantity?: number | null
                    unit?: string
                    min_stock?: number | null
                    max_stock?: number | null
                    location?: string
                    supplier?: string
                    project_id?: string | null
                    description?: string | null
                    specifications?: string | null
                    cost?: number
                    status?: 'active' | 'inactive' | 'discontinued' | null
                    last_updated?: string | null
                    reorder_point?: number | null
                    lead_time_days?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            reports: {
                Row: {
                    id: string
                    name: string
                    type: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
                    parameters: Json | null
                    generated_by: string
                    file_url: string | null
                    status: 'pending' | 'processing' | 'completed' | 'failed' | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
                    parameters?: Json | null
                    generated_by: string
                    file_url?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'production' | 'personnel' | 'shipment' | 'inventory' | 'financial' | 'custom'
                    parameters?: Json | null
                    generated_by?: string
                    file_url?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | null
                    created_at?: string | null
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
                    is_overtime: boolean | null
                    approved_by: string | null
                    approved_at: string | null
                    created_at: string | null
                    updated_at: string | null
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
                    is_overtime?: boolean | null
                    approved_by?: string | null
                    approved_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
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
                    is_overtime?: boolean | null
                    approved_by?: string | null
                    approved_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            material_requests: {
                Row: {
                    id: string
                    request_number: string
                    project_id: string
                    spool_id: string | null
                    requested_by: string
                    status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | null
                    priority: 'low' | 'medium' | 'high' | 'urgent' | null
                    requested_date: string | null
                    needed_by_date: string | null
                    approved_by: string | null
                    approved_at: string | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    request_number: string
                    project_id: string
                    spool_id?: string | null
                    requested_by: string
                    status?: 'pending' | 'approved' | 'rejected' | 'fulfilled' | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    requested_date?: string | null
                    needed_by_date?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    request_number?: string
                    project_id?: string
                    spool_id?: string | null
                    requested_by?: string
                    status?: 'pending' | 'approved' | 'rejected' | 'fulfilled' | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    requested_date?: string | null
                    needed_by_date?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
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
                    created_at: string | null
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
                    created_at?: string | null
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
                    created_at?: string | null
                }
            }
            quality_checks: {
                Row: {
                    id: string
                    spool_id: string
                    work_order_id: string | null
                    inspector_id: string
                    check_date: string
                    status: 'pending' | 'passed' | 'failed' | 'conditional' | null
                    notes: string | null
                    defects_found: string | null
                    corrective_actions: string | null
                    next_check_date: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    spool_id: string
                    work_order_id?: string | null
                    inspector_id: string
                    check_date: string
                    status?: 'pending' | 'passed' | 'failed' | 'conditional' | null
                    notes?: string | null
                    defects_found?: string | null
                    corrective_actions?: string | null
                    next_check_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    spool_id?: string
                    work_order_id?: string | null
                    inspector_id?: string
                    check_date?: string
                    status?: 'pending' | 'passed' | 'failed' | 'conditional' | null
                    notes?: string | null
                    defects_found?: string | null
                    corrective_actions?: string | null
                    next_check_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
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
                    status: 'active' | 'maintenance' | 'inactive' | 'retired' | null
                    purchase_date: string | null
                    warranty_expiry: string | null
                    last_maintenance: string | null
                    next_maintenance: string | null
                    assigned_to: string | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
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
                    status?: 'active' | 'maintenance' | 'inactive' | 'retired' | null
                    purchase_date?: string | null
                    warranty_expiry?: string | null
                    last_maintenance?: string | null
                    next_maintenance?: string | null
                    assigned_to?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
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
                    status?: 'active' | 'maintenance' | 'inactive' | 'retired' | null
                    purchase_date?: string | null
                    warranty_expiry?: string | null
                    last_maintenance?: string | null
                    next_maintenance?: string | null
                    assigned_to?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
