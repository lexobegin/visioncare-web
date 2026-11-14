/**
 * ══════════════════════════════════════════════════════
 * Tipos del módulo monitoreo IA — espejo de:
 *   - monitoreo/entities/modelo-ia.entity.ts
 *   - monitoreo/dto/registro-response.dto.ts
 *   - monitoreo/dto/consultar-registros.dto.ts
 *   - monitoreo/monitoreo.service.ts (shape del resumen)
 *
 * CU40 (panel web). El backend lee modelos_ia/registros_ia
 * DIRECTO de la BD compartida con el servicio IA.
 * ══════════════════════════════════════════════════════
 */

/** Estados del modelo (BD: ck_modelo_estado) */
export type EstadoModeloIa = 'ACTIVO' | 'INACTIVO' | 'PRUEBA';

/** Estados de la ejecución (BD: ck_registro_estado) */
export type EstadoRegistroIa = 'EXITO' | 'ERROR' | 'ADVERTENCIA';

/** Modelo IA desplegado en el servicio FastAPI */
export interface ModeloIa {
  id_modelo: number;
  /** Ej: producto-analyzer, senal-analyzer */
  nombre: string;
  /** DETECCION | OCR | CLASIFICACION | DESCRIPCION */
  tipo_modelo: string;
  version: string;
  proveedor?: string | null;
  ruta_modelo?: string | null;
  /** 0..1 */
  precision_aproximada?: number | null;
  estado: EstadoModeloIa;
  fecha_publicacion?: string | null;
  created_at: string;
  updated_at: string;
}

/** Registro de una ejecución IA */
export interface RegistroIa {
  id_registro: number;
  id_modelo?: number | null;
  id_usuario?: number | null;
  id_captura?: number | null;
  /** DETECCION_OBJETOS, LECTURA_OCR, RECONOCER_BILLETE... */
  tipo_operacion: string;
  duracion_ms?: number | null;
  resultado_estado: EstadoRegistroIa;
  /** 0..1 */
  confianza?: number | null;
  mensaje_error?: string | null;
  metadatos?: Record<string, unknown> | null;
  fecha_ejecucion: string;
  /** Resumen del modelo para la grilla */
  modelo?: ModeloResumenIa | null;
}

/** Modelo resumido (incluido en cada registro) */
export interface ModeloResumenIa {
  nombre: string;
  version: string;
  tipo_modelo: string;
}

/** GET /monitoreo/registros — filtros (además de page/limit/buscar) */
export interface ConsultarRegistrosQuery {
  id_usuario?: number;
  tipo_operacion?: string;
  resultado_estado?: EstadoRegistroIa;
  /** YYYY-MM-DD */
  fecha_desde?: string;
  fecha_hasta?: string;
}

// ─── Shape del resumen (GET /monitoreo/resumen) ───

export interface FilaPorEstado {
  estado: string;
  total: number;
}

export interface FilaPorOperacion {
  operacion: string;
  total: number;
  duracion_promedio_ms: number;
}

export interface FilaPorModelo {
  /** null = ejecuciones sin id_modelo (errores tempranos) */
  modelo: string | null;
  total: number;
}

export interface UltimoErrorIa {
  id_registro: number;
  tipo_operacion: string;
  mensaje_error?: string | null;
  fecha_ejecucion: string;
}

export interface ResumenMonitoreo {
  periodo: {
    fecha_desde: string | null;
    fecha_hasta: string | null;
  };
  total: number;
  exitos: number;
  errores: number;
  /** 0..100 con 1 decimal (null si total = 0) */
  tasa_exito: number | null;
  por_estado: FilaPorEstado[];
  por_operacion: FilaPorOperacion[];
  por_modelo: FilaPorModelo[];
  ultimos_errores: UltimoErrorIa[];
}
