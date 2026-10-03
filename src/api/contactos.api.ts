/**
 * ══════════════════════════════════════════════════════
 * API de contactos de confianza (CU36 — vista web admin).
 *
 * SOLO LECTURA desde la web: el backend restringe crear/
 * editar/desactivar al PROPIO usuario (endpoints /contactos
 * con id del JWT). La web consulta los contactos de un
 * usuario específico para supervisión y soporte.
 * ══════════════════════════════════════════════════════
 */

import type {
  Contacto,
  ContactoQuery,
  RespuestaPaginada,
} from '@/types';
import { api } from './client';

/** CU36 — Contactos de un usuario específico (ADMIN/INSTITUCION) */
export async function listarContactosDeUsuario(
  idUsuario: number,
  query: ContactoQuery,
): Promise<RespuestaPaginada<Contacto>> {
  const { data } = await api.get<RespuestaPaginada<Contacto>>(
    `/contactos/usuario/${idUsuario}`,
    { params: query },
  );
  return data;
}