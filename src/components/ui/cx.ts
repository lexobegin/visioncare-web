/**
 * ══════════════════════════════════════════════════════
 * Helper de composición de clases CSS.
 *
 * Combina strings y filtra los valores falsy — sustituto
 * liviano de clsx para este proyecto:
 *
 *   cx('base', activo && 'bg-azul', condicional ? 'a' : 'b')
 *   → 'base bg-azul a'
 * ══════════════════════════════════════════════════════
 */
export function cx(
  ...clases: Array<string | false | null | undefined>
): string {
  return clases.filter(Boolean).join(' ');
}