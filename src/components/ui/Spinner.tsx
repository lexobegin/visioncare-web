import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Indicador de carga accesible.
 *
 * - aria-busy + role="status": los lectores de pantalla
 *   anuncian "cargando" al aparecer.
 * - Tres tamaños para contextos distintos (botón, página, card).
 * ══════════════════════════════════════════════════════
 */

type TamanoSpinner = 'sm' | 'md' | 'lg';

const TAMANOS: Record<TamanoSpinner, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

interface SpinnerProps {
  tamano?: TamanoSpinner;
  /** Texto para lectores de pantalla (default: "Cargando") */
  etiqueta?: string;
  className?: string;
}

export function Spinner({
  tamano = 'md',
  etiqueta = 'Cargando',
  className,
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cx('inline-flex items-center gap-2', className)}
    >
      <span
        aria-hidden="true"
        className={cx(
          'animate-spin rounded-full border-solid border-primary-600 border-t-transparent',
          TAMANOS[tamano],
        )}
      />
      <span className="sr-only">{etiqueta}</span>
    </span>
  );
}