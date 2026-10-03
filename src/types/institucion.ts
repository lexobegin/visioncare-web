/**
 * ══════════════════════════════════════════════════════
 * Tipos de instituciones — espejo de:
 *   modules/instituciones/dto/*
 * ══════════════════════════════════════════════════════
 */

export type EstadoInstitucion = 'ACTIVA' | 'INACTIVA';

/** Respuesta de GET /instituciones (incluye conteo de usuarios) */
export interface Institucion {
  id_institucion: number;
  nombre: string;
  descripcion?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  estado: EstadoInstitucion;
  /** Cantidad de usuarios asignados (dashboard CU39) */
  total_usuarios: number;
  created_at: string;
}

/** POST /instituciones (solo ADMIN) */
export interface CrearInstitucionPayload {
  nombre: string;
  descripcion?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

/** PATCH /instituciones/:id (solo ADMIN) */
export type ActualizarInstitucionPayload = Partial<CrearInstitucionPayload>;