/**
 * ══════════════════════════════════════════════════════
 * API de historial — espejo de modules/historial.
 * CU37 (web) y base de CU23 (móvil).
 * ══════════════════════════════════════════════════════
 */

import type {
  Actividad,
  HistorialQuery,
  ResumenActividad,
  RespuestaPaginada,
} from '@/types';
import { api } from './client';

/** Feed consolidado (voz + capturas + eventos) o solo eventos */
export async function listarActividades(
  query: HistorialQuery,
): Promise<RespuestaPaginada<Actividad>> {
  const { data } = await api.get<RespuestaPaginada<Actividad>>('/historial', {
    params: query,
  });
  return data;
}

/** Conteos por tipo y fuente (dashboard) */
export async function obtenerResumenActividad(): Promise<ResumenActividad[]> {
  const { data } = await api.get<ResumenActividad[]>('/historial/resumen');
  return data;
}

/** CU37 (admin) — Historial consolidado de un usuario específico */
export async function listarActividadesDeUsuario(
  idUsuario: number,
  query: HistorialQuery,
): Promise<RespuestaPaginada<Actividad>> {
  const { data } = await api.get<RespuestaPaginada<Actividad>>(
    `/historial/usuario/${idUsuario}`,
    { params: query },
  );
  return data;
}