/**
 * ══════════════════════════════════════════════════════
 * Tipos del módulo reportes — espejo de:
 *   - reportes/dto/generar-reporte.dto.ts
 *   - reportes/dto/reporte-query.dto.ts
 *   - reportes/dto/reporte-response.dto.ts
 *
 * CU39 (panel web). Nota: el contrato acepta PDF/XLSX pero el
 * backend devuelve 400 — esta versión solo implementa JSON y CSV.
 * ══════════════════════════════════════════════════════
 */

/** Tipos de reporte (BD: ck_reporte_tipo) */
export type TipoReporte =
  | 'USO_APLICACION'
  | 'PROGRESO_VISIONCOACH'
  | 'INCIDENTES'
  | 'MONITOREO_IA';

/** Formatos disponibles (JSON y CSV implementados en backend) */
export type FormatoReporte = 'JSON' | 'CSV';

/** POST /reportes */
export interface GenerarReportePayload {
  tipo_reporte: TipoReporte;
  formato?: FormatoReporte;
  /** YYYY-MM-DD (opcional: sin periodo = histórico completo) */
  periodo_inicio?: string;
  periodo_fin?: string;
  /** Solo ADMIN: reporte de esa institución (sin ella: global) */
  id_institucion?: number;
}

/** GET /reportes — filtros (además de page/limit/buscar) */
export interface ReporteQuery {
  tipo_reporte?: TipoReporte;
  /** Solo ADMIN */
  id_institucion?: number;
}

/** Reporte generado (datos JSONB solo en el detalle) */
export interface Reporte {
  id_reporte: number;
  id_usuario_generador?: number | null;
  id_institucion?: number | null;
  tipo_reporte: TipoReporte;
  periodo_inicio?: string | null;
  periodo_fin?: string | null;
  titulo: string;
  resumen?: string | null;
  formato: string;
  fecha_generacion: string;
  /** Solo en GET /reportes/:id */
  datos?: Record<string, unknown> | null;
  /** URL del CSV en R2 (solo si formato CSV) */
  url_descarga?: string | null;
}

/** GET /reportes/:id/descargar */
export interface DescargaReporte {
  id_reporte: number;
  formato: string;
  r2_key?: string | null;
  /** URL presignada/lista para abrir (null si no hay archivo) */
  url: string | null;
}
