import { useEffect, useState } from 'react';

import { listarActividades, obtenerResumenActividad } from '@/api/historial.api';
import { listarInstituciones } from '@/api/instituciones.api';
import { listarUsuarios } from '@/api/usuarios.api';
import { useAuth } from '@/hooks/useAuth';
import { Badge, Card } from '@/components/ui';
import {
  IconoHistorial,
  IconoInstitucion,
  IconoUsuarios,
} from '@/components/ui/Iconos';
import {
  mensajeDeError,
  type Actividad,
  type FuenteActividad,
  type ResumenActividad,
} from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Dashboard del Sprint 1 (solo endpoints existentes):
 *
 *   ADMIN / INSTITUCION:
 *     - Tarjetas: total usuarios, total instituciones
 *     - Mi actividad (resumen + últimos 5 eventos)
 *
 *   USUARIO:
 *     - Su propia actividad (resumen + últimos 5)
 *
 * Los totales se obtienen del meta.total de listados con
 * limit=1 (sin traer registros completos).
 * ══════════════════════════════════════════════════════
 */

const ICONO_FUENTE: Record<FuenteActividad, string> = {
  EVENTO: '📋',
  VOZ: '🎤',
  CAPTURA: '📷',
};

export default function PaginaDashboard() {
  const { usuario } = useAuth();
  const esAdminOInstitucion =
    usuario?.rol === 'ADMIN' || usuario?.rol === 'INSTITUCION';

  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);
  const [totalInstituciones, setTotalInstituciones] = useState<number | null>(
    null,
  );
  const [resumen, setResumen] = useState<ResumenActividad[]>([]);
  const [recientes, setRecientes] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      const tareas: Promise<void>[] = [];

      if (esAdminOInstitucion) {
        tareas.push(
          listarUsuarios({ page: 1, limit: 1 }).then((r) => {
            if (!cancelado) setTotalUsuarios(r.meta.total);
          }),
        );
        tareas.push(
          listarInstituciones({ page: 1, limit: 1 }).then((r) => {
            if (!cancelado) setTotalInstituciones(r.meta.total);
          }),
        );
      }

      tareas.push(
        obtenerResumenActividad().then((r) => {
          if (!cancelado) setResumen(r);
        }),
      );
      tareas.push(
        listarActividades({ page: 1, limit: 5 }).then((r) => {
          if (!cancelado) setRecientes(r.datos);
        }),
      );

      // allSettled: un fallo parcial no mata el dashboard
      const resultados = await Promise.allSettled(tareas);
      const fallo = resultados.find(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );

      if (!cancelado) {
        setError(fallo ? mensajeDeError(fallo.reason) : null);
        setCargando(false);
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, [esAdminOInstitucion]);

  const totalActividades = resumen.reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Hola, {usuario?.perfil?.nombres ?? usuario?.correo} 👋
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Resumen general de VisionCare AI.
        </p>
      </div>

      {error && <AlertaInline mensaje={error} />}

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {esAdminOInstitucion && (
          <TarjetaStat
            titulo="Usuarios registrados"
            valor={totalUsuarios}
            cargando={cargando}
            icono={<IconoUsuarios className="h-6 w-6" />}
          />
        )}
        {esAdminOInstitucion && (
          <TarjetaStat
            titulo="Instituciones"
            valor={totalInstituciones}
            cargando={cargando}
            icono={<IconoInstitucion className="h-6 w-6" />}
          />
        )}
        <TarjetaStat
          titulo="Mis actividades"
          valor={cargando ? null : totalActividades}
          cargando={cargando}
          icono={<IconoHistorial className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Actividad reciente */}
        <Card
          titulo="Actividad reciente"
          descripcion="Últimos eventos registrados en tu cuenta"
          className="lg:col-span-3"
        >
          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Sin actividad todavía. Usa la app móvil o navega por la
              plataforma para generar eventos.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base"
                  >
                    {ICONO_FUENTE[a.fuente]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-700">
                      {a.descripcion ?? a.tipo_actividad}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatearFecha(a.fecha)}
                    </p>
                  </div>
                  <Badge estado={a.tipo_actividad} color="neutral" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Resumen por tipo */}
        <Card
          titulo="Resumen por tipo"
          descripcion="Distribución de tu actividad"
          className="lg:col-span-2"
        >
          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : resumen.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Sin datos.</p>
          ) : (
            <ul className="space-y-2.5">
              {resumen.map((r) => {
                const maximo = Math.max(...resumen.map((x) => x.total));
                return (
                  <li key={`${r.fuente}-${r.tipo_actividad}`}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        {r.tipo_actividad}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {r.total}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${(r.total / maximo) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ─── Sub-componentes ─── */

function TarjetaStat(props: {
  titulo: string;
  valor: number | null;
  cargando: boolean;
  icono: React.ReactNode;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        {props.icono}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{props.titulo}</p>
        {props.cargando ? (
          <span className="mt-1 inline-block h-7 w-14 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="text-2xl font-bold text-slate-900">
            {props.valor ?? '—'}
          </p>
        )}
      </div>
    </div>
  );
}

function AlertaInline({ mensaje }: { mensaje: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800"
    >
      {mensaje}
    </div>
  );
}