import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * ══════════════════════════════════════════════════════
 * Configuración de Vite — visioncare-web
 *
 * - Alias '@' → ./src (igual que el backend usa @/)
 * - PROXY de desarrollo: '/api' → backend NestJS (puerto 3000)
 *   Evita CORS en desarrollo; en producción (Vercel) el cliente
 *   usará la URL absoluta definida en VITE_API_URL.
 * - Tailwind v4 vía plugin oficial (sin postcss.config.js)
 * ══════════════════════════════════════════════════════
 */
export default defineConfig(({ mode }) => {
  // Carga .env del directorio raíz (variables con prefijo VITE_)
  const env = loadEnv(mode, process.cwd(), '');

  const backendTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});