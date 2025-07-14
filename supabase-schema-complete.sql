-- Ürün Alt Kalemi Takip Sistemi - Tam Supabase Şeması
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

-- Create personnel table (profiles tablosu ile ayrı - eski sistem için)
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
-- ÜRÜN ALT KALEMİ MANAGEMENT
-- ========================================

-- Create urun_alt_kalemi table (eski spools tablosu)
CREATE TABLE IF NOT EXISTS urun_alt_kalemi (
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
  urun_alt_kalemi_id UUID REFERENCES urun_alt_kalemi(id) ON DELETE CASCADE,
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
-- FILE UPLOADS
-- ========================================

-- Create file_uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('urun_alt_kalemi', 'project', 'personnel', 'work_order', 'shipment', 'inventory')),
  entity_id UUID NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- NOTIFICATIONS
-- ========================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  project_updates BOOLEAN DEFAULT TRUE,
  urun_alt_kalemi_updates BOOLEAN DEFAULT TRUE,
  work_order_updates BOOLEAN DEFAULT TRUE,
  shipment_updates BOOLEAN DEFAULT TRUE,
  inventory_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AUDIT LOGS
-- ========================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REPORTS
-- ========================================

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('project', 'urun_alt_kalemi', 'personnel', 'inventory', 'shipment', 'work_order')),
  parameters JSONB,
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WORK HOURS
-- ========================================

-- Create work_hours table
CREATE TABLE IF NOT EXISTS work_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  urun_alt_kalemi_id UUID REFERENCES urun_alt_kalemi(id) ON DELETE SET NULL,
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  hours_worked DECIMAL(4,2),
  break_time DECIMAL(3,2) DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
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
  urun_alt_kalemi_id UUID REFERENCES urun_alt_kalemi(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
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
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- QUALITY CHECKS
-- ========================================

-- Create quality_checks table
CREATE TABLE IF NOT EXISTS quality_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  urun_alt_kalemi_id UUID REFERENCES urun_alt_kalemi(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES profiles(id),
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'conditional')),
  notes TEXT,
  measurements JSONB,
  photos TEXT[],
  next_check_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- EQUIPMENT
-- ========================================

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  model TEXT,
  serial_number TEXT,
  manufacturer TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  assigned_to UUID REFERENCES personnel(id),
  location TEXT,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_notes TEXT,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
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

-- Ürün Alt Kalemi indexes
CREATE INDEX IF NOT EXISTS idx_urun_alt_kalemi_project_id ON urun_alt_kalemi(project_id);
CREATE INDEX IF NOT EXISTS idx_urun_alt_kalemi_assigned_to ON urun_alt_kalemi(assigned_to);
CREATE INDEX IF NOT EXISTS idx_urun_alt_kalemi_status ON urun_alt_kalemi(status);
CREATE INDEX IF NOT EXISTS idx_urun_alt_kalemi_start_date ON urun_alt_kalemi(start_date);

-- Work Orders indexes
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

-- Inventory Transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- File Uploads indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Work Hours indexes
CREATE INDEX IF NOT EXISTS idx_work_hours_personnel_id ON work_hours(personnel_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_project_id ON work_hours(project_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_start_time ON work_hours(start_time);

-- Material Requests indexes
CREATE INDEX IF NOT EXISTS idx_material_requests_project_id ON material_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(status);
CREATE INDEX IF NOT EXISTS idx_material_requests_requested_by ON material_requests(requested_by);

-- Quality Checks indexes
CREATE INDEX IF NOT EXISTS idx_quality_checks_urun_alt_kalemi_id ON quality_checks(urun_alt_kalemi_id);
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
ALTER TABLE urun_alt_kalemi ENABLE ROW LEVEL SECURITY;
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

-- ========================================
-- RLS POLICIES
-- ========================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position = 'admin'
    )
  );

-- Projects policies
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
  );

-- Personnel policies
CREATE POLICY "Users can view personnel" ON personnel
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage personnel" ON personnel
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position IN ('admin', 'manager')
    )
  );

