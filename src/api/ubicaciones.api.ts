/**
 * ══════════════════════════════════════════════════════
 * API de ubicaciones — espejo de modules/ayuda (CU21).
 * Sprint 3: mapa "en vivo" de usuarios para ADMIN/INSTITUCION
 * + ruta GPS reciente + contactos autorizados (llamadas).
 * ══════════════════════════════════════════════════════
 */

import type {
  RutaUbicacionRespuesta,
  UbicacionesActivasRespuesta,
} from '@/types';
import { api } from './client';

/**
 * Usuarios con ping dentro de la ventana (defecto 15 min).
 * ADMIN: global · INSTITUCION: solo su institución.
 */
export async function listarUbicacionesActivas(
  ventanaMin?: number,
): Promise<UbicacionesActivasRespuesta> {
  const { data } = await api.get<UbicacionesActivasRespuesta>(
    '/ayuda/ubicaciones-activas',
    { params: ventanaMin ? { ventana_min: ventanaMin } : undefined },
  );
  return data;
}

/** Ruta GPS reciente de un usuario + contactos autorizados */
export async function obtenerRutaUbicacion(
  idUsuario: number,
  limit = 30,
): Promise<RutaUbicacionRespuesta> {
  const { data } = await api.get<RutaUbicacionRespuesta>(
    `/ayuda/ubicaciones/usuario/${idUsuario}`,
    { params: { limit } },
  );
  return data;
}
