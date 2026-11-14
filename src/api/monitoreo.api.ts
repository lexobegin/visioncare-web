/**
 * ══════════════════════════════════════════════════════
 * API de monitoreo IA — espejo de modules/monitoreo.
 * CU40 (web, ADMIN/INSTITUCION): el backend lee modelos_ia y
 * registros_ia DIRECTO de la BD compartida con el servicio IA.
 * ══════════════════════════════════════════════════════
 */

import type {
  ConsultarRegistrosQuery,
  ModeloIa,
  RegistroIa,
  ResumenMonitoreo,
  RespuestaPaginada,
} from '@/types';
import { api } from './client';

/** CU40 — Catálogo de modelos desplegados (opcional: por estado) */
export async function listarModelosIa(
  estado?: string,
): Promise<ModeloIa[]> {
  const { data } = await api.get<ModeloIa[]>('/monitoreo/modelos', {
    params: estado ? { estado } : undefined,
  });
  return data;
}

/** CU40 — Ejecuciones IA paginadas y filtradas */
export async function listarRegistrosIa(
  query: ConsultarRegistrosQuery,
): Promise<RespuestaPaginada<RegistroIa>> {
  const { data } = await api.get<RespuestaPaginada<RegistroIa>>(
    '/monitoreo/registros',
    { params: query },
  );
  return data;
}

/** CU40 — Agregados para el dashboard (con periodo opcional) */
export async function obtenerResumenMonitoreo(
  fechaDesde?: string,
  fechaHasta?: string,
): Promise<ResumenMonitoreo> {
  const { data } = await api.get<ResumenMonitoreo>('/monitoreo/resumen', {
    params: {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    },
  });
  return data;
}
