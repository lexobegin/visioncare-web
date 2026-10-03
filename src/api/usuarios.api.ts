/**
 * ══════════════════════════════════════════════════════
 * API de usuarios — espejo de modules/usuarios (backend).
 * CU34 (administración) + utilidades de perfil propio.
 * ══════════════════════════════════════════════════════
 */

import type {
  AdminActualizarUsuarioPayload,
  CambiarContrasenaPayload,
  ConsultaPaginada,
  RespuestaPaginada,
  Usuario,
} from '@/types';
import { api } from './client';

/** CU34 — Listado paginado (ADMIN/INSTITUCION) */
export async function listarUsuarios(
  consulta: ConsultaPaginada,
): Promise<RespuestaPaginada<Usuario>> {
  const { data } = await api.get<RespuestaPaginada<Usuario>>('/usuarios', {
    params: consulta,
  });
  return data;
}

/** CU34/CU35 — Detalle de un usuario */
export async function obtenerUsuario(id: number): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
}

/** CU34 — Actualizar correo/rol/estado/institución (solo ADMIN) */
export async function actualizarUsuario(
  id: number,
  payload: AdminActualizarUsuarioPayload,
): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${id}`, payload);
  return data;
}

/** CU34 — Desactivar usuario (borrado lógico, solo ADMIN) */
export async function desactivarUsuario(
  id: number,
): Promise<{ mensaje: string }> {
  const { data } = await api.delete<{ mensaje: string }>(`/usuarios/${id}`);
  return data;
}

/** CU34 — Reactivar un usuario (PATCH estado ACTIVO) */
export async function activarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${id}`, {
    estado: 'ACTIVO',
  });
  return data;
}

/** CU04 — Cambiar mi contraseña (por si se necesita en la web) */
export async function cambiarMiContrasena(
  payload: CambiarContrasenaPayload,
): Promise<{ mensaje: string }> {
  const { data } = await api.patch<{ mensaje: string }>(
    '/usuarios/me/contrasena',
    payload,
  );
  return data;
}