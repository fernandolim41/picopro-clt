-- Schema corrigido do Picopro para Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se as tabelas já existem e fazer as correções necessárias

-- Tabela de Perfis (Base para Empresas e Profissionais)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE, -- Adicionando coluna email que estava faltando
  is_company BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  cpf_cnpj TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna email se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
    END IF;
END $$;

-- Adicionar coluna updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Tabela de Empresas (Detalhes adicionais para is_company = TRUE)
CREATE TABLE IF NOT EXISTS companies (
  profile_id uuid REFERENCES profiles (id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  company_name TEXT,
  address TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Profissionais (Detalhes adicionais para is_company = FALSE)
CREATE TABLE IF NOT EXISTS professionals (
  profile_id uuid REFERENCES profiles (id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  bio TEXT,
  skills TEXT[], -- Ex: ['Cozinheiro', 'Garçom', 'Logística']
  certifications TEXT[], -- Ex: ['NR-10', 'Curso de Manipulação de Alimentos']
  is_available BOOLEAN DEFAULT TRUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vagas/Picos de Demanda (Jobs)
CREATE TABLE IF NOT EXISTS jobs (
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
  status TEXT DEFAULT 'open', -- 'open', 'matching', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Convocações (Match entre Job e Profissional)
CREATE TABLE IF NOT EXISTS convocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs (id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES professionals (profile_id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies (profile_id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'started', 'completed', 'paid'
  convocation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acceptance_deadline TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  total_payment NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Documentos Legais
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  convocation_id uuid REFERENCES convocations (id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'contract', 'term_of_convocation', 'payment_receipt'
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE convocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas de Segurança para companies
DROP POLICY IF EXISTS "Companies can manage own data" ON companies;
CREATE POLICY "Companies can manage own data" ON companies
    FOR ALL USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Public can view companies" ON companies;
CREATE POLICY "Public can view companies" ON companies
    FOR SELECT USING (true);

-- Políticas de Segurança para professionals
DROP POLICY IF EXISTS "Professionals can manage own data" ON professionals;
CREATE POLICY "Professionals can manage own data" ON professionals
    FOR ALL USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Public can view available professionals" ON professionals;
CREATE POLICY "Public can view available professionals" ON professionals
    FOR SELECT USING (is_available = true);

-- Políticas de Segurança para jobs
DROP POLICY IF EXISTS "Companies can manage own jobs" ON jobs;
CREATE POLICY "Companies can manage own jobs" ON jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.profile_id = auth.uid() 
            AND companies.profile_id = jobs.company_id
        )
    );

DROP POLICY IF EXISTS "Public can view open jobs" ON jobs;
CREATE POLICY "Public can view open jobs" ON jobs
    FOR SELECT USING (status = 'open');

-- Políticas de Segurança para convocations
DROP POLICY IF EXISTS "Users can view own convocations" ON convocations;
CREATE POLICY "Users can view own convocations" ON convocations
    FOR SELECT USING (
        auth.uid() = professional_id OR 
        auth.uid() = company_id
    );

DROP POLICY IF EXISTS "Companies can create convocations" ON convocations;
CREATE POLICY "Companies can create convocations" ON convocations
    FOR INSERT WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Users can update own convocations" ON convocations;
CREATE POLICY "Users can update own convocations" ON convocations
    FOR UPDATE USING (
        auth.uid() = professional_id OR 
        auth.uid() = company_id
    );

-- Políticas de Segurança para legal_documents
DROP POLICY IF EXISTS "Users can view own documents" ON legal_documents;
CREATE POLICY "Users can view own documents" ON legal_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM convocations 
            WHERE convocations.id = legal_documents.convocation_id 
            AND (convocations.professional_id = auth.uid() OR convocations.company_id = auth.uid())
        )
    );

-- Inserir dados de demonstração
INSERT INTO profiles (id, email, is_company, full_name, cpf_cnpj, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'empresa@demo.com', true, 'Empresa Demo Ltda', '12.345.678/0001-90', '(11) 99999-9999'),
('22222222-2222-2222-2222-222222222222', 'profissional@demo.com', false, 'João Silva', '123.456.789-00', '(11) 88888-8888')
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (profile_id, company_name, address, contact_email) VALUES
('11111111-1111-1111-1111-111111111111', 'Empresa Demo Ltda', 'Rua das Empresas, 123 - São Paulo, SP', 'contato@empresademo.com')
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO professionals (profile_id, bio, skills, certifications, is_available, latitude, longitude) VALUES
('22222222-2222-2222-2222-222222222222', 'Profissional experiente em diversas áreas', ARRAY['Cozinheiro', 'Garçom', 'Atendimento'], ARRAY['Curso de Manipulação de Alimentos', 'Atendimento ao Cliente'], true, -23.5505, -46.6333)
ON CONFLICT (profile_id) DO NOTHING;

-- Criar alguns jobs de exemplo
INSERT INTO jobs (id, company_id, title, description, required_skill, duration_hours, location_address, location_latitude, location_longitude, hourly_rate) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Cozinheiro para Evento', 'Precisamos de um cozinheiro experiente para evento corporativo', 'Cozinheiro', 6, 'Av. Paulista, 1000 - São Paulo, SP', -23.5618, -46.6565, 25.00),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Garçom para Restaurante', 'Vaga para garçom em restaurante movimentado', 'Garçom', 8, 'Rua Augusta, 500 - São Paulo, SP', -23.5505, -46.6333, 20.00)
ON CONFLICT (id) DO NOTHING;

-- Função para sincronizar email do auth.users com profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente quando usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Atualizar emails existentes baseado no auth.users
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id 
AND profiles.email IS NULL;
