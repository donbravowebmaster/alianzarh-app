-- ─── Script de Migración: Tabla de Leads ───────────────────────────────────────
-- Puedes copiar y pegar este script directamente en el Editor de SQL de tu panel de Supabase.

-- 1. Crear la tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre               TEXT NOT NULL,
  apellido             TEXT NOT NULL,
  empresa_razon_social TEXT NOT NULL,
  telefono             TEXT,
  email                TEXT,
  sector               TEXT,
  origen               TEXT NOT NULL, -- 'sitio_web', 'meta_ads', 'google_ads', 'linkedin_ads', etc.
  estado               TEXT NOT NULL DEFAULT 'nuevo', -- 'nuevo', 'contactado', 'en_negociacion', 'ganado', 'perdido'
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Vincular el trigger para actualización automática del campo updated_at
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Habilitar la seguridad a nivel de fila (Row Level Security - RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 4. Crear la política de acceso completo para usuarios autenticados (CRM Interno)
CREATE POLICY "authenticated_full_access" ON leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Crear la política de inserción pública y anónima (Campaña de Meta, Google, LinkedIn y sitio web)
CREATE POLICY "anonymous_insert" ON leads
  FOR INSERT TO anon WITH CHECK (true);
