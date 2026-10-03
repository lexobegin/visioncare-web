/**
 * ══════════════════════════════════════════════════════
 * Almacenamiento del token JWT (localStorage).
 *
 * Trade-off documentado:
 *   - localStorage: sobrevive a recargas (UX correcta), pero
 *     es legible por JS → vulnerable a XSS. Mitigado con
 *     tokens de 8 h + React que escapa el HTML por defecto.
 *   - Alternativa empresarial: cookie httpOnly (requiere
 *     soporte del backend — fuera de alcance del Sprint 1).
 *
 * Clave única de la app en localStorage para evitar
 * colisiones con otras apps en el mismo origen.
 * ══════════════════════════════════════════════════════
 */

const CLAVE_TOKEN = 'visioncare.token';

/** Token activo o null si no hay sesión */
export function obtenerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    // localStorage puede fallar en modos de privacidad estricta
    return null;
  }
}

/** Guarda el token tras un login/registro exitoso */
export function guardarToken(token: string): void {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // sin almacenamiento disponible: la sesión vivirá solo en memoria
  }
}

/** Elimina el token (logout o 401 global) */
export function eliminarToken(): void {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // silencioso
  }
}