/**
 * ══════════════════════════════════════════════════════
 * Tipos del módulo visioncoach — espejo de:
 *   - visioncoach/dto/visioncoach-response.dto.ts
 *   - visioncoach/dto/ejercicios-query.dto.ts
 *   - visioncoach/dto/actualizar-desafio.dto.ts
 *
 * CU27–CU33 (catálogo, sesiones, progreso, desafíos, insignias).
 * ══════════════════════════════════════════════════════
 */

/** Categoría de ejercicios (PERCEPCION, ORIENTACION...) */
export interface CategoriaVc {
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
}

/** Ejercicio del catálogo */
export interface EjercicioVc {
  id_ejercicio: number;
  id_categoria: number;
  /** Nombre de la categoría (lo agrega el backend) */
  categoria_nombre?: string | null;
  nombre: string;
  descripcion: string;
  /** 1..5 */
  dificultad: number;
  /** Puntos que otorga el acierto (server-side) */
  puntos_base: number;
  duracion_estimada_segundos?: number | null;
}

/** GET /visioncoach/ejercicios — filtros */
export interface EjerciciosVcQuery {
  id_categoria?: number;
  /** 1..5 */
  dificultad?: number;
}

/** Mi progreso (CU30) */
export interface ProgresoVc {
  id_usuario: number;
  nivel: number;
  puntos_totales: number;
  racha_actual: number;
  mejor_racha: number;
  ejercicios_completados: number;
  total_insignias: number;
}

/** Estados del desafío adaptativo (BD: ck_desafio_estado) */
export type EstadoDesafioVc =
  | 'ASIGNADO'
  | 'EN_CURSO'
  | 'COMPLETADO'
  | 'OMITIDO';

/** Estados que el usuario puede asignar (PATCH /desafios/:id) */
export type EstadoDesafioPayload = 'EN_CURSO' | 'COMPLETADO' | 'OMITIDO';

/** Desafío adaptativo (CU31) */
export interface DesafioVc {
  id_desafio: number;
  id_ejercicio: number;
  ejercicio_nombre?: string | null;
  /** Dificultad ajustada según el rendimiento */
  dificultad_asignada: number;
  motivo_adaptacion?: string | null;
  estado: EstadoDesafioVc;
  fecha_asignacion: string;
  fecha_completado?: string | null;
}

/** PATCH /visioncoach/desafios/:id */
export interface ActualizarDesafioPayload {
  estado: EstadoDesafioPayload;
}

/** Insignia (catálogo; fecha_obtencion solo en /insignias/mias) */
export interface InsigniaVc {
  id_insignia: number;
  /** Ej: RACHA_5, MIL_PUNTOS */
  nombre: string;
  descripcion: string;
  condicion?: string | null;
  fecha_obtencion?: string | null;
}
