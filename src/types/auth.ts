/**
 * ══════════════════════════════════════════════════════
 * Tipos de autenticación — espejo de:
 *   modules/auth/dto/token-response.dto.ts
 *   modules/auth/dto/login.dto.ts / registro.dto.ts
 * ══════════════════════════════════════════════════════
 */

import type { Rol } from './usuario';

/** Usuario resumido dentro de la respuesta de token */
export interface UsuarioAuth {
  id_usuario: number;
  correo: string;
  rol: Rol;
  nombres: string;
  apellidos?: string;
}

/** Respuesta de POST /auth/registro y POST /auth/login */
export interface TokenResponse {
  ok: true;
  access_token: string;
  token_type: 'Bearer';
  /** Segundos de validez del token */
  expires_in: number;
  usuario: UsuarioAuth;
}

/** POST /auth/login (CU02) */
export interface LoginPayload {
  correo: string;
  contrasena: string;
}

/** POST /auth/registro (CU01 — la web no lo usa, CU34 crea admins) */
export interface RegistroPayload {
  correo: string;
  contrasena: string;
  perfil: {
    nombres: string;
    apellidos?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    idioma?: 'es' | 'en';
  };
}