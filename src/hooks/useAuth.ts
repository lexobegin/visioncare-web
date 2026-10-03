import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

/**
 * ══════════════════════════════════════════════════════
 * Hook de acceso al estado de sesión (tipado y validado).
 *
 * Uso en cualquier componente dentro de <AuthProvider>:
 *
 *   const { usuario, autenticado, cargando,
 *           iniciarSesion, cerrarSesion, refrescarPerfil } = useAuth();
 *
 *   usuario?.rol              → para @Roles equivalentes en UI
 *   usuario?.perfil?.nombres  → saludo en la topbar
 *
 * @throws Error si se usa fuera del AuthProvider
 *         (fallo de integración, detectado al instante)
 * ══════════════════════════════════════════════════════
 */
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      'useAuth debe usarse dentro de <AuthProvider>. ' +
        'Verifica que el componente esté envuelto por el proveedor.',
    );
  }

  return contexto;
}