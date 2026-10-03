/**
 * ══════════════════════════════════════════════════════
 * API de instituciones — espejo de modules/instituciones.
 * CRUD (ADMIN) + lecturas (ADMIN/INSTITUCION).
 * ══════════════════════════════════════════════════════
 */

import type {
  ActualizarInstitucionPayload,
  ConsultaPaginada,
  CrearInstitucionPayload,
  Institucion,
  RespuestaPaginada,
} from '@/types';
import { api } from './client';

export async function listarInstituciones(
  consulta: ConsultaPaginada,
): Promise<RespuestaPaginada<Institucion>> {
  const { data } = await api.get<RespuestaPaginada<Institucion>>(
    '/instituciones',
    { params: consulta },
  );
  return data;
}

export async function obtenerInstitucion(id: number): Promise<Institucion> {
  const { data } = await api.get<Institucion>(`/instituciones/${id}`);
  return data;
}

export async function crearInstitucion(
  payload: CrearInstitucionPayload,
): Promise<Institucion> {
  const { data } = await api.post<Institucion>('/instituciones', payload);
  return data;
}

export async function actualizarInstitucion(
  id: number,
  payload: ActualizarInstitucionPayload,
): Promise<Institucion> {
  const { data } = await api.patch<Institucion>(
    `/instituciones/${id}`,
    payload,
  );
  return data;
}

export async function desactivarInstitucion(
  id: number,
): Promise<{ mensaje: string }> {
  const { data } = await api.delete<{ mensaje: string }>(
    `/instituciones/${id}`,
  );
  return data;
}

export async function activarInstitucion(
  id: number,
): Promise<{ mensaje: string }> {
  const { data } = await api.patch<{ mensaje: string }>(
    `/instituciones/${id}/activar`,
  );
  return data;
}