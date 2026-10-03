import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { iniciarSesion as iniciarSesionApi, obtenerPerfilActual } from '@/api/auth.api';
import { eliminarToken, guardarToken, obtenerToken } from '@/api/token';
import type { LoginPayload, Usuario } from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * AuthContext — estado de sesión global de la aplicación.
 *
 * Estado:
 *   usuario      → Usuario completo (con perfil) o null
 *   cargando     → true durante la hidratación inicial
 *   autenticado  → derivado: usuario !== null
 *
 * Acciones:
 *   iniciarSesion()   → CU02: valida credenciales, guarda el
 *                       token e hidrata el perfil completo
 *   cerrarSesion()    → elimina token y limpia el estado
 *   refrescarPerfil() → re-lee GET /usuarios/me (tras editar
 *                       el perfil, sin reloguear)
 *
 * Flujo al ARRANCAR la app (hidratación):
 *   ¿hay token? → GET /usuarios/me → usuario | anónimo
 *   (un 401 aquí ya lo maneja el interceptor global de axios:
 *    elimina el token y redirige a /login)
 * ══════════════════════════════════════════════════════
 */

interface EstadoSesion {
  usuario: Usuario | null;
  /** true mientras se hidrata la sesión al recargar la página */
  cargando: boolean;
  autenticado: boolean;
}

interface AccionesSesion {
  iniciarSesion: (payload: LoginPayload) => Promise<void>;
  cerrarSesion: () => void;
  refrescarPerfil: () => Promise<void>;
}

export type AuthContextValue = EstadoSesion & AccionesSesion;

/**
 * Valor por defecto null: fuerza a consumir el contexto vía
 * useAuth(), que valida que exista un Provider encima.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // ─── Hidratación inicial (una sola vez al montar) ───
  useEffect(() => {
    let cancelado = false;

    async function hidratar() {
      const token = obtenerToken();

      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const perfil = await obtenerPerfilActual();
        if (!cancelado) setUsuario(perfil);
      } catch {
        // 401 → el interceptor ya eliminó el token y redirigió.
        // Otros fallos (backend caído, red): cerramos sesión por
        // seguridad — no mostramos una sesión sin validar.
        eliminarToken();
        if (!cancelado) setUsuario(null);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    void hidratar();

    return () => {
      cancelado = true;
    };
  }, []);

  // ─── CU02: iniciar sesión ───
  const iniciarSesion = useCallback(async (payload: LoginPayload) => {
    const respuesta = await iniciarSesionApi(payload);

    // Orden importante: token PRIMERO, para que la petición
    // de perfil que sigue ya viaje autenticada.
    guardarToken(respuesta.access_token);

    try {
      // Hidrata el perfil completo (nombres, apellidos, etc.).
      // El resumen del token (respuesta.usuario) NO basta: la
      // UI necesita el Usuario completo.
      const perfil = await obtenerPerfilActual();
      setUsuario(perfil);
    } catch (error) {
      // El token quedó guardado pero el perfil falló (raro):
      // revertimos para no dejar una sesión a medias.
      eliminarToken();
      throw error;
    }
  }, []);

  // ─── Cerrar sesión ───
  const cerrarSesion = useCallback(() => {
    eliminarToken();
    setUsuario(null);
    // La redirección a /login la hace el router (Tanda 9) o
    // cada pantalla que consuma este método.
  }, []);

  // ─── Re-ler perfil tras ediciones (CU04) ───
  const refrescarPerfil = useCallback(async () => {
    const perfil = await obtenerPerfilActual();
    setUsuario(perfil);
  }, []);

  // Memoizado: evita re-render de TODOS los consumidores
  // en cada render del Provider.
  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      autenticado: usuario !== null,
      iniciarSesion,
      cerrarSesion,
      refrescarPerfil,
    }),
    [usuario, cargando, iniciarSesion, cerrarSesion, refrescarPerfil],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}