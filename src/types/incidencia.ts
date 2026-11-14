/**
 * ══════════════════════════════════════════════════════
 * Tipos del módulo incidentes — espejo de:
 *   - incidentes/dto/incidente-response.dto.ts
 *   - incidentes/dto/incidente-query.dto.ts
 *   - incidentes/dto/actualizar-incidente.dto.ts
 *
 * CU22 (móvil) y CU38 (panel web).
 * ══════════════════════════════════════════════════════
 */

/** Estados del incidente (BD: ck_incidente_estado) */
export type EstadoIncidente =
  | 'ABIERTO'
  | 'EN_REVISION'
  | 'RESUELTO'
  | 'CERRADO';

/** Severidad (BD: ck_incidente_severidad) */
export type SeveridadIncidente = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

/** Clasificación del archivo de evidencia */
export type TipoArchivoEvidencia =
  | 'IMAGEN'
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENTO';

/** Evidencia del incidente (archivo en R2) */
export interface EvidenciaIncidente {
  id_evidencia: number;
  tipo_archivo: TipoArchivoEvidencia;
  nombre_archivo?: string | null;
  mime_type?: string | null;
  tamano_bytes?: number | null;
  fecha_registro: string;
  /** URL pública (null si R2_PUBLIC_BASE_URL no está configurado) */
  url_publica?: string | null;
}

/** Punto GPS del incidente */
export interface UbicacionIncidente {
  latitud: number;
  longitud: number;
  precision_metros?: number | null;
}

/** Incidente completo (respuesta del backend) */
export interface Incidente {
  id_incidente: number;
  id_usuario: number;
  id_ubicacion?: number | null;
  /** Ej: OBSTRUCCION, BORDILLO_FALTANTE, CALLE_DANADA... */
  tipo_incidente: string;
  descripcion?: string | null;
  severidad: SeveridadIncidente;
  estado: EstadoIncidente;
  fecha_incidente: string;
  fecha_cierre?: string | null;
  ubicacion?: UbicacionIncidente | null;
  /** Link a Google Maps / OpenStreetMap listo para abrir */
  url_mapa?: string | null;
  evidencias?: EvidenciaIncidente[];
  mensaje_voz?: string | null;
}

/** GET /incidentes/usuario/:id — filtros (además de page/limit/buscar) */
export interface IncidenteQuery {
  estado?: EstadoIncidente;
  severidad?: SeveridadIncidente;
}

/** PATCH /incidentes/:id/estado (ADMIN/INSTITUCION: ciclo completo) */
export interface ActualizarIncidentePayload {
  estado: EstadoIncidente;
  /** Solo ADMIN/INSTITUCION (el backend lo hace cumplir) */
  severidad?: SeveridadIncidente;
}
