-- Spool Takip Sistemi - Tam Supabase Şeması
-- Bu dosya projenin tüm veritabanı yapısını içerir

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- AUTHENTICATION & USER MANAGEMENT
-- ========================================

-- Create profiles table (auth.users ile bağlantılı)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  department TEXT,
  position TEXT DEFAULT 'user' CHECK (position IN ('admin', 'manager', 'user')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PROJECT MANAGEMENT
-- ========================================

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'pending')),
  start_date DATE NOT NULL,
  end_date DATE,
  manager_id UUID REFERENCES profiles(id),
  budget DECIMAL(15,2),
  location TEXT,
  client_name TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PERSONNEL MANAGEMENT
-- ========================================

-- Drop personnel table
DROP TABLE IF EXISTS personnel CASCADE;

-- Create personnel table
CREATE TABLE IF NOT EXISTS personnel (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  salary DECIMAL(10,2),
  emergency_contact TEXT,
  emergency_phone TEXT,
  address TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SPOOL MANAGEMENT
-- ========================================

-- Create spools table
CREATE TABLE IF NOT EXISTS spools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES personnel(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  quantity INTEGER NOT NULL DEFAULT 1,
  completed_quantity INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  material_type TEXT,
  dimensions TEXT,
  weight DECIMAL(10,2),
  specifications TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WORK ORDERS
-- ========================================

-- Create work_orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  spool_id UUID REFERENCES spools(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES personnel(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  materials_used TEXT,
  quality_check BOOLEAN DEFAULT FALSE,
  quality_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SHIPMENT MANAGEMENT
-- ========================================

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  carrier TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  total_weight DECIMAL(10,2),
  tracking_number TEXT,
  shipping_cost DECIMAL(10,2),
  insurance_amount DECIMAL(10,2),
  customs_info TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INVENTORY MANAGEMENT
-- ========================================

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('raw_material', 'finished_product', 'semi_finished', 'consumable')),
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_stock DECIMAL(10,2) NOT NULL DEFAULT 100,
  location TEXT NOT NULL,
  supplier TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  description TEXT,
  specifications TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reorder_point DECIMAL(10,2),
  lead_time_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INVENTORY TRANSACTIONS
-- ========================================

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'transfer')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reference_type TEXT CHECK (reference_type IN ('purchase', 'production', 'shipment', 'adjustment')),
  reference_id UUID,
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FILE MANAGEMENT
-- ========================================

-- Create file_uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('spool', 'project', 'personnel', 'workOrder', 'shipment', 'inventory')),
  entity_id UUID NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- NOTIFICATION SYSTEM
-- ========================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT CHECK (entity_type IN ('spool', 'project', 'personnel', 'workOrder', 'shipment', 'inventory')),
  entity_id UUID,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  spool_updates BOOLEAN DEFAULT TRUE,
  project_updates BOOLEAN DEFAULT TRUE,
  personnel_updates BOOLEAN DEFAULT TRUE,
  work_order_updates BOOLEAN DEFAULT TRUE,
  shipment_updates BOOLEAN DEFAULT TRUE,
  inventory_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AUDIT SYSTEM
-- ========================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES profiles(id),
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REPORTING & ANALYTICS
-- ========================================

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('production', 'personnel', 'shipment', 'inventory', 'financial', 'custom')),
  parameters JSONB,
  generated_by UUID REFERENCES profiles(id),
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WORK HOURS TRACKING
-- ========================================

