import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Insignia de estado — mapeo semántico automático.
 *
 * `colorPorEstado()` centraliza el color de CADA estado de
 * dominio del backend (BD CHECK constraints). Las tablas y
 * detalles de todas las features lo usan: si mañana se
 * agrega un estado, se mapea aquí una sola vez.
 * ══════════════════════════════════════════════════════
 */

type ColorBadge = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

const CLASES_COLOR: Record<ColorBadge, string> = {
  neutral: 'bg-slate-200 text-slate-700',
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  danger: 'bg-danger-100 text-danger-800',
  info: 'bg-info-100 text-info-800',
  primary: 'bg-primary-100 text-primary-800',
};

/**
 * Mapeo de estados del dominio (BD) → color semántico.
 * Fuentes: ck_usuarios_estado, ck_contacto_estado,
 *          ck_instituciones_estado, capturas, solicitudes.
 */
export function colorPorEstado(estado: string): ColorBadge {
  const mapa: Record<string, ColorBadge> = {
    // Usuarios / contactos / instituciones
    ACTIVO: 'success',
    ACTIVA: 'success',
    INACTIVO: 'neutral',
    INACTIVA: 'neutral',
    BLOQUEADO: 'danger',
    // Capturas
    PENDIENTE: 'warning',
    PROCESANDO: 'info',
    PROCESADA: 'success',
    ERROR: 'danger',
    // Futuros (Sprints 2-3): alertas, solicitudes, incidentes
    CRITICO: 'danger',
    ALTO: 'warning',
    MEDIO: 'info',
    BAJO: 'neutral',
    RESUELTO: 'success',
    CERRADO: 'neutral',
  };

  return mapa[estado.toUpperCase()] ?? 'neutral';
}

interface BadgeProps {
  /** Estado de dominio (ej: 'ACTIVO') o texto libre con `color` */
  estado: string;
  /** Override manual del color (si no se quiere el mapeo) */
  color?: ColorBadge;
}

export function Badge({ estado, color }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-semibold whitespace-nowrap',
        CLASES_COLOR[color ?? colorPorEstado(estado)],
      )}
    >
      {estado}
    </span>
  );
}