import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import type { Rol } from '@/types';
import { cx } from '@/components/ui/cx';
import {
  IconoCoach,
  IconoContacto,
  IconoDashboard,
  IconoHistorial,
  IconoIncidente,
  IconoInstitucion,
  IconoMenu,
  IconoMonitoreo,
  IconoOjo,
  IconoReporte,
  IconoSalir,
  IconoUsuarios,
  type ComponenteIcono,
  type IconoProps,
} from '@/components/ui/Iconos';

/**
 * ══════════════════════════════════════════════════════
 * Layout de la aplicación autenticada:
 *
 *   ┌────────────┬──────────────────────────────┐
 *   │  SIDEBAR   │  TOPBAR (usuario + salir)    │
 *   │  (por rol) ├──────────────────────────────┤
 *   │            │  <Outlet/> — rutas anidadas  │
 *   └────────────┴──────────────────────────────┘
 *
 * - Navegación filtrada por rol (USUARIO ve menos módulos).
 * - Móvil: drawer con overlay (se cierra al navegar).
 * - Título de sección actual derivado de la URL.
 * ══════════════════════════════════════════════════════
 */

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: ComponenteIcono;
  roles: Rol[];
}

/** Menú — Sprint 3 (CU27–CU40) */
const ITEMS_MENU: ItemMenu[] = [
  {
    ruta: '/dashboard',
    etiqueta: 'Dashboard',
    icono: IconoDashboard,
    roles: ['ADMIN', 'INSTITUCION', 'USUARIO'],
  },
  {
    ruta: '/usuarios',
    etiqueta: 'Usuarios',
    icono: IconoUsuarios,
    roles: ['ADMIN', 'INSTITUCION'],
  },
  {
    ruta: '/perfiles-preferencias',
    etiqueta: 'Perfiles y preferencias',
    icono: IconoUsuarios,
    roles: ['ADMIN'],
  },
  {
    ruta: '/instituciones',
    etiqueta: 'Instituciones',
    icono: IconoInstitucion,
    roles: ['ADMIN', 'INSTITUCION'],
  },
  {
    ruta: '/contactos',
    etiqueta: 'Contactos',
    icono: IconoContacto,
    roles: ['ADMIN', 'INSTITUCION'],
  },
  {
    ruta: '/historial',
    etiqueta: 'Historial',
    icono: IconoHistorial,
    roles: ['ADMIN', 'INSTITUCION', 'USUARIO'],
  },
  // ─── Sprint 3 ───
  {
    ruta: '/incidencias',
    etiqueta: 'Incidencias',
    icono: IconoIncidente,
    roles: ['ADMIN', 'INSTITUCION'],
  },
  {
    ruta: '/visioncoach',
    etiqueta: 'VisionCoach',
    icono: IconoCoach,
    roles: ['ADMIN', 'INSTITUCION', 'USUARIO'],
  },
  {
    ruta: '/reportes',
    etiqueta: 'Reportes',
    icono: IconoReporte,
    roles: ['ADMIN', 'INSTITUCION'],
  },
  {
    ruta: '/monitoreo',
    etiqueta: 'Monitoreo IA',
    icono: IconoMonitoreo,
    roles: ['ADMIN', 'INSTITUCION'],
  },
  {
    ruta: '/ubicaciones',
    etiqueta: 'Ubicaciones (CU21)',
    icono: IconoUbicacion,
    roles: ['ADMIN', 'INSTITUCION'],
  },
];

export default function LayoutApp() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);

  // Navegación permitida según el rol del usuario autenticado
  const items = ITEMS_MENU.filter(
    (item) => usuario && item.roles.includes(usuario.rol),
  );

  // Título de la sección actual (prefijo de ruta)
  const itemActual = items.find((item) =>
    location.pathname.startsWith(item.ruta),
  );

  // Cierra el drawer al cambiar de ruta (móvil)
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  function salir() {
    cerrarSesion();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Overlay del drawer (solo móvil) ─── */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuAbierto(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          menuAbierto ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
          <IconoOjo className="h-7 w-7 text-primary-400" />
          <span className="text-lg font-bold text-white">
            VisionCare <span className="text-primary-400">AI</span>
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
                  isActive
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                )
              }
            >
              <item.icono className="h-5 w-5 shrink-0" />
              {item.etiqueta}
            </NavLink>
          ))}

          {/* Aviso si el rol no tiene módulos (no debería ocurrir) */}
          {items.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">
              Tu rol no tiene módulos asignados en la plataforma web.
            </p>
          )}
        </nav>

        {/* Pie del sidebar */}
        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-500">
            VisionCare AI · Sprint 3 · v0.3.0
          </p>
        </div>
      </aside>

      {/* ─── CONTENIDO ─── */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-soft lg:px-8">
          <div className="flex items-center gap-3">
            {/* Botón menú (móvil) */}
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={menuAbierto}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <IconoMenu className="h-6 w-6" />
            </button>

            {/* Título de la sección actual */}
            <h1 className="text-base font-semibold text-slate-800">
              {itemActual?.etiqueta ?? 'VisionCare AI'}
            </h1>
          </div>

          {/* Usuario + salir */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700"
              >
                {inicialNombre(usuario?.perfil?.nombres ?? usuario?.correo ?? '?')}
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-800">
                  {usuario?.perfil?.nombres ?? usuario?.correo}
                </p>
                <p className="text-xs leading-tight text-slate-500">
                  {usuario?.rol}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={salir}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-danger-50 hover:text-danger-700"
            >
              <IconoSalir className="h-5 w-5" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Rutas anidadas (Tanda 9) */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>

        <footer className="px-4 py-3 text-center text-xs text-slate-400">
          VisionCare AI — Plataforma de administración y seguimiento
        </footer>
      </div>
    </div>
  );
}

/** Primera letra del nombre (o del correo) para el avatar */
function inicialNombre(nombre: string): string {
  return nombre.charAt(0).toUpperCase();
}

/**
 * 🆕 CU21 — icono de pin de ubicación (definido aquí para no
 * tocar Iconos.tsx al reemplazar este archivo).
 */
function IconoUbicacion(props: IconoProps): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}
