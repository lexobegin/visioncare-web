/**
 * ══════════════════════════════════════════════════════
 * API de autenticación (CU02) e hidratación de sesión.
 *
 * iniciarSesion():      POST /auth/login → TokenResponse.
 * obtenerPerfilActual():GET /usuarios/me → Usuario completo.
 *
 * El AuthContext (Tanda 6) orquesta ambas: al arrancar la
 * app, si hay token guardado, hidrata el perfil con
 * obtenerPerfilActual(); si responde 401, el interceptor
 * global ya limpió el token y redirigió.
 * ══════════════════════════════════════════════════════
 */

import type { LoginPayload, TokenResponse, Usuario } from '@/types';
import { api } from './client';

/**
 * CU02 — Valida credenciales contra el backend.
 * NO guarda el token: eso es responsabilidad del AuthContext
 * (único dueño del estado de sesión).
 *
 * @throws AxiosError con response.data = ApiErrorBody
 *         (401 "Credenciales inválidas." | 403 cuenta bloqueada)
 */
export async function iniciarSesion(
  payload: LoginPayload,
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/login', payload);
  return data;
}

/**
 * Perfil completo del usuario autenticado (1:1 con su perfil).
 * Usado para hidratar la sesión al recargar la página.
 *
 * @throws AxiosError (401 → el interceptor global cierra sesión)
 */
export async function obtenerPerfilActual(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/usuarios/me');
  return data;
}