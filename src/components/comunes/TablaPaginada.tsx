import type { ReactNode } from 'react';

import type { MetaPaginacion } from '@/types';
import { IconoChevronIzq, IconoChevronDer, IconoBuscar } from '@/components/ui/Iconos';
import { Spinner } from '@/components/ui/Spinner';
import { cx } from '@/components/ui/cx';

/**
 * ══════════════════════════════════════════════════════
 * Tabla genérica con paginación (usa los metadatos del
 * backend: RespuestaPaginada.meta).
 *
 * Usada por: usuarios (CU34), contactos (CU36),
 * historial (CU37). Estados integrados:
 *   - cargando  → filas skeleton (sin saltos de layout)
 *   - vacío     → mensaje con icono y acción opcional
 *   - paginación → Anterior/Siguiente + "Mostrando X–Y de Z"
 *
 * Accesibilidad: caption sr-only, th scope="col",
 * estado con aria-live="polite".
 * ══════════════════════════════════════════════════════
 */

export interface Columna<T> {
  /** Clave única de la columna */
  key: string;
  /** Texto del encabezado */
  encabezado: string;
  /** Render personalizado de la celda (default: valor crudo) */
  render?: (fila: T) => ReactNode;
  className?: string;
}

interface TablaPaginadaProps<T> {
  /** Título interno para lectores de pantalla */
  tituloAccesible: string;
  columnas: Columna<T>[];
  datos: T[];
  meta: MetaPaginacion | null;
  cargando: boolean;
  /** Extrae la key única de cada fila */
  rowKey: (fila: T) => string | number;
  /** Se dispara al pulsar Anterior/Siguiente */
  onCambioPagina: (pagina: number) => void;
  /** Mensaje cuando no hay datos (default: "Sin registros") */
  mensajeVacio?: string;
  /** Oculta el pie de paginación (listados cortos) */
  ocultarPaginacion?: boolean;
}

export function TablaPaginada<T>({
  tituloAccesible,
  columnas,
  datos,
  meta,
  cargando,
  rowKey,
  onCambioPagina,
  mensajeVacio = 'Sin registros para mostrar.',
  ocultarPaginacion = false,
}: TablaPaginadaProps<T>) {
  const hayDatos = datos.length > 0;
  const pagina = meta?.page ?? 1;
  const totalPaginas = meta?.totalPaginas ?? 1;

  const desde = meta && meta.total > 0 ? (pagina - 1) * meta.limit + 1 : 0;
  const hasta = meta ? Math.min(pagina * meta.limit, meta.total) : 0;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <caption className="sr-only">{tituloAccesible}</caption>

          <thead className="bg-slate-50">
            <tr>
              {columnas.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                    col.className,
                  )}
                >
                  {col.encabezado}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {cargando && !hayDatos ? (
              // ─── Skeleton: 5 filas que imitan la estructura ───
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columnas.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : hayDatos ? (
              datos.map((fila) => (
                <tr
                  key={rowKey(fila)}
                  className="transition-colors hover:bg-slate-50"
                >
                  {columnas.map((col) => (
                    <td
                      key={col.key}
                      className={cx('px-4 py-3 text-slate-700', col.className)}
                    >
                      {col.render ? col.render(fila) : String((fila as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // ─── Estado vacío ───
              <tr>
                <td colSpan={columnas.length} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <IconoBuscar className="h-10 w-10" />
                    <p className="text-sm">{mensajeVacio}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pie: resumen + paginación ─── */}
      {!ocultarPaginacion && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            aria-live="polite"
            className="text-xs text-slate-500"
          >
            {cargando
              ? 'Cargando datos…'
              : meta && meta.total > 0
                ? `Mostrando ${desde}–${hasta} de ${meta.total} registros`
                : 'Sin resultados'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCambioPagina(pagina - 1)}
              disabled={cargando || pagina <= 1}
              aria-label="Página anterior"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-soft transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconoChevronIzq className="h-3.5 w-3.5" />
              Anterior
            </button>

            <span className="min-w-16 text-center text-xs font-medium text-slate-600">
              {totalPaginas > 0 ? `${pagina} / ${totalPaginas}` : '—'}
            </span>

            <button
              type="button"
              onClick={() => onCambioPagina(pagina + 1)}
              disabled={cargando || pagina >= totalPaginas}
              aria-label="Página siguiente"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-soft transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <IconoChevronDer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Overlay sutil durante recargas con datos visibles */}
      {cargando && hayDatos && (
        <div className="mt-2 flex justify-center">
          <Spinner tamano="sm" etiqueta="Actualizando datos" />
        </div>
      )}
    </div>
  );
}