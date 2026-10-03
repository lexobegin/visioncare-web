import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Alerta, Button, Input } from '@/components/ui';
import { IconoOjo } from '@/components/ui/Iconos';
import { mensajeDeError } from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Página de inicio de sesión (CU02).
 *
 * - Validación cliente: obligatorios + formato de correo
 *   (el backend valida de nuevo — defensa en profundidad).
 * - Errores del backend (credenciales inválidas, cuenta
 *   bloqueada) mostrados con Alerta + mensajeDeError.
 * - Redirección inteligente: vuelve a `state.from` (ruta
 *   que el usuario intentó visitar) o a /dashboard.
 * - Si ya hay sesión activa → redirige directo (no muestra
 *   el formulario).
 * ══════════════════════════════════════════════════════
 */

interface ErroresFormulario {
  correo?: string;
  contrasena?: string;
}

const REGEX_CORREO = /^\S+@\S+\.\S+$/;

export default function PaginaLogin() {
  const { autenticado, cargando, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Ruta de retorno guardada por RutaProtegida (si existe)
  const destino =
    (location.state as { from?: string } | null)?.from ?? '/dashboard';

  // Sesión ya activa → fuera de aquí
  if (!cargando && autenticado) {
    return <Navigate to={destino} replace />;
  }

  /** Validación cliente antes de llamar al backend */
  function validar(): boolean {
    const nuevos: ErroresFormulario = {};

    if (!correo.trim()) {
      nuevos.correo = 'El correo es obligatorio.';
    } else if (!REGEX_CORREO.test(correo.trim())) {
      nuevos.correo = 'Formato de correo inválido.';
    }

    if (!contrasena) {
      nuevos.contrasena = 'La contraseña es obligatoria.';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);

    if (!validar()) return;

    setEnviando(true);
    try {
      await iniciarSesion({
        correo: correo.trim().toLowerCase(),
        contrasena,
      });
      navigate(destino, { replace: true });
    } catch (err) {
      // 401 credenciales | 403 bloqueada/inactiva | red/500
      setErrorGeneral(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        {/* ─── Branding ─── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-card">
            <IconoOjo className="h-9 w-9 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">VisionCare AI</h1>
          <p className="mt-1 text-sm text-slate-500">
            Plataforma de administración y seguimiento
          </p>
        </div>

        {/* ─── Formulario ─── */}
        <section className="card p-6 sm:p-8" aria-labelledby="titulo-login">
          <h2 id="titulo-login" className="section-title mb-1">
            Iniciar sesión
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Ingresa tus credenciales para acceder a la plataforma.
          </p>

          {errorGeneral && (
            <Alerta
              variante="error"
              className="mb-4"
              onCerrar={() => setErrorGeneral(null)}
            >
              {errorGeneral}
            </Alerta>
          )}

          <form onSubmit={manejarEnvio} noValidate className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.com"
              value={correo}
              error={errores.correo}
              onChange={(e) => setCorreo(e.target.value)}
            />

            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={contrasena}
              error={errores.contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />

            <Button type="submit" cargando={enviando} className="w-full">
              {enviando ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          VisionCare AI — Asistencia visual para personas con discapacidad visual
        </p>
      </div>
    </main>
  );
}