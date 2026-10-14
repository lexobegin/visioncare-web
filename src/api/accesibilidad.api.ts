import type {
  ActualizarPreferenciasPayload,
  PreferenciasAccesibilidad,
} from '@/types';
import { api } from './client';

/** CU35 — Consultar preferencias de un usuario. */
export async function obtenerPreferenciasUsuario(
  idUsuario: number,
): Promise<PreferenciasAccesibilidad> {
  const { data } = await api.get<PreferenciasAccesibilidad>(
    `/accesibilidad/usuario/${idUsuario}`,
  );
  return data;
}

/** CU35 — Actualizar preferencias de un usuario (solo ADMIN). */
export async function actualizarPreferenciasUsuario(
  idUsuario: number,
  payload: ActualizarPreferenciasPayload,
): Promise<PreferenciasAccesibilidad> {
  const { data } = await api.patch<PreferenciasAccesibilidad>(
    `/accesibilidad/usuario/${idUsuario}`,
    payload,
  );
  return data;
}
