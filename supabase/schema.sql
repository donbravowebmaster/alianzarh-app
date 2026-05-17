-- ─── Tipos ENUM ───────────────────────────────────────────────────────────────
CREATE TYPE vacante_estado AS ENUM ('activa', 'pausada', 'cerrada', 'cancelada');
CREATE TYPE candidato_estado AS ENUM ('activo', 'contratado', 'descartado');
CREATE TYPE etapa_pipeline AS ENUM (
  'prospecto',
  'entrevista_inicial',
  'entrevista_cliente',
  'oferta',
  'contratado',
  'descartado'
);

-- ─── Empresas ─────────────────────────────────────────────────────────────────
CREATE TABLE empresas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL,
  industria        TEXT,
  contacto_nombre  TEXT,
  contacto_email   TEXT,
  contacto_telefono TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Vacantes ─────────────────────────────────────────────────────────────────
CREATE TABLE vacantes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  sueldo_minimo   NUMERIC(12, 2),
  sueldo_maximo   NUMERIC(12, 2),
  estado          vacante_estado NOT NULL DEFAULT 'activa',
  descripcion     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Candidatos ───────────────────────────────────────────────────────────────
CREATE TABLE candidatos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  apellido     TEXT NOT NULL,
  email        TEXT,
  telefono     TEXT,
  linkedin_url TEXT,
  cv_url       TEXT,
  estado       candidato_estado NOT NULL DEFAULT 'activo',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Pipeline (relación N:M candidatos ↔ vacantes) ───────────────────────────
CREATE TABLE candidatos_vacantes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id  UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  vacante_id    UUID NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
  etapa         etapa_pipeline NOT NULL DEFAULT 'prospecto',
  notas         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidato_id, vacante_id)
);

-- ─── Trigger: updated_at automático ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vacantes_updated_at
  BEFORE UPDATE ON vacantes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_candidatos_updated_at
  BEFORE UPDATE ON candidatos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_candidatos_vacantes_updated_at
  BEFORE UPDATE ON candidatos_vacantes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RLS: solo usuarios autenticados ─────────────────────────────────────────
ALTER TABLE empresas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacantes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos_vacantes ENABLE ROW LEVEL SECURITY;

-- Política: acceso completo solo a usuarios autenticados (uso interno)
CREATE POLICY "authenticated_full_access" ON empresas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON vacantes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON candidatos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON candidatos_vacantes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