-- Ürün Alt Kalemi policies
CREATE POLICY "Users can view urun_alt_kalemi" ON urun_alt_kalemi
  FOR SELECT USING (true);

CREATE POLICY "Users can manage urun_alt_kalemi" ON urun_alt_kalemi
  FOR ALL USING (true);

-- Work Orders policies
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

-- Inventory Transactions policies
CREATE POLICY "Users can view inventory transactions" ON inventory_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage inventory transactions" ON inventory_transactions
  FOR ALL USING (true);

-- File Uploads policies
CREATE POLICY "Users can view file uploads" ON file_uploads
  FOR SELECT USING (true);

CREATE POLICY "Users can manage file uploads" ON file_uploads
  FOR ALL USING (true);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Notification Preferences policies
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs policies (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND position = 'admin'
    )
  );

-- Reports policies
CREATE POLICY "Users can view public reports" ON reports
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their own reports" ON reports
  FOR ALL USING (created_by = auth.uid());

-- Work Hours policies
CREATE POLICY "Users can view work hours" ON work_hours
  FOR SELECT USING (true);

CREATE POLICY "Users can manage work hours" ON work_hours
  FOR ALL USING (true);

-- Material Requests policies
CREATE POLICY "Users can view material requests" ON material_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can manage material requests" ON material_requests
  FOR ALL USING (true);

-- Material Request Items policies
CREATE POLICY "Users can view material request items" ON material_request_items
  FOR SELECT USING (true);

CREATE POLICY "Users can manage material request items" ON material_request_items
  FOR ALL USING (true);

-- Quality Checks policies
CREATE POLICY "Users can view quality checks" ON quality_checks
  FOR SELECT USING (true);

CREATE POLICY "Users can manage quality checks" ON quality_checks
  FOR ALL USING (true);

-- Equipment policies
CREATE POLICY "Users can view equipment" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Users can manage equipment" ON equipment
  FOR ALL USING (true);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
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
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.min_stock THEN
    INSERT INTO notifications (user_id, title, message, type)
    SELECT 
      p.id,
      'Düşük Stok Uyarısı',
      'Ürün ' || NEW.name || ' stok seviyesi kritik seviyede: ' || NEW.quantity || ' ' || NEW.unit,
      'warning'
    FROM profiles p
    WHERE p.position IN ('admin', 'manager');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- TRIGGERS
-- ========================================

-- Update triggers for updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urun_alt_kalemi_updated_at BEFORE UPDATE ON urun_alt_kalemi
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

-- Auth user creation trigger
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

CREATE TRIGGER trg_audit_urun_alt_kalemi
AFTER INSERT OR UPDATE OR DELETE ON urun_alt_kalemi
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

-- Inventory triggers
CREATE TRIGGER trg_update_inventory_quantity
AFTER INSERT ON inventory_transactions
FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();

CREATE TRIGGER trg_check_low_stock
AFTER UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ========================================
-- VIEWS
-- ========================================

-- Create view for urun_alt_kalemi progress
CREATE OR REPLACE VIEW urun_alt_kalemi_progress AS
SELECT 
  uak.id,
  uak.name,
  uak.status,
  uak.quantity,
  uak.completed_quantity,
  CASE 
    WHEN uak.quantity > 0 THEN 
      ROUND((uak.completed_quantity::DECIMAL / uak.quantity::DECIMAL) * 100, 2)
    ELSE 0 
  END as progress_percentage,
  p.name as project_name,
  per.name as assigned_personnel,
  uak.start_date,
  uak.end_date,
  uak.created_at
FROM urun_alt_kalemi uak
LEFT JOIN projects p ON uak.project_id = p.id
LEFT JOIN personnel per ON uak.assigned_to = per.id;

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
  i.location,
  i.status,
  CASE 
    WHEN i.quantity <= i.min_stock THEN 'Low Stock'
    WHEN i.quantity >= i.max_stock THEN 'Overstocked'
    ELSE 'Normal'
  END as stock_status,
  i.last_updated,
  p.name as project_name
