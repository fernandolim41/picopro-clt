-- Tabela de Perfis (Profissionais e Empresas)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  is_company BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  cpf_cnpj TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Empresas (Detalhes adicionais para is_company = TRUE)
CREATE TABLE companies (
  profile_id uuid REFERENCES profiles (id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  company_name TEXT,
  address TEXT,
  contact_email TEXT
);

-- Tabela de Profissionais (Detalhes adicionais para is_company = FALSE)
CREATE TABLE professionals (
  profile_id uuid REFERENCES profiles (id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  bio TEXT,
  skills TEXT[], -- Ex: ['Cozinheiro', 'Garçom', 'Logística']
  certifications TEXT[], -- Ex: ['NR-10', 'Curso de Manipulação de Alimentos']
  is_available BOOLEAN DEFAULT TRUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- Tabela de Vagas/Picos de Demanda (Jobs)
CREATE TABLE jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies (profile_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required_skill TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  location_address TEXT NOT NULL,
  location_latitude DOUBLE PRECISION NOT NULL,
  location_longitude DOUBLE PRECISION NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'open' -- 'open', 'matching', 'closed'
);

-- Tabela de Convocações (Match entre Job e Profissional)
CREATE TABLE convocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs (id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES professionals (profile_id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies (profile_id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'started', 'completed', 'paid'
  convocation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acceptance_deadline TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE, -- Check-in (Biometria/Facial)
  end_time TIMESTAMP WITH TIME ZONE, -- Check-out (Biometria/Facial)
  total_payment NUMERIC(10, 2),
  UNIQUE (job_id, professional_id)
);

-- Tabela de Documentos Legais (Contratos e Termos)
CREATE TABLE legal_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  convocation_id uuid REFERENCES convocations (id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'contract', 'term_of_convocation'
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE convocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (Exemplo Básico - A ser refinado)
-- Perfis
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Empresas
CREATE POLICY "Companies can view their own details" ON companies FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Companies can update their own details" ON companies FOR UPDATE USING (auth.uid() = profile_id);

-- Profissionais
CREATE POLICY "Professionals can view their own details" ON professionals FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Professionals can update their own details" ON professionals FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "All users can view professional location (for matching)" ON professionals FOR SELECT USING (TRUE); -- Simplificado para o match

-- Vagas
CREATE POLICY "Companies can insert jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Companies can view their own jobs" ON jobs FOR SELECT USING (auth.uid() = company_id);
CREATE POLICY "Professionals can view open jobs" ON jobs FOR SELECT USING (status = 'open');

-- Convocações
CREATE POLICY "Users can view their own convocations" ON convocations FOR SELECT USING (auth.uid() = professional_id OR auth.uid() = company_id);
CREATE POLICY "Professionals can update their convocation status (accept/reject)" ON convocations FOR UPDATE USING (auth.uid() = professional_id AND status = 'pending');

-- Funções para Geolocalização (Exemplo de função que seria implementada no Supabase)
-- CREATE EXTENSION IF NOT EXISTS postgis; -- Se o PostGIS estiver disponível

-- CREATE OR REPLACE FUNCTION find_nearby_professionals(
--     p_latitude DOUBLE PRECISION,
--     p_longitude DOUBLE PRECISION,
--     p_radius_km INTEGER,
--     p_skill TEXT
-- )
-- RETURNS SETOF professionals
-- LANGUAGE sql
-- AS $$
--     SELECT *
--     FROM professionals
--     WHERE
--         is_available = TRUE AND
--         p_skill = ANY(skills) AND
--         ST_DWithin(
--             ST_MakePoint(longitude, latitude)::geography,
--             ST_MakePoint(p_longitude, p_latitude)::geography,
--             p_radius_km * 1000 -- Converte km para metros
--         )
-- $$;

-- Trigger para criar o registro de company ou professional após a criação do auth.user
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, full_name, avatar_url)
--   VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
