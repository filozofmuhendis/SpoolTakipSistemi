-- Spool Takip Sistemi - Kapsamlı Supabase Veritabanı Şeması
-- Bu dosya yeni bir Supabase projesi için tüm gerekli tabloları, RLS politikalarını ve trigger'ları içerir

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE (User Management)
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    department TEXT,
    position TEXT CHECK (position IN ('admin', 'manager', 'user')) DEFAULT 'user',
    avatar_url TEXT,
    hire_date DATE,
    salary DECIMAL(10,2),
    emergency_contact TEXT,
    emergency_phone TEXT,
    address TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'cancelled', 'pending')) DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE,
    manager_id UUID REFERENCES public.profiles(id),
    budget DECIMAL(15,2),
    location TEXT,
    client_name TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PERSONNEL TABLE (Extended user info)
-- =============================================
CREATE TABLE public.personnel (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('active', 'inactive', 'terminated', 'on_leave')) DEFAULT 'active',
    salary DECIMAL(10,2),
    emergency_contact TEXT,
    emergency_phone TEXT,
    address TEXT,
    skills TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SPOOLS TABLE
-- =============================================
CREATE TABLE public.spools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id),
    status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
    quantity INTEGER DEFAULT 0,
    completed_quantity INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    material_type TEXT,
    dimensions TEXT,
    weight DECIMAL(10,2),
    specifications TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WORK ORDERS TABLE
-- =============================================
CREATE TABLE public.work_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    spool_id UUID REFERENCES public.spools(id) ON DELETE SET NULL,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    materials_used TEXT,
    quality_check BOOLEAN DEFAULT false,
    quality_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SHIPMENTS TABLE
-- =============================================
CREATE TABLE public.shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    number TEXT UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    carrier TEXT,
    status TEXT CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    total_weight DECIMAL(10,2),
    tracking_number TEXT,
    shipping_cost DECIMAL(10,2),
    insurance_amount DECIMAL(10,2),
    customs_info TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVENTORY TABLE
-- =============================================
CREATE TABLE public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    type TEXT CHECK (type IN ('raw_material', 'finished_product', 'semi_finished', 'consumable')) NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit TEXT NOT NULL,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    location TEXT NOT NULL,
    supplier TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    description TEXT,
    specifications TEXT,
    cost DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'discontinued')) DEFAULT 'active',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    reorder_point INTEGER,
    lead_time_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REPORTS TABLE
-- =============================================
CREATE TABLE public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('production', 'personnel', 'shipment', 'inventory', 'financial', 'custom')) NOT NULL,
    parameters JSONB,
    generated_by UUID NOT NULL REFERENCES public.profiles(id),
    file_url TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WORK HOURS TABLE
-- =============================================
CREATE TABLE public.work_hours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    personnel_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    spool_id UUID REFERENCES public.spools(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    hours_worked DECIMAL(5,2),
    description TEXT,
    is_overtime BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MATERIAL REQUESTS TABLE
-- =============================================
CREATE TABLE public.material_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    spool_id UUID REFERENCES public.spools(id) ON DELETE SET NULL,
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    requested_date DATE DEFAULT CURRENT_DATE,
    needed_by_date DATE,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MATERIAL REQUEST ITEMS TABLE
-- =============================================
CREATE TABLE public.material_request_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES public.inventory(id),
    quantity_requested INTEGER NOT NULL,
    quantity_approved INTEGER,
    quantity_issued INTEGER,
    unit_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUALITY CHECKS TABLE
-- =============================================
CREATE TABLE public.quality_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spool_id UUID NOT NULL REFERENCES public.spools(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    inspector_id UUID NOT NULL REFERENCES public.profiles(id),
    check_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'passed', 'failed', 'conditional')) DEFAULT 'pending',
    notes TEXT,
    defects_found TEXT,
    corrective_actions TEXT,
    next_check_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EQUIPMENT TABLE
-- =============================================
CREATE TABLE public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    model TEXT,
    manufacturer TEXT,
    serial_number TEXT,
    location TEXT,
    status TEXT CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')) DEFAULT 'active',
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    assigned_to UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VIEWS
-- =============================================

