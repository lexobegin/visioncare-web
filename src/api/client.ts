import axios, { AxiosError } from 'axios';

import { eliminarToken, obtenerToken } from './token';

/**
 * ══════════════════════════════════════════════════════
 * Cliente HTTP único de la aplicación (axios).
 *
 * - baseURL: VITE_API_URL (relativa con proxy en dev,
 *   absoluta en producción — ver .env.example).
 * - Interceptor de petición: inyecta Authorization: Bearer.
 * - Interceptor de respuesta: 401 global → logout + /login
 *   (excepto el propio login, cuyo 401 debe llegar al
 *   formulario para mostrar "credenciales inválidas").
 *
 * Los componentes leen el detalle del error con el helper
 * mensajeDeError() de '@/types' (formato ApiErrorBody del
 * HttpExceptionFilter del backend).
 * ══════════════════════════════════════════════════════
 */

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de PETICIÓN: inyectar el JWT ───
api.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de RESPUESTA: manejo global del 401 ───
api.interceptors.response.use(
  // 2xx → pasa directo
  (respuesta) => respuesta,

  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    const esLogin = url.includes('/auth/login');

    // 401 en cualquier endpoint que NO sea el login:
    // token expirado, manipulado o cuenta desactivada →
    // cerrar sesión y enviar al login.
    if (error.response?.status === 401 && !esLogin) {
      eliminarToken();

      // Evita un bucle si ya estamos en el login
      if (window.location.pathname !== '/login') {
        // Redirección dura (recarga): simple y a prueba de
        // estados residuales del contexto de autenticación.
        window.location.assign('/login');
      }
    }

    // 403, 404, 409, 4xx/5xx → los maneja cada componente
    // (con mensajeDeError) sin lógica global adicional.
    return Promise.reject(error);
  },
);

/** URL base efectiva (útil para debug y pruebas) */
export const API_BASE_URL = baseURL;