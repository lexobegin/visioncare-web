/**
 * ══════════════════════════════════════════════════════
 * Tipos de contactos de confianza — espejo de:
 *   modules/contactos/dto/*
 * ══════════════════════════════════════════════════════
 */

import type { ConsultaPaginada } from './common';

export type EstadoContacto = 'ACTIVO' | 'INACTIVO';

/** Respuesta de GET /contactos */
export interface Contacto {
  id_contacto: number;
  /** Propietario del contacto */
  id_usuario: number;
  nombre: string;
  parentesco?: string | null;
  telefono?: string | null;
  correo?: string | null;
  /** Orden de notificación (1 = primero) */
  prioridad: number;
  autorizado_ubicacion: boolean;
  autorizado_emergencias: boolean;
  estado: EstadoContacto;
}

/** GET /contactos (query — espejo de ContactoQueryDto) */
export interface ContactoQuery extends ConsultaPaginada {
  estado?: 'ACTIVO' | 'INACTIVO' | 'TODOS';
}

/** POST /contactos — al menos teléfono o correo (validación backend) */
export interface CrearContactoPayload {
  nombre: string;
  parentesco?: string;
  telefono?: string;
  correo?: string;
  prioridad?: number;
  autorizado_ubicacion?: boolean;
  autorizado_emergencias?: boolean;
}

/** PATCH /contactos/:id */
export type ActualizarContactoPayload = Partial<CrearContactoPayload>;