-- Spool Progress View
CREATE VIEW public.spool_progress AS
SELECT 
    s.id,
    s.name,
    s.project_id,
    p.name as project_name,
    s.status,
    s.quantity,
    s.completed_quantity,
    CASE 
        WHEN s.quantity > 0 THEN ROUND((s.completed_quantity::DECIMAL / s.quantity::DECIMAL) * 100, 2)
        ELSE 0
    END as progress_percentage,
    s.start_date,
    s.end_date,
    pr.full_name as assigned_to_name
FROM public.spools s
LEFT JOIN public.projects p ON s.project_id = p.id
LEFT JOIN public.profiles pr ON s.assigned_to = pr.id;

-- Inventory Summary View
CREATE VIEW public.inventory_summary AS
SELECT 
    i.id,
    i.name,
    i.code,
    i.category,
    i.type,
    i.quantity,
    i.unit,
    i.min_stock,
    i.max_stock,
    i.cost,
    (i.quantity * i.cost) as total_value,
    CASE 
        WHEN i.quantity <= i.min_stock THEN 'Low Stock'
        WHEN i.quantity >= i.max_stock THEN 'Overstock'
        ELSE 'Normal'
    END as stock_status,
    i.location,
    i.supplier,
    p.name as project_name
FROM public.inventory i
LEFT JOIN public.projects p ON i.project_id = p.id;

-- Work Order Summary View
CREATE VIEW public.work_order_summary AS
SELECT 
    wo.id,
    wo.number,
    wo.title,
    wo.project_id,
    p.name as project_name,
    wo.status,
    wo.priority,
    wo.start_date,
    wo.due_date,
    wo.completed_date,
    pr.full_name as assigned_to_name,
    s.name as spool_name,
    wo.estimated_hours,
    wo.actual_hours
FROM public.work_orders wo
LEFT JOIN public.projects p ON wo.project_id = p.id
LEFT JOIN public.profiles pr ON wo.assigned_to = pr.id
LEFT JOIN public.spools s ON wo.spool_id = s.id;

-- Personnel Workload View
CREATE VIEW public.personnel_workload AS
SELECT 
    pr.id,
    pr.full_name as name,
    pr.department,
    pr.position,
    COUNT(DISTINCT s.id) as assigned_spools,
    COUNT(DISTINCT wo.id) as assigned_work_orders,
    COALESCE(SUM(wh.hours_worked), 0) as total_hours_worked,
    CASE 
        WHEN COUNT(DISTINCT DATE(wh.start_time)) > 0 
        THEN ROUND(COALESCE(SUM(wh.hours_worked), 0) / COUNT(DISTINCT DATE(wh.start_time)), 2)
        ELSE 0
    END as avg_hours_per_day
FROM public.profiles pr
LEFT JOIN public.spools s ON pr.id = s.assigned_to AND s.status IN ('active', 'pending')
LEFT JOIN public.work_orders wo ON pr.id = wo.assigned_to AND wo.status IN ('pending', 'in_progress')
LEFT JOIN public.work_hours wh ON pr.id = wh.personnel_id AND wh.start_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.id, pr.full_name, pr.department, pr.position;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON public.personnel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spools_updated_at BEFORE UPDATE ON public.spools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_hours_updated_at BEFORE UPDATE ON public.work_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_requests_updated_at BEFORE UPDATE ON public.material_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_checks_updated_at BEFORE UPDATE ON public.quality_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HANDLE NEW USER TRIGGER
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position = 'admin'
    )
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position = 'admin'
    )
);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position = 'admin'
    )
);

-- Projects policies
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers and admins can manage projects" ON public.projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Personnel policies
CREATE POLICY "Authenticated users can view personnel" ON public.personnel FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage personnel" ON public.personnel FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position = 'admin'
    )
);

-- Spools policies
CREATE POLICY "Authenticated users can view spools" ON public.spools FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Assigned users can update their spools" ON public.spools FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);
CREATE POLICY "Managers and admins can manage spools" ON public.spools FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Work orders policies
CREATE POLICY "Authenticated users can view work orders" ON public.work_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Assigned users can update their work orders" ON public.work_orders FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);
CREATE POLICY "Managers and admins can manage work orders" ON public.work_orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Shipments policies
CREATE POLICY "Authenticated users can view shipments" ON public.shipments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers and admins can manage shipments" ON public.shipments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Inventory policies
CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers and admins can manage inventory" ON public.inventory FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (generated_by = auth.uid());
CREATE POLICY "Authenticated users can create reports" ON public.reports FOR INSERT WITH CHECK (generated_by = auth.uid());
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position = 'admin'
    )
);

