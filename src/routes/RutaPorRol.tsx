import { Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import type { Rol } from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Guard de AUTORIZACIÓN por rol (espejo del @Roles() backend).
 *
 * Debe ir SIEMPRE dentro de <RutaProtegida> (garantiza que
 * exista usuario). Si el rol no está permitido, renderiza
 * un panel de "Acceso denegado" — visible dentro del layout,
 * sin redirecciones que confundan al usuario.
 *
 * Uso:
 *   <Route element={<RutaPorRol roles={['ADMIN','INSTITUCION']} />}>
 *     <Route path="/usuarios" element={<...>} />
 *   </Route>
 * ══════════════════════════════════════════════════════
 */
export function RutaPorRol({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth();

  // Defensivo: sin usuario, RutaProtegida no se ejecutó antes
  if (!usuario) return null;

  if (!roles.includes(usuario.rol)) {
    return (
      <section className="card mx-auto max-w-lg p-10 text-center">
        <p aria-hidden="true" className="text-4xl">🔒</p>
        <h2 className="section-title mt-3">Acceso denegado</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tu rol <strong className="text-slate-700">({usuario.rol})</strong> no
          tiene permisos para esta sección. Roles permitidos:{' '}
          <strong className="text-slate-700">{roles.join(', ')}</strong>.
        </p>
        <p className="mt-4 text-xs text-slate-400">
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
      </section>
    );
  }

  return <Outlet />;
}