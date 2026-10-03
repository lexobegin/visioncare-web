/**
 * ══════════════════════════════════════════════════════
 * Formateo de fechas ISO (strings del backend) al locale es.
 * Tolerante: devuelve '—' para null/undefined/inválidas.
 * ══════════════════════════════════════════════════════
 */

/** '2026-09-14T10:30:00Z' → '14 sep 2026, 10:30' */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Solo fecha: '14 sep 2026' */
export function formatearFechaCorta(iso: string | null | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es', { dateStyle: 'medium' });
}