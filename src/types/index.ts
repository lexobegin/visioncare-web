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
  AdminCrearUsuarioPayload,
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

// ─── Incidentes (🆕 Sprint 3, CU22/CU38) ───
export type {
  EstadoIncidente,
  SeveridadIncidente,
  TipoArchivoEvidencia,
  EvidenciaIncidente,
  UbicacionIncidente,
  Incidente,
  IncidenteQuery,
  ActualizarIncidentePayload,
} from './incidencia';

// ─── VisionCoach (🆕 Sprint 3, CU27–CU33) ───
export type {
  CategoriaVc,
  EjercicioVc,
  EjerciciosVcQuery,
  ProgresoVc,
  EstadoDesafioVc,
  EstadoDesafioPayload,
  DesafioVc,
  ActualizarDesafioPayload,
  InsigniaVc,
} from './visioncoach';

// ─── Reportes (🆕 Sprint 3, CU39) ───
export type {
  TipoReporte,
  FormatoReporte,
  GenerarReportePayload,
  ReporteQuery,
  Reporte,
  DescargaReporte,
} from './reporte';

// ─── Monitoreo IA (🆕 Sprint 3, CU40) ───
export type {
  EstadoModeloIa,
  EstadoRegistroIa,
  ModeloResumenIa,
  ModeloIa,
  RegistroIa,
  ConsultarRegistrosQuery,
  FilaPorEstado,
  FilaPorOperacion,
  FilaPorModelo,
  UltimoErrorIa,
  ResumenMonitoreo,
} from './monitoreo';

// ─── Ubicaciones (🆕 Sprint 3, CU21) ───
export type {
  ContactoUbicable,
  UsuarioUbicacion,
  UbicacionesActivasRespuesta,
  PuntoUbicacion,
  RutaUbicacionRespuesta,
} from './ubicaciones';