-- Create work_hours table
CREATE TABLE IF NOT EXISTS work_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  spool_id UUID REFERENCES spools(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  hours_worked DECIMAL(4,2),
  description TEXT,
  is_overtime BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MATERIAL REQUESTS
-- ========================================

-- Create material_requests table
CREATE TABLE IF NOT EXISTS material_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  spool_id UUID REFERENCES spools(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  requested_date DATE NOT NULL,
  needed_by_date DATE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create material_request_items table
CREATE TABLE IF NOT EXISTS material_request_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES material_requests(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id),
  quantity_requested DECIMAL(10,2) NOT NULL,
  quantity_approved DECIMAL(10,2),
  quantity_issued DECIMAL(10,2),
  unit_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- QUALITY CONTROL
-- ========================================

-- Create quality_checks table
CREATE TABLE IF NOT EXISTS quality_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  spool_id UUID REFERENCES spools(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES personnel(id),
  check_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'conditional')),
  notes TEXT,
  defects_found TEXT,
  corrective_actions TEXT,
  next_check_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MAINTENANCE & EQUIPMENT
-- ========================================

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  model TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')),
  purchase_date DATE,
  warranty_expiry DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  assigned_to UUID REFERENCES personnel(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON profiles(position);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);

-- Personnel indexes
CREATE INDEX IF NOT EXISTS idx_personnel_department ON personnel(department);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON personnel(status);
CREATE INDEX IF NOT EXISTS idx_personnel_email ON personnel(email);

-- Spools indexes
CREATE INDEX IF NOT EXISTS idx_spools_project_id ON spools(project_id);
CREATE INDEX IF NOT EXISTS idx_spools_assigned_to ON spools(assigned_to);
CREATE INDEX IF NOT EXISTS idx_spools_status ON spools(status);
CREATE INDEX IF NOT EXISTS idx_spools_start_date ON spools(start_date);

-- Work orders indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_project_id ON work_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_due_date ON work_orders(due_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_number ON work_orders(number);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_project_id ON shipments(project_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_scheduled_date ON shipments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_shipments_number ON shipments(number);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_project_id ON inventory(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory(type);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_code ON inventory(code);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- File uploads indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Work hours indexes
CREATE INDEX IF NOT EXISTS idx_work_hours_personnel_id ON work_hours(personnel_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_project_id ON work_hours(project_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_start_time ON work_hours(start_time);

-- Material requests indexes
CREATE INDEX IF NOT EXISTS idx_material_requests_project_id ON material_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(status);
CREATE INDEX IF NOT EXISTS idx_material_requests_requested_by ON material_requests(requested_by);

-- Quality checks indexes
CREATE INDEX IF NOT EXISTS idx_quality_checks_spool_id ON quality_checks(spool_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_status ON quality_checks(status);
CREATE INDEX IF NOT EXISTS idx_quality_checks_check_date ON quality_checks(check_date);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned_to ON equipment(assigned_to);
CREATE INDEX IF NOT EXISTS idx_equipment_code ON equipment(code);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE spools ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin and managers can manage projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
  );

-- Personnel policies
CREATE POLICY "Users can view personnel" ON personnel
  FOR SELECT USING (true);

CREATE POLICY "Admin and managers can manage personnel" ON personnel
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
  );

-- Spools policies
CREATE POLICY "Users can view spools" ON spools
  FOR SELECT USING (true);

CREATE POLICY "Users can manage spools" ON spools
  FOR ALL USING (true);

-- Work orders policies
CREATE POLICY "Users can view work orders" ON work_orders
  FOR SELECT USING (true);

CREATE POLICY "Users can manage work orders" ON work_orders
  FOR ALL USING (true);

-- Shipments policies
CREATE POLICY "Users can view shipments" ON shipments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage shipments" ON shipments
  FOR ALL USING (true);

-- Inventory policies
CREATE POLICY "Users can view inventory" ON inventory
  FOR SELECT USING (true);

CREATE POLICY "Users can manage inventory" ON inventory
  FOR ALL USING (true);

-- Inventory transactions policies
CREATE POLICY "Users can view inventory transactions" ON inventory_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create inventory transactions" ON inventory_transactions
  FOR INSERT WITH CHECK (true);

-- File uploads policies
CREATE POLICY "Users can view file uploads" ON file_uploads
  FOR SELECT USING (true);

CREATE POLICY "Users can upload files" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own files" ON file_uploads
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs policies (admin only)
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position = 'admin'
    )
  );

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = generated_by);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = generated_by);

-- Work hours policies
CREATE POLICY "Users can view work hours" ON work_hours
  FOR SELECT USING (true);

CREATE POLICY "Users can manage work hours" ON work_hours
  FOR ALL USING (true);

-- Material requests policies
CREATE POLICY "Users can view material requests" ON material_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can manage material requests" ON material_requests
  FOR ALL USING (true);

-- Material request items policies
CREATE POLICY "Users can view material request items" ON material_request_items
  FOR SELECT USING (true);

CREATE POLICY "Users can manage material request items" ON material_request_items
  FOR ALL USING (true);

-- Quality checks policies
CREATE POLICY "Users can view quality checks" ON quality_checks
  FOR SELECT USING (true);

CREATE POLICY "Users can manage quality checks" ON quality_checks
  FOR ALL USING (true);

-- Equipment policies
CREATE POLICY "Users can view equipment" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Admin and managers can manage equipment" ON equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
  );

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS trigger AS $$
DECLARE
    v_user_id uuid := null;
