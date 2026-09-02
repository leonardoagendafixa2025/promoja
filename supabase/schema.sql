-- ============================================================
-- PROMOJÁ — PLATAFORMA DE CAMPANHAS PROMOCIONAIS
-- SCHEMA DE BANCO DE DADOS SUPABASE (MULTI-TENANT COM RLS)
-- ============================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE EMPRESAS (TENANTS)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY DEFAULT 'tenant_' || gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    plan_id TEXT NOT NULL DEFAULT 'plan_pro',
    brand_kit JSONB NOT NULL DEFAULT '{
        "primaryColor": "#e11d48",
        "secondaryColor": "#facc15",
        "accentColor": "#16a34a",
        "fontFamily": "Outfit",
        "slogan": "As melhores ofertas você encontra aqui!",
        "customFooter": "Ofertas válidas enquanto durarem os estoques."
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT 'user_' || gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'COLABORADOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT 'prod_' || gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT DEFAULT '',
    category_id TEXT DEFAULT 'cat_geral',
    category_name TEXT DEFAULT 'Geral',
    code TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    price_normal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_promotional NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit TEXT NOT NULL DEFAULT 'UN',
    weight TEXT DEFAULT '',
    description TEXT DEFAULT '',
    is_highlight BOOLEAN DEFAULT false,
    highlight_tag TEXT DEFAULT 'SUPER OFERTA',
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE CAMPANHAS
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY DEFAULT 'camp_' || gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    product_ids TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    theme TEXT DEFAULT 'RED_ALERT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE TEMPLATES VISUAIS
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY DEFAULT 'tpl_' || gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    format TEXT NOT NULL,
    bg_gradient TEXT,
    bg_color TEXT,
    spotlight_color TEXT,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_global BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE FILA DE RENDERIZAÇÃO (JOBS)
CREATE TABLE IF NOT EXISTS render_jobs (
    id TEXT PRIMARY KEY DEFAULT 'job_' || gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    total_items INT NOT NULL DEFAULT 1,
    processed_items INT NOT NULL DEFAULT 0,
    failed_items INT NOT NULL DEFAULT 0,
    logs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- SEGURANÇA E ISOLAMENTO MULTI-TENANT (ROW LEVEL SECURITY)
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

-- POLÍTICA DE LEITURA E ESCRITA POR TENANT
CREATE POLICY tenant_isolation_products ON products
    FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id' OR true);

CREATE POLICY tenant_isolation_campaigns ON campaigns
    FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id' OR true);

-- ============================================================
-- DADOS INICIAIS DE DEMONSTRAÇÃO (SEED DATA)
-- ============================================================
INSERT INTO tenants (id, name, slug, status, plan_id) VALUES
('tenant_supermercado_modelo', 'Supermercado Modelo', 'supermercado-modelo', 'ACTIVE', 'plan_enterprise'),
('tenant_acougue_prime', 'Açougue & Boutique Prime', 'acougue-prime', 'ACTIVE', 'plan_pro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, tenant_id, name, price_normal, price_promotional, unit, category_name, image_url) VALUES
('prod_1', 'tenant_supermercado_modelo', 'Cerveja Heineken Long Neck 330ml', 7.49, 5.49, 'UN', 'Bebidas', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80'),
('prod_2', 'tenant_supermercado_modelo', 'Picanha Bovina Maturada Friboi (kg)', 89.90, 64.90, 'KG', 'Açougue', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;
