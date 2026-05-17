// ─── Domain Enums ─────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type VacanteEstado = 'activa' | 'pausada' | 'cerrada' | 'cancelada'
export type CandidatoEstado = 'activo' | 'contratado' | 'descartado'
export type EtapaPipeline =
  | 'prospecto'
  | 'entrevista_inicial'
  | 'entrevista_cliente'
  | 'oferta'
  | 'contratado'
  | 'descartado'

// ─── Supabase DB Types ────────────────────────────────────────────────────────

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
        Insert: {
          nombre: string
          industria?: string | null
          contacto_nombre?: string | null
          contacto_email?: string | null
          contacto_telefono?: string | null
        }
        Update: {
          nombre?: string
          industria?: string | null
          contacto_nombre?: string | null
          contacto_email?: string | null
          contacto_telefono?: string | null
        }
        Relationships: []
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
        Insert: {
          empresa_id: string
          titulo: string
          sueldo_minimo?: number | null
          sueldo_maximo?: number | null
          estado?: VacanteEstado
          descripcion?: string | null
        }
        Update: {
          empresa_id?: string
          titulo?: string
          sueldo_minimo?: number | null
          sueldo_maximo?: number | null
          estado?: VacanteEstado
          descripcion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'vacantes_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          }
        ]
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
        Update: {
          nombre?: string
          apellido?: string
          email?: string | null
          telefono?: string | null
          linkedin_url?: string | null
          cv_url?: string | null
          estado?: CandidatoEstado
        }
        Relationships: []
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
        Insert: {
          candidato_id: string
          vacante_id: string
          etapa?: EtapaPipeline
          notas?: string | null
        }
        Update: {
          candidato_id?: string
          vacante_id?: string
          etapa?: EtapaPipeline
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'candidatos_vacantes_candidato_id_fkey'
            columns: ['candidato_id']
            isOneToOne: false
            referencedRelation: 'candidatos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'candidatos_vacantes_vacante_id_fkey'
            columns: ['vacante_id']
            isOneToOne: false
            referencedRelation: 'vacantes'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      vacante_estado: VacanteEstado
      candidato_estado: CandidatoEstado
      etapa_pipeline: EtapaPipeline
    }
  }
}

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
