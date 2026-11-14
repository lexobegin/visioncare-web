/**
 * ══════════════════════════════════════════════════════
 * API de reportes — espejo de modules/reportes.
 * CU39 (web, ADMIN/INSTITUCION): generar, listar, ver el
 * detalle (datos JSONB), descargar CSV y eliminar.
 * ══════════════════════════════════════════════════════
 */

import type {
  DescargaReporte,
  GenerarReportePayload,
  Reporte,
  ReporteQuery,
  RespuestaPaginada,
} from '@/types';
import { api } from './client';

/** CU39 — Generar reporte (JSON o CSV; sincrónico) */
export async function generarReporte(
  payload: GenerarReportePayload,
): Promise<Reporte> {
  const { data } = await api.post<Reporte>('/reportes', payload);
  return data;
}

/** Listar reportes (ADMIN: todos · INSTITUCION: los suyos) */
export async function listarReportes(
  query: ReporteQuery,
): Promise<RespuestaPaginada<Reporte>> {
  const { data } = await api.get<RespuestaPaginada<Reporte>>('/reportes', {
    params: query,
  });
  return data;
}

/** Detalle con los datos JSONB del reporte */
export async function obtenerReporte(id: number): Promise<Reporte> {
  const { data } = await api.get<Reporte>(`/reportes/${id}`);
  return data;
}

/** URL de descarga del CSV en R2 (400 si el reporte es JSON) */
export async function obtenerDescargaReporte(
  id: number,
): Promise<DescargaReporte> {
  const { data } = await api.get<DescargaReporte>(
    `/reportes/${id}/descargar`,
  );
  return data;
}

/** Eliminar reporte (solo ADMIN) */
export async function eliminarReporte(
  id: number,
): Promise<{ eliminado: boolean }> {
  const { data } = await api.delete<{ eliminado: boolean }>(
    `/reportes/${id}`,
  );
  return data;
}
