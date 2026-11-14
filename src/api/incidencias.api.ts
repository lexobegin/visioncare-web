/**
 * ══════════════════════════════════════════════════════
 * API de incidentes — espejo de modules/incidentes.
 * CU38 (web): gestión de incidentes reportados por los
 * usuarios desde el móvil (CU22).
 * ══════════════════════════════════════════════════════
 */

import type {
  ActualizarIncidentePayload,
  Incidente,
  IncidenteQuery,
  RespuestaPaginada,
} from '@/types';
import { api } from './client';

/** CU38 — Incidentes de un usuario (paginado; ADMIN/INSTITUCION) */
export async function listarIncidentesDeUsuario(
  idUsuario: number,
  query: IncidenteQuery,
): Promise<RespuestaPaginada<Incidente>> {
  const { data } = await api.get<RespuestaPaginada<Incidente>>(
    `/incidentes/usuario/${idUsuario}`,
    { params: query },
  );
  return data;
}

/** CU22/CU38 — Detalle completo (incluye evidencias + url_mapa) */
export async function obtenerIncidente(
  id: number,
): Promise<Incidente> {
  const { data } = await api.get<Incidente>(`/incidentes/${id}`);
  return data;
}

/** CU38 — Cambiar estado (y severidad) del incidente */
export async function actualizarEstadoIncidente(
  id: number,
  payload: ActualizarIncidentePayload,
): Promise<Incidente> {
  const { data } = await api.patch<Incidente>(
    `/incidentes/${id}/estado`,
    payload,
  );
  return data;
}
