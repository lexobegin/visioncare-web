/**
 * ══════════════════════════════════════════════════════
 * Tipos de usuarios y perfiles — espejo de:
 *   modules/usuarios/dto/usuario-response.dto.ts
 *   modules/usuarios/dto/*.dto.ts (payloads de escritura)
 * ══════════════════════════════════════════════════════
 */

/** Roles válidos (BD: ck_usuarios_rol) */
export type Rol = 'USUARIO' | 'ADMIN' | 'INSTITUCION';

/** Estados de cuenta (BD: ck_usuarios_estado) */
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

/** Perfil 1:1 del usuario (información personal) */
export interface Perfil {
  id_perfil: number;
  nombres: string;
  apellidos?: string | null;
  telefono?: string | null;
  /** 'YYYY-MM-DD' */
  fecha_nacimiento?: string | null;
  idioma: string;
  foto_r2_key?: string | null;
}

/** Usuario completo (respuesta de GET /usuarios y /usuarios/me) */
export interface Usuario {
  id_usuario: number;
  correo: string;
  rol: Rol;
  estado: EstadoUsuario;
  id_institucion?: number | null;
  ultimo_acceso?: string | null;
  created_at: string;
  perfil?: Perfil | null;
}

/** PATCH /usuarios/me (CU04) — todos los campos opcionales */
export interface ActualizarPerfilPayload {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  idioma?: 'es' | 'en';
}

/** PATCH /usuarios/me/contrasena (CU04) */
export interface CambiarContrasenaPayload {
  contrasena_actual: string;
  contrasena_nueva: string;
}

/** PATCH /usuarios/:id (CU34 — solo ADMIN) */
export interface AdminActualizarUsuarioPayload {
  nombres?: string;
  apellidos?: string;
  correo?: string;
  rol?: Rol;
  estado?: EstadoUsuario;
  id_institucion?: number | null;
}

/** POST /usuarios (CU34 — solo ADMIN) */
export interface AdminCrearUsuarioPayload {
  nombres: string;
  apellidos?: string;
  correo: string;
  contrasena: string;
  rol: Rol;
  id_institucion?: number | null;
}
