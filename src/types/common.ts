/**
 * ══════════════════════════════════════════════════════
 * Tipos comunes — espejo de:
 *   - common/dto/pagination.dto.ts   (RespuestaPaginada)
 *   - common/filters/http-exception.filter.ts (ApiErrorBody)
 * ══════════════════════════════════════════════════════
 */

/** Metadatos de paginación (meta de cada listado) */
export interface MetaPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPaginas: number;
}

/** Envoltura estándar de respuestas paginadas del backend */
export interface RespuestaPaginada<T> {
  ok: true;
  datos: T[];
  meta: MetaPaginacion;
}

/** Parámetros de consulta (espejo de PaginationDto) */
export interface ConsultaPaginada {
  page?: number;
  limit?: number;
  buscar?: string;
}

/**
 * Cuerpo de error estándar (formato del HttpExceptionFilter
 * del backend). El interceptor de axios (Tanda 5) lo parsea
 * para mostrar mensajes claros en la UI.
 */
export interface ApiErrorBody {
  ok: false;
  codigo: number;
  error: string;
  mensaje: string;
  detalles?: string[];
  ruta: string;
  timestamp: string;
}

/** Extrae el mensaje legible de cualquier error HTTP del backend */
export function mensajeDeError(err: unknown): string {
  const cuerpo = err as { response?: { data?: ApiErrorBody } };
  const api = cuerpo?.response?.data;

  if (api?.mensaje) {
    // Validaciones (400): junta los detalles si existen
    return api.detalles?.length
      ? `${api.mensaje} ${api.detalles.join(' ')}`
      : api.mensaje;
  }
  return 'Error de conexión con el servidor. Intenta nuevamente.';
}