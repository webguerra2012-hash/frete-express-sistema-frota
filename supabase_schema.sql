
-- 1. Habilitar extensão para geração de IDs únicos (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Limpar tabelas existentes para garantir compatibilidade
DROP TABLE IF EXISTS maintenance_items;
DROP TABLE IF EXISTS maintenances;
DROP TABLE IF EXISTS occurrences;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS settings;

-- 3. Tabela de Veículos
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Manutenções
CREATE TABLE maintenances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  repair_type TEXT NOT NULL,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  labor_cost NUMERIC(10, 2) DEFAULT 0,
  warranty TEXT,
  nf_url TEXT,
  total_parts NUMERIC(10, 2) DEFAULT 0,
  total_service NUMERIC(10, 2) DEFAULT 0,
  total_cost NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Itens/Peças da Manutenção
CREATE TABLE maintenance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_id UUID REFERENCES maintenances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10, 2) DEFAULT 0
);

-- 6. Tabela de Ocorrências
CREATE TABLE occurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('Baixa', 'Média', 'Alta')),
  photo_url TEXT,
  status TEXT DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Fechada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Usuários (Corrigida com Password e Vehicle Link)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'motorista' CHECK (role IN ('admin', 'colaborador', 'motorista')),
  assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Configurações
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- 9. Inserir valores iniciais
INSERT INTO settings (key, value) VALUES 
('company_name', 'Frete Express Rio'),
('logo_url', 'https://via.placeholder.com/150?text=FRETE+RIO');

-- Usuario admin inicial para primeiro acesso
INSERT INTO user_profiles (name, email, password, role) VALUES 
('Administrador', 'admin@freteexpress.com', 'admin123', 'admin');

-- 10. Desabilitar RLS
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE occurrences DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
