/**
 * ══════════════════════════════════════════════════════
 * Barrel de tipos del dominio — contrato único con el API.
 *
 * import type { Usuario, RespuestaPaginada } from '@/types';
 * ══════════════════════════════════════════════════════
 */

// ─── Comunes ───
export type {
  MetaPaginacion,
  RespuestaPaginada,
  ConsultaPaginada,
  ApiErrorBody,
} from './common';
export { mensajeDeError } from './common';

// ─── Auth ───
export type {
  UsuarioAuth,
  TokenResponse,
  LoginPayload,
  RegistroPayload,
} from './auth';

// ─── Usuarios ───
export type {
  Rol,
  EstadoUsuario,
  Perfil,
  Usuario,
  ActualizarPerfilPayload,
  CambiarContrasenaPayload,
  AdminActualizarUsuarioPayload,
} from './usuario';

// ─── Instituciones ───
export type {
  EstadoInstitucion,
  Institucion,
  CrearInstitucionPayload,
  ActualizarInstitucionPayload,
} from './institucion';

// ─── Contactos ───
export type {
  EstadoContacto,
  Contacto,
  ContactoQuery,
  CrearContactoPayload,
  ActualizarContactoPayload,
} from './contacto';

// ─── Accesibilidad ───
export type {
  PreferenciasAccesibilidad,
  ActualizarPreferenciasPayload,
} from './accesibilidad';

// ─── Historial ───
export type {
  FuenteActividad,
  Actividad,
  HistorialQuery,
  ResumenActividad,
} from './historial';