import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// ─── Tema accesible (Tailwind v4 @theme) — ANTES de App ───
import '@/styles/globals.css';

import { AuthProvider } from '@/context/AuthContext';
import App from '@/App';

/**
 * ══════════════════════════════════════════════════════
 * Punto de entrada de VisionCare AI Web.
 *
 * AuthProvider: sesión global disponible para toda la app
 * (hidrata al arrancar si hay token guardado).
 * ══════════════════════════════════════════════════════
 */
const contenedor = document.getElementById('root');
if (!contenedor) {
  throw new Error('Elemento raíz #root no encontrado en index.html');
}

createRoot(contenedor).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);