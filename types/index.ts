// ─── Supabase DB Types ────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nombre: string
          industria: string | null
          contacto_nombre: string | null
          contacto_email: string | null
          contacto_telefono: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['empresas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['empresas']['Insert']>
      }
      vacantes: {
        Row: {
          id: string
          empresa_id: string
          titulo: string
          sueldo_minimo: number | null
          sueldo_maximo: number | null
          estado: VacanteEstado
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vacantes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vacantes']['Insert']>
      }
      candidatos: {
        Row: {
          id: string
          nombre: string
          apellido: string
          email: string | null
          telefono: string | null
          linkedin_url: string | null
          cv_url: string | null
          estado: CandidatoEstado
          created_at: string
          updated_at: string
        }
        Insert: {
          nombre: string
          apellido: string
          email?: string | null
          telefono?: string | null
          linkedin_url?: string | null
          cv_url?: string | null
          estado?: CandidatoEstado
        }
        Update: Partial<Database['public']['Tables']['candidatos']['Insert']>
      }
      candidatos_vacantes: {
        Row: {
          id: string
          candidato_id: string
          vacante_id: string
          etapa: EtapaPipeline
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['candidatos_vacantes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['candidatos_vacantes']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      vacante_estado: VacanteEstado
      candidato_estado: CandidatoEstado
      etapa_pipeline: EtapaPipeline
    }
  }
}

// ─── Domain Enums ─────────────────────────────────────────────────────────────

export type VacanteEstado = 'activa' | 'pausada' | 'cerrada' | 'cancelada'
export type CandidatoEstado = 'activo' | 'contratado' | 'descartado'
export type EtapaPipeline =
  | 'prospecto'
  | 'entrevista_inicial'
  | 'entrevista_cliente'
  | 'oferta'
  | 'contratado'
  | 'descartado'

// ─── Cotizador Types ───────────────────────────────────────────────────────────

export type NivelPuesto =
  | 'Operativo / Administrativo'
  | 'Especializado'
  | 'Jefatura / Senior'
  | 'Gerencial / Directivo'
  | 'Ingeniería / TI'

export interface CotizadorInput {
  puesto: string
  sueldo: number
}

export interface CotizadorResult {
  puesto: string
  sueldo: number
  nivel: NivelPuesto
  factor: number
  garantia: number
  precio: number
  utilidad: number
  margenUtilidad: number
}

// ─── CRM View Types ───────────────────────────────────────────────────────────

export type EmpresaRow = Database['public']['Tables']['empresas']['Row']
export type VacanteRow = Database['public']['Tables']['vacantes']['Row']
export type CandidatoRow = Database['public']['Tables']['candidatos']['Row']
export type PipelineRow = Database['public']['Tables']['candidatos_vacantes']['Row']