-- Work hours policies
CREATE POLICY "Users can view own work hours" ON public.work_hours FOR SELECT USING (personnel_id = auth.uid());
CREATE POLICY "Users can insert own work hours" ON public.work_hours FOR INSERT WITH CHECK (personnel_id = auth.uid());
CREATE POLICY "Users can update own work hours" ON public.work_hours FOR UPDATE USING (personnel_id = auth.uid());
CREATE POLICY "Managers and admins can view all work hours" ON public.work_hours FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Material requests policies
CREATE POLICY "Users can view own material requests" ON public.material_requests FOR SELECT USING (requested_by = auth.uid());
CREATE POLICY "Users can create material requests" ON public.material_requests FOR INSERT WITH CHECK (requested_by = auth.uid());
CREATE POLICY "Managers and admins can view all material requests" ON public.material_requests FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);
CREATE POLICY "Managers and admins can manage material requests" ON public.material_requests FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Material request items policies
CREATE POLICY "Authenticated users can view material request items" ON public.material_request_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers and admins can manage material request items" ON public.material_request_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Quality checks policies
CREATE POLICY "Authenticated users can view quality checks" ON public.quality_checks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inspectors can manage their quality checks" ON public.quality_checks FOR ALL USING (
    inspector_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- Equipment policies
CREATE POLICY "Authenticated users can view equipment" ON public.equipment FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers and admins can manage equipment" ON public.equipment FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_department ON public.profiles(department);
CREATE INDEX idx_profiles_position ON public.profiles(position);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Projects indexes
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_manager_id ON public.projects(manager_id);
CREATE INDEX idx_projects_start_date ON public.projects(start_date);

-- Spools indexes
CREATE INDEX idx_spools_project_id ON public.spools(project_id);
CREATE INDEX idx_spools_assigned_to ON public.spools(assigned_to);
CREATE INDEX idx_spools_status ON public.spools(status);

-- Work orders indexes
CREATE INDEX idx_work_orders_project_id ON public.work_orders(project_id);
CREATE INDEX idx_work_orders_spool_id ON public.work_orders(spool_id);
CREATE INDEX idx_work_orders_assigned_to ON public.work_orders(assigned_to);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_work_orders_number ON public.work_orders(number);

-- Inventory indexes
CREATE INDEX idx_inventory_code ON public.inventory(code);
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_type ON public.inventory(type);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_project_id ON public.inventory(project_id);

-- Work hours indexes
CREATE INDEX idx_work_hours_personnel_id ON public.work_hours(personnel_id);
CREATE INDEX idx_work_hours_project_id ON public.work_hours(project_id);
CREATE INDEX idx_work_hours_start_time ON public.work_hours(start_time);

-- Material requests indexes
CREATE INDEX idx_material_requests_project_id ON public.material_requests(project_id);
CREATE INDEX idx_material_requests_requested_by ON public.material_requests(requested_by);
CREATE INDEX idx_material_requests_status ON public.material_requests(status);
CREATE INDEX idx_material_requests_request_number ON public.material_requests(request_number);

-- Quality checks indexes
CREATE INDEX idx_quality_checks_spool_id ON public.quality_checks(spool_id);
CREATE INDEX idx_quality_checks_inspector_id ON public.quality_checks(inspector_id);
CREATE INDEX idx_quality_checks_check_date ON public.quality_checks(check_date);

-- Equipment indexes
CREATE INDEX idx_equipment_code ON public.equipment(code);
CREATE INDEX idx_equipment_type ON public.equipment(type);
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_assigned_to ON public.equipment(assigned_to);

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Insert sample admin user (will be created when first user registers)
-- The trigger will handle profile creation automatically

COMMIT;

-- =============================================
-- SETUP COMPLETE
-- =============================================
-- Bu şema dosyası yeni Supabase projenizde çalıştırılmaya hazırdır.
-- Dosyayı Supabase SQL Editor'da çalıştırdıktan sonra:
-- 1. .env.local dosyanızı yeni proje bilgileriyle güncelleyin
-- 2. İlk admin kullanıcısını oluşturun
-- 3. Uygulamanızı test edin