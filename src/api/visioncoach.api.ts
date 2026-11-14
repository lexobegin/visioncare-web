/**
 * ══════════════════════════════════════════════════════
 * API de VisionCoach — espejo de modules/visioncoach.
 * CU27–CU33 (catálogo, progreso, desafíos e insignias).
 * En la web son de SOLO LECTURA (salvo el estado de los
 * desafíos propios); el flujo de sesiones es móvil.
 * ══════════════════════════════════════════════════════
 */

import type {
  ActualizarDesafioPayload,
  CategoriaVc,
  DesafioVc,
  EjercicioVc,
  EjerciciosVcQuery,
  InsigniaVc,
  ProgresoVc,
} from '@/types';
import { api } from './client';

/** CU27 — Categorías activas */
export async function listarCategoriasVc(): Promise<CategoriaVc[]> {
  const { data } = await api.get<CategoriaVc[]>('/visioncoach/categorias');
  return data;
}

/** CU27 — Catálogo de ejercicios (filtros opcionales) */
export async function listarEjerciciosVc(
  query: EjerciciosVcQuery,
): Promise<EjercicioVc[]> {
  const { data } = await api.get<EjercicioVc[]>('/visioncoach/ejercicios', {
    params: query,
  });
  return data;
}

/** CU30 — Mi progreso (nivel, puntos, rachas) */
export async function obtenerProgresoVc(): Promise<ProgresoVc> {
  const { data } = await api.get<ProgresoVc>('/visioncoach/progreso');
  return data;
}

/** CU31 — Mis desafíos adaptativos (últimos 20) */
export async function listarDesafiosVc(
  estado?: string,
): Promise<DesafioVc[]> {
  const { data } = await api.get<DesafioVc[]>('/visioncoach/desafios', {
    params: estado ? { estado } : undefined,
  });
  return data;
}

/** CU31 — Actualizar estado de un desafío propio */
export async function actualizarDesafioVc(
  id: number,
  payload: ActualizarDesafioPayload,
): Promise<DesafioVc> {
  const { data } = await api.patch<DesafioVc>(
    `/visioncoach/desafios/${id}`,
    payload,
  );
  return data;
}

/** CU33 — Catálogo completo de insignias */
export async function listarInsigniasVc(): Promise<InsigniaVc[]> {
  const { data } = await api.get<InsigniaVc[]>('/visioncoach/insignias');
  return data;
}

/** CU33 — Mis insignias (con fecha de obtención) */
export async function listarMisInsigniasVc(): Promise<InsigniaVc[]> {
  const { data } = await api.get<InsigniaVc[]>('/visioncoach/insignias/mias');
  return data;
}