FROM inventory i
LEFT JOIN projects p ON i.project_id = p.id;

-- Create view for work order summary
CREATE OR REPLACE VIEW work_order_summary AS
SELECT 
  wo.id,
  wo.number,
  wo.title,
  wo.status,
  wo.priority,
  wo.start_date,
  wo.due_date,
  wo.completed_date,
  wo.estimated_hours,
  wo.actual_hours,
  p.name as project_name,
  uak.name as urun_alt_kalemi_name,
  per.name as assigned_personnel
FROM work_orders wo
LEFT JOIN projects p ON wo.project_id = p.id
LEFT JOIN urun_alt_kalemi uak ON wo.urun_alt_kalemi_id = uak.id
LEFT JOIN personnel per ON wo.assigned_to = per.id;

-- Create view for personnel workload
CREATE OR REPLACE VIEW personnel_workload AS
SELECT 
  per.id,
  per.name,
  per.department,
  per.position,
  COUNT(DISTINCT uak.id) as assigned_urun_alt_kalemi,
  COUNT(DISTINCT wo.id) as assigned_work_orders,
  SUM(wh.hours_worked) as total_hours_worked,
  AVG(wh.hours_worked) as avg_hours_per_day
FROM personnel per
LEFT JOIN urun_alt_kalemi uak ON per.id = uak.assigned_to
LEFT JOIN work_orders wo ON per.id = wo.assigned_to
LEFT JOIN work_hours wh ON per.id = wh.personnel_id
GROUP BY per.id, per.name, per.department, per.position;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE profiles IS 'Kullanıcı profilleri ve kimlik doğrulama bilgileri';
COMMENT ON TABLE projects IS 'Proje yönetimi ve takibi';
COMMENT ON TABLE personnel IS 'Personel bilgileri ve yönetimi';
COMMENT ON TABLE urun_alt_kalemi IS 'Ürün alt kalemi takibi ve üretim süreçleri';
COMMENT ON TABLE work_orders IS 'İş emirleri ve görev yönetimi';
COMMENT ON TABLE shipments IS 'Sevkiyat ve lojistik yönetimi';
COMMENT ON TABLE inventory IS 'Envanter ve stok yönetimi';
COMMENT ON TABLE inventory_transactions IS 'Envanter hareketleri ve işlemleri';
COMMENT ON TABLE file_uploads IS 'Dosya yükleme ve belge yönetimi';
COMMENT ON TABLE notifications IS 'Bildirim sistemi';
COMMENT ON TABLE notification_preferences IS 'Bildirim tercihleri';
COMMENT ON TABLE audit_logs IS 'Sistem denetim kayıtları';
COMMENT ON TABLE reports IS 'Rapor yönetimi';
COMMENT ON TABLE work_hours IS 'Çalışma saatleri takibi';
COMMENT ON TABLE material_requests IS 'Malzeme talepleri';
COMMENT ON TABLE material_request_items IS 'Malzeme talep detayları';
COMMENT ON TABLE quality_checks IS 'Kalite kontrol süreçleri';
COMMENT ON TABLE equipment IS 'Ekipman ve makine yönetimi';

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert sample project
INSERT INTO projects (name, description, status, start_date, client_name, priority) 
VALUES ('Örnek Proje', 'Test projesi', 'active', CURRENT_DATE, 'Test Müşteri', 'medium')
ON CONFLICT DO NOTHING;

-- Insert sample personnel
INSERT INTO personnel (name, email, department, position, status) 
VALUES ('Test Personel', 'test@example.com', 'Üretim', 'Teknisyen', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (name, code, category, type, quantity, unit, min_stock, max_stock, location, supplier, cost, status) 
VALUES ('Test Malzeme', 'TM001', 'Hammadde', 'raw_material', 100, 'adet', 10, 200, 'Depo A', 'Test Tedarikçi', 50.00, 'active')
ON CONFLICT DO NOTHING; 