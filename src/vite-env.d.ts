/// <reference types="vite/client" />

/**
 * ══════════════════════════════════════════════════════
 * Tipado de las variables de entorno VITE_ (autocompletado
 * y validación en todo el código: import.meta.env.VITE_X)
 *
 * Espejo de .env / .env.example — mantén ambos sincronizados.
 * ══════════════════════════════════════════════════════
 */
interface ImportMetaEnv {
  /** URL base de la API (relativa con proxy en dev, absoluta en prod) */
  readonly VITE_API_URL: string;
  /** Destino del proxy de desarrollo (solo npm run dev) */
  readonly VITE_API_PROXY_TARGET?: string;
  /** Nombre visible de la aplicación */
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}