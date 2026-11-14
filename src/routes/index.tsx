import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LayoutApp from '@/components/layout/LayoutApp';
import PaginaLogin from '@/features/auth/PaginaLogin';
import PaginaContactos from '@/features/contactos/PaginaContactos';
import PaginaDashboard from '@/features/dashboard/PaginaDashboard';
import PaginaHistorial from '@/features/historial/PaginaHistorial';
import PaginaIncidencias from '@/features/incidencias/PaginaIncidencias';
import PaginaInstituciones from '@/features/instituciones/PaginaInstituciones';
import PaginaMonitoreo from '@/features/monitoreo/PaginaMonitoreo';
import PaginaReportes from '@/features/reportes/PaginaReportes';
import PaginaUbicaciones from '@/features/ubicaciones/PaginaUbicaciones';
import PaginaUsuarios from '@/features/usuarios/PaginaUsuarios';
import PaginaVisionCoach from '@/features/visioncoach/PaginaVisionCoach';
import PaginaPerfilesPreferencias from '@/features/perfiles/PaginaPerfilesPreferencias';
import { RutaProtegida } from './RutaProtegida';
import { RutaPorRol } from './RutaPorRol';

/**
 * ══════════════════════════════════════════════════════
 * Mapa de rutas — Sprint 3 completo:
 *   + /incidencias (CU38)      → ADMIN, INSTITUCION
 *   + /visioncoach (CU27–33)   → todos los roles
 *   + /reportes    (CU39)      → ADMIN, INSTITUCION
 *   + /monitoreo   (CU40)      → ADMIN, INSTITUCION
 * ══════════════════════════════════════════════════════
 */
export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ═══════════ PÚBLICO ═══════════ */}
        <Route path="/login" element={<PaginaLogin />} />

        {/* ═══════════ PROTEGIDO ═══════════ */}
        <Route element={<RutaProtegida />}>
          <Route element={<LayoutApp />}>
            {/* Cualquier rol autenticado */}
            <Route path="/dashboard" element={<PaginaDashboard />} />
            <Route path="/historial" element={<PaginaHistorial />} />
            <Route path="/visioncoach" element={<PaginaVisionCoach />} />

            {/* Solo ADMIN e INSTITUCION */}
            <Route element={<RutaPorRol roles={['ADMIN', 'INSTITUCION']} />}>
              <Route path="/usuarios" element={<PaginaUsuarios />} />
              <Route path="/instituciones" element={<PaginaInstituciones />} />
              <Route path="/contactos" element={<PaginaContactos />} />
              {/* 🆕 Sprint 3 */}
              <Route path="/incidencias" element={<PaginaIncidencias />} />
              <Route path="/reportes" element={<PaginaReportes />} />
              <Route path="/monitoreo" element={<PaginaMonitoreo />} />
              {/* 🆕 CU21 — ubicaciones en vivo + llamadas */}
              <Route path="/ubicaciones" element={<PaginaUbicaciones />} />
            </Route>

            {/* Solo ADMIN */}
            <Route element={<RutaPorRol roles={['ADMIN']} />}>
              <Route
                path="/perfiles-preferencias"
                element={<PaginaPerfilesPreferencias />}
              />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
