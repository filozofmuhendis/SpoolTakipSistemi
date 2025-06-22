-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'pending')) DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spools table
CREATE TABLE spools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  completed_quantity INTEGER DEFAULT 0 CHECK (completed_quantity >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personnel table
CREATE TABLE personnel (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
  hire_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_orders table
CREATE TABLE work_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES personnel(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipments table
CREATE TABLE shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  destination TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  carrier TEXT NOT NULL,
  tracking_number TEXT,
  total_weight DECIMAL(10,2) NOT NULL CHECK (total_weight > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_spools_project_id ON spools(project_id);
CREATE INDEX idx_spools_assigned_to ON spools(assigned_to);
CREATE INDEX idx_spools_status ON spools(status);
CREATE INDEX idx_work_orders_project_id ON work_orders(project_id);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_shipments_project_id ON shipments(project_id);
CREATE INDEX idx_shipments_status ON shipments(status);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE spools ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects policies
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers and admins can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Spools policies
CREATE POLICY "Users can view all spools" ON spools
  FOR SELECT USING (true);

CREATE POLICY "Users can create spools" ON spools
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update spools" ON spools
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete spools" ON spools
  FOR DELETE USING (true);

-- Personnel policies
CREATE POLICY "Users can view all personnel" ON personnel
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can create personnel" ON personnel
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers and admins can update personnel" ON personnel
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete personnel" ON personnel
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Work orders policies
CREATE POLICY "Users can view all work orders" ON work_orders
  FOR SELECT USING (true);

CREATE POLICY "Users can create work orders" ON work_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update work orders" ON work_orders
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete work orders" ON work_orders
  FOR DELETE USING (true);

-- Shipments policies
CREATE POLICY "Users can view all shipments" ON shipments
  FOR SELECT USING (true);

CREATE POLICY "Users can create shipments" ON shipments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update shipments" ON shipments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete shipments" ON shipments
  FOR DELETE USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spools_updated_at BEFORE UPDATE ON spools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Kullanıcı'), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample data
INSERT INTO profiles (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'manager@example.com', 'Manager User', 'manager'),
  ('00000000-0000-0000-0000-000000000003', 'user@example.com', 'Regular User', 'user');

INSERT INTO projects (name, status, start_date, end_date, manager_id, description) VALUES
  ('Petrokimya Projesi', 'active', '2024-01-15', '2024-06-30', '00000000-0000-0000-0000-000000000002', 'Büyük ölçekli petrokimya tesisi projesi'),
  ('Gaz Boru Hattı', 'pending', '2024-03-01', '2024-12-31', '00000000-0000-0000-0000-000000000002', 'Doğal gaz boru hattı inşaat projesi'),
  ('Rafineri Modernizasyonu', 'completed', '2023-09-01', '2024-02-28', '00000000-0000-0000-0000-000000000001', 'Mevcut rafineri modernizasyon projesi');

INSERT INTO personnel (name, email, phone, position, department, status, hire_date) VALUES
  ('Ahmet Yılmaz', 'ahmet.yilmaz@company.com', '+90 555 123 4567', 'Mühendis', 'Üretim', 'active', '2023-01-15'),
  ('Fatma Demir', 'fatma.demir@company.com', '+90 555 234 5678', 'Teknisyen', 'Kalite Kontrol', 'active', '2023-03-20'),
  ('Mehmet Kaya', 'mehmet.kaya@company.com', '+90 555 345 6789', 'Operatör', 'Üretim', 'active', '2022-11-10'),
  ('Ayşe Özkan', 'ayse.ozkan@company.com', '+90 555 456 7890', 'Mühendis', 'Proje Yönetimi', 'on_leave', '2023-06-01');

INSERT INTO work_orders (number, project_id, status, priority, assigned_to, start_date, due_date, description) VALUES
  ('WO-2024-001', (SELECT id FROM projects WHERE name = 'Petrokimya Projesi'), 'active', 'high', (SELECT id FROM personnel WHERE name = 'Ahmet Yılmaz'), '2024-01-20', '2024-02-15', 'Ana boru hattı montajı'),
  ('WO-2024-002', (SELECT id FROM projects WHERE name = 'Petrokimya Projesi'), 'pending', 'medium', (SELECT id FROM personnel WHERE name = 'Fatma Demir'), '2024-02-01', '2024-02-28', 'Kalite kontrol testleri'),
  ('WO-2024-003', (SELECT id FROM projects WHERE name = 'Gaz Boru Hattı'), 'active', 'urgent', (SELECT id FROM personnel WHERE name = 'Mehmet Kaya'), '2024-03-05', '2024-03-20', 'Acil boru değişimi');

INSERT INTO shipments (number, project_id, status, priority, destination, scheduled_date, carrier, total_weight) VALUES
  ('SH-2024-001', (SELECT id FROM projects WHERE name = 'Petrokimya Projesi'), 'in_transit', 'high', 'İstanbul', '2024-02-10', 'ABC Kargo', 2500.50),
  ('SH-2024-002', (SELECT id FROM projects WHERE name = 'Gaz Boru Hattı'), 'pending', 'medium', 'Ankara', '2024-03-15', 'XYZ Lojistik', 1800.75),
  ('SH-2024-003', (SELECT id FROM projects WHERE name = 'Rafineri Modernizasyonu'), 'delivered', 'low', 'İzmir', '2024-01-25', 'DEF Nakliye', 3200.00);

INSERT INTO spools (name, project_id, status, assigned_to, quantity, completed_quantity, start_date) VALUES
  ('SP-001', (SELECT id FROM projects WHERE name = 'Petrokimya Projesi'), 'active', '00000000-0000-0000-0000-000000000003', 100, 75, '2024-01-20'),
  ('SP-002', (SELECT id FROM projects WHERE name = 'Petrokimya Projesi'), 'pending', '00000000-0000-0000-0000-000000000003', 50, 0, '2024-02-01'),
  ('SP-003', (SELECT id FROM projects WHERE name = 'Gaz Boru Hattı'), 'completed', '00000000-0000-0000-0000-000000000002', 200, 200, '2024-03-01'); 