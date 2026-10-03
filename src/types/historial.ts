/**
 * ══════════════════════════════════════════════════════
 * Tipos de historial — espejo de:
 *   modules/historial/dto/*
 * ══════════════════════════════════════════════════════
 */

import type { ConsultaPaginada } from './common';

/** Fuente del evento en el feed consolidado */
export type FuenteActividad = 'EVENTO' | 'VOZ' | 'CAPTURA';

/** Item del feed (GET /historial — consolidado por defecto) */
export interface Actividad {
  /** Único entre fuentes: 'evento-3', 'voz-12', 'captura-2'... */
  id: string;
  fuente: FuenteActividad;
  tipo_actividad: string;
  descripcion?: string | null;
  referencia_id?: number | null;
  fecha: string;
}

/** GET /historial (query — espejo de HistorialQueryDto) */
export interface HistorialQuery extends ConsultaPaginada {
  tipo_actividad?: string;
  /** 'YYYY-MM-DD' */
  fecha_desde?: string;
  /** 'YYYY-MM-DD' */
  fecha_hasta?: string;
  /** default true — fusiona voz + capturas + eventos */
  consolidado?: boolean;
}

/** Item del resumen (GET /historial/resumen) */
export interface ResumenActividad {
  tipo_actividad: string;
  fuente: string;
  total: number;
}