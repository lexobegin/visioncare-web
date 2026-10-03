import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LayoutApp from '@/components/layout/LayoutApp';
import PaginaLogin from '@/features/auth/PaginaLogin';
import PaginaContactos from '@/features/contactos/PaginaContactos';
import PaginaDashboard from '@/features/dashboard/PaginaDashboard';
import PaginaHistorial from '@/features/historial/PaginaHistorial';
import PaginaInstituciones from '@/features/instituciones/PaginaInstituciones';
import PaginaUsuarios from '@/features/usuarios/PaginaUsuarios';
import { RutaProtegida } from './RutaProtegida';
import { RutaPorRol } from './RutaPorRol';

/**
 * ══════════════════════════════════════════════════════
 * Mapa de rutas FINAL — Sprint 1 completo.
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

            {/* Solo ADMIN e INSTITUCION */}
            <Route element={<RutaPorRol roles={['ADMIN', 'INSTITUCION']} />}>
              <Route path="/usuarios" element={<PaginaUsuarios />} />
              <Route path="/instituciones" element={<PaginaInstituciones />} />
              <Route path="/contactos" element={<PaginaContactos />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}