BEGIN
    -- Get user ID from JWT claims
    IF current_setting('request.jwt.claim.sub', true) IS NOT NULL THEN
        v_user_id := current_setting('request.jwt.claim.sub', true)::uuid;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs(table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id::text, 'INSERT', v_user_id, NULL, row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs(table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', v_user_id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs(table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', v_user_id, row_to_json(OLD), NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update inventory quantity based on transaction type
        IF NEW.transaction_type = 'in' THEN
            UPDATE inventory 
            SET quantity = quantity + NEW.quantity,
                last_updated = NOW()
            WHERE id = NEW.inventory_id;
        ELSIF NEW.transaction_type = 'out' THEN
            UPDATE inventory 
            SET quantity = quantity - NEW.quantity,
                last_updated = NOW()
            WHERE id = NEW.inventory_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if inventory is below minimum stock
    IF NEW.quantity <= NEW.min_stock THEN
        INSERT INTO notifications (title, message, type, user_id, entity_type, entity_id, priority)
        SELECT 
            'Düşük Stok Uyarısı',
            'Malzeme ' || NEW.name || ' minimum stok seviyesinin altına düştü. Mevcut: ' || NEW.quantity || ' ' || NEW.unit,
            'warning',
            p.id,
            'inventory',
            NEW.id,
            'high'
        FROM profiles p
        WHERE p.position IN ('admin', 'manager')
        AND EXISTS (
            SELECT 1 FROM notification_preferences np 
            WHERE np.user_id = p.id AND np.inventory_alerts = true
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spools_updated_at BEFORE UPDATE ON spools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_hours_updated_at BEFORE UPDATE ON work_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_requests_updated_at BEFORE UPDATE ON material_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_checks_updated_at BEFORE UPDATE ON quality_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- New user registration trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Audit triggers
CREATE TRIGGER trg_audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_projects
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_personnel
AFTER INSERT OR UPDATE OR DELETE ON personnel
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_spools
AFTER INSERT OR UPDATE OR DELETE ON spools
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_work_orders
AFTER INSERT OR UPDATE OR DELETE ON work_orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_shipments
AFTER INSERT OR UPDATE OR DELETE ON shipments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_inventory
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_inventory_transactions
AFTER INSERT OR UPDATE OR DELETE ON inventory_transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_file_uploads
AFTER INSERT OR UPDATE OR DELETE ON file_uploads
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_work_hours
AFTER INSERT OR UPDATE OR DELETE ON work_hours
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_material_requests
AFTER INSERT OR UPDATE OR DELETE ON material_requests
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_quality_checks
AFTER INSERT OR UPDATE OR DELETE ON quality_checks
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_equipment
AFTER INSERT OR UPDATE OR DELETE ON equipment
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Inventory transaction trigger
CREATE TRIGGER trg_update_inventory_quantity
AFTER INSERT ON inventory_transactions
FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();

-- Low stock notification trigger
CREATE TRIGGER trg_check_low_stock
AFTER UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ========================================
-- STORAGE CONFIGURATION
-- ========================================

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'uploads', 
  'uploads', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========================================
-- VIEWS FOR REPORTING
-- ========================================

-- Create view for spool progress
CREATE OR REPLACE VIEW spool_progress AS
SELECT 
  s.id,
  s.name,
  s.project_id,
  p.name as project_name,
  s.status,
  s.quantity,
  s.completed_quantity,
  CASE 
    WHEN s.quantity > 0 THEN ROUND((s.completed_quantity::decimal / s.quantity) * 100, 2)
    ELSE 0 
  END as progress_percentage,
  s.start_date,
  s.end_date,
  per.name as assigned_to_name
FROM spools s
LEFT JOIN projects p ON s.project_id = p.id
LEFT JOIN personnel per ON s.assigned_to = per.id;

-- Create view for inventory summary
CREATE OR REPLACE VIEW inventory_summary AS
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
    WHEN i.quantity <= i.min_stock THEN 'low'
    WHEN i.quantity <= (i.min_stock * 1.5) THEN 'warning'
    ELSE 'normal'
  END as stock_status,
  i.location,
  i.supplier,
  p.name as project_name
FROM inventory i
LEFT JOIN projects p ON i.project_id = p.id;

-- Create view for work order summary
CREATE OR REPLACE VIEW work_order_summary AS
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
  per.name as assigned_to_name,
  s.name as spool_name,
  wo.estimated_hours,
  wo.actual_hours
FROM work_orders wo
LEFT JOIN projects p ON wo.project_id = p.id
LEFT JOIN personnel per ON wo.assigned_to = per.id
LEFT JOIN spools s ON wo.spool_id = s.id;

-- Create view for personnel workload
CREATE OR REPLACE VIEW personnel_workload AS
SELECT 
  per.id,
  per.name,
  per.department,
  per.position,
  COUNT(DISTINCT s.id) as assigned_spools,
  COUNT(DISTINCT wo.id) as assigned_work_orders,
  SUM(wh.hours_worked) as total_hours_worked,
  AVG(wh.hours_worked) as avg_hours_per_day
FROM personnel per
LEFT JOIN spools s ON per.id = s.assigned_to
LEFT JOIN work_orders wo ON per.id = wo.assigned_to
LEFT JOIN work_hours wh ON per.id = wh.personnel_id
WHERE per.status = 'active'
GROUP BY per.id, per.name, per.department, per.position;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE profiles IS 'Kullanıcı profilleri ve yetki bilgileri';
COMMENT ON TABLE projects IS 'Proje bilgileri ve yönetimi';
COMMENT ON TABLE personnel IS 'Personel bilgileri ve departman yönetimi';
COMMENT ON TABLE spools IS 'Spool takibi ve üretim süreçleri';
COMMENT ON TABLE work_orders IS 'İş emirleri ve görev yönetimi';
COMMENT ON TABLE shipments IS 'Sevkiyat takibi ve lojistik';
COMMENT ON TABLE inventory IS 'Envanter yönetimi ve stok takibi';
COMMENT ON TABLE inventory_transactions IS 'Envanter hareketleri ve işlem geçmişi';
COMMENT ON TABLE file_uploads IS 'Dosya yükleme ve belge yönetimi';
COMMENT ON TABLE notifications IS 'Bildirim sistemi';
COMMENT ON TABLE audit_logs IS 'Sistem audit logları ve güvenlik';
COMMENT ON TABLE work_hours IS 'Çalışma saatleri takibi';
COMMENT ON TABLE material_requests IS 'Malzeme talep sistemi';
COMMENT ON TABLE quality_checks IS 'Kalite kontrol süreçleri';
COMMENT ON TABLE equipment IS 'Ekipman ve makine yönetimi';

-- ========================================
-- END OF SCHEMA
-- ======================================== 