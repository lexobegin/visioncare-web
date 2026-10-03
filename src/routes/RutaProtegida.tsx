import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════
 * Guard de AUTENTICACIÓN (envuelve rutas que exigen sesión).
 *
 *   cargando     → pantalla de espera (evita "flash" del login
 *                  durante la hidratación inicial del token)
 *   anónimo      → /login guardando la ruta pedida en
 *                  state.from (el login vuelve ahí tras entrar)
 *   autenticado  → <Outlet/> (rutas anidadas continúan)
 *
 * Uso:
 *   <Route element={<RutaProtegida />}>
 *     <Route element={<LayoutApp />}> ... </Route>
 *   </Route>
 * ══════════════════════════════════════════════════════
 */
export function RutaProtegida() {
  const { autenticado, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <main
        role="status"
        className="flex min-h-screen items-center justify-center bg-slate-50"
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary-600 border-t-transparent" />
          <p className="animate-pulse text-sm text-slate-500">
            Verificando sesión…
          </p>
        </div>
      </main>
    );
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}