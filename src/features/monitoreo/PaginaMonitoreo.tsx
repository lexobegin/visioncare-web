import { useEffect, useState } from 'react';

import {
  listarModelosIa,
  listarRegistrosIa,
  obtenerResumenMonitoreo,
} from '@/api/monitoreo.api';
import { useListado } from '@/hooks/useListado';
import { Alerta, Badge, Button, Card, Input, Select } from '@/components/ui';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import type { ModeloIa, RegistroIa, ResumenMonitoreo } from '@/types';
import { mensajeDeError } from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Monitoreo IA (CU40) — panel del servicio de visión:
 *
 *   1. Resumen del periodo (KPIs, por operación, errores)
 *   2. Catálogo de modelos desplegados (modelos_ia)
 *   3. Bitácora de ejecuciones (registros_ia, filtrable)
 *
 * El backend lee la BD compartida con el servicio IA, así
 * que el panel funciona aunque FastAPI esté reiniciando.
 * ══════════════════════════════════════════════════════
 */

type ColorBadge =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary';

/** Color del estado de ejecución (ck_registro_estado) */
function colorEstadoRegistro(estado: string): ColorBadge {
  const mapa: Record<string, ColorBadge> = {
    EXITO: 'success',
    ERROR: 'danger',
    ADVERTENCIA: 'warning',
  };
  return mapa[estado] ?? 'neutral';
}

/** Color del estado del modelo (ck_modelo_estado) */
function colorEstadoModelo(estado: string): ColorBadge {
  const mapa: Record<string, ColorBadge> = {
    ACTIVO: 'success',
    INACTIVO: 'neutral',
    PRUEBA: 'info',
  };
  return mapa[estado] ?? 'neutral';
}

/** ms → '450 ms' | '12.9 s' | '2 min 5 s' */
function formatearDuracion(ms: number | null | undefined): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const minutos = Math.floor(ms / 60_000);
  const segundos = Math.round((ms % 60_000) / 1000);
  return `${minutos} min ${segundos} s`;
}

/** confianza 0..1 → '85.0%' */
function formatearConfianza(confianza: number | null | undefined): string {
  if (confianza == null) return '—';
  return `${(confianza * 100).toFixed(1)}%`;
}

/** Tarjeta KPI del resumen */
function Kpi({
  titulo,
  valor,
  detalle,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-slate-400">{detalle}</p>}
    </div>
  );
}

export default function PaginaMonitoreo() {
  // ─── Resumen (no paginado → estado local) ───
  const [resumen, setResumen] = useState<ResumenMonitoreo | null>(null);
  const [resumenCargando, setResumenCargando] = useState(true);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selloResumen, setSelloResumen] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setResumenCargando(true);

    obtenerResumenMonitoreo(fechaDesde || undefined, fechaHasta || undefined)
      .then((r) => {
        if (!cancelado) {
          setResumen(r);
          setResumenError(null);
        }
      })
      .catch((e) => {
        if (!cancelado) setResumenError(mensajeDeError(e));
      })
      .finally(() => {
        if (!cancelado) setResumenCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [fechaDesde, fechaHasta, selloResumen]);

  // ─── Catálogo de modelos (array simple) ───
  const [modelos, setModelos] = useState<ModeloIa[]>([]);
  const [modelosCargando, setModelosCargando] = useState(true);
  const [modelosError, setModelosError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setModelosCargando(true);

    listarModelosIa()
      .then((lista) => {
        if (!cancelado) {
          setModelos(lista);
          setModelosError(null);
        }
      })
      .catch((e) => {
        if (!cancelado) setModelosError(mensajeDeError(e));
      })
      .finally(() => {
        if (!cancelado) setModelosCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [selloResumen]);

  const modelosActivos = modelos.filter((m) => m.estado === 'ACTIVO').length;

  // ─── Registros de ejecución (paginado + filtros) ───
  const [tipoOperacion, setTipoOperacion] = useState('');
  const [resultadoEstado, setResultadoEstado] = useState('');

  const listado = useListado<RegistroIa>((consulta) =>
    listarRegistrosIa({
      ...consulta,
      tipo_operacion: tipoOperacion || undefined,
      resultado_estado: (resultadoEstado || undefined) as
        | 'EXITO'
        | 'ERROR'
        | 'ADVERTENCIA'
        | undefined,
    }),
  );

  // Recarga al cambiar cualquier filtro
  useEffect(() => {
    listado.setPagina(1);
    listado.recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoOperacion, resultadoEstado]);

  const columnasRegistros: Columna<RegistroIa>[] = [
    {
      key: 'fecha',
      encabezado: 'Fecha',
      className: 'w-44',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {formatearFecha(r.fecha_ejecucion)}
        </span>
      ),
    },
    {
      key: 'operacion',
      encabezado: 'Operación',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-700">{r.tipo_operacion}</p>
          <p className="text-xs text-slate-400">
            {r.modelo ? `${r.modelo.nombre} v${r.modelo.version}` : 'Sin modelo'}
          </p>
        </div>
      ),
    },
    {
      key: 'estado',
      encabezado: 'Estado',
      className: 'w-32',
      render: (r) => (
        <Badge
          estado={r.resultado_estado}
          color={colorEstadoRegistro(r.resultado_estado)}
        />
      ),
    },
    {
      key: 'duracion',
      encabezado: 'Duración',
      className: 'w-28',
      render: (r) => (
        <span className="text-xs text-slate-600">
          {formatearDuracion(r.duracion_ms)}
        </span>
      ),
    },
    {
      key: 'confianza',
      encabezado: 'Confianza',
      className: 'w-24',
      render: (r) => (
        <span className="text-xs text-slate-600">
          {formatearConfianza(r.confianza)}
        </span>
      ),
    },
    {
      key: 'usuario',
      encabezado: 'Usuario',
      className: 'w-20',
      render: (r) => (
        <span className="text-xs text-slate-400">
          {r.id_usuario != null ? `#${r.id_usuario}` : '—'}
        </span>
      ),
    },
  ];

  const columnasModelos: Columna<ModeloIa>[] = [
    {
      key: 'nombre',
      encabezado: 'Modelo',
      render: (m) => (
        <div>
          <p className="font-medium text-slate-700">{m.nombre}</p>
          <p className="text-xs text-slate-400">
            v{m.version} · {m.tipo_modelo}
          </p>
        </div>
      ),
    },
    {
      key: 'proveedor',
      encabezado: 'Proveedor',
      render: (m) => (
        <span className="text-xs text-slate-600">{m.proveedor ?? '—'}</span>
      ),
    },
    {
      key: 'precision',
      encabezado: 'Precisión',
      className: 'w-24',
      render: (m) => (
        <span className="text-xs text-slate-600">
          {m.precision_aproximada != null
            ? `${(Number(m.precision_aproximada) * 100).toFixed(1)}%`
            : '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      encabezado: 'Estado',
      className: 'w-28',
      render: (m) => (
        <Badge estado={m.estado} color={colorEstadoModelo(m.estado)} />
      ),
    },
    {
      key: 'publicado',
      encabezado: 'Publicado',
      className: 'w-44',
      render: (m) => (
        <span className="text-xs text-slate-500">
          {formatearFecha(m.fecha_publicacion)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Filtros de periodo del resumen ─── */}
      <section className="card space-y-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Resumen desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Input
            label="Resumen hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          <div className="flex items-end pb-1.5">
            <Button
              variante="secundario"
              onClick={() => setSelloResumen((s) => s + 1)}
              cargando={resumenCargando}
            >
              Refrescar
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Sin fechas: histórico completo. El periodo solo afecta al resumen
          (la bitácora de abajo tiene sus propios filtros).
        </p>
      </section>

      {resumenError && <Alerta variante="error">{resumenError}</Alerta>}

      {/* ─── KPIs del periodo ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          titulo="Ejecuciones IA"
          valor={resumen ? String(resumen.total) : '…'}
          detalle="Total del periodo"
        />
        <Kpi
          titulo="Tasa de éxito"
          valor={
            resumen && resumen.tasa_exito != null
              ? `${resumen.tasa_exito}%`
              : resumen
                ? '—'
                : '…'
          }
          detalle={`${resumen?.exitos ?? 0} éxitos · ${resumen?.errores ?? 0} errores`}
        />
        <Kpi
          titulo="Modelos activos"
          valor={modelosCargando ? '…' : String(modelosActivos)}
          detalle={`Catálogo total: ${modelos.length}`}
        />
        <Kpi
          titulo="Operaciones distintas"
          valor={
            resumen ? String(resumen.por_operacion.length) : '…'
          }
          detalle="Tipos de análisis ejecutados"
        />
      </div>

      {/* ─── Estados + por operación ─── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          titulo="Ejecuciones por operación"
          descripcion="Duración promedio por tipo de análisis (top del periodo)"
        >
          {resumen && resumen.por_operacion.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {resumen.por_operacion.map((fila) => (
                <li
                  key={fila.operacion}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-700">
                    {fila.operacion}
                  </span>
                  <span className="text-right text-xs text-slate-500">
                    {fila.total} ejec. ·{' '}
                    {formatearDuracion(fila.duracion_promedio_ms)} prom.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-slate-400">
              {resumenCargando
                ? 'Cargando…'
                : 'Sin ejecuciones registradas en el periodo.'}
            </p>
          )}

          {resumen && resumen.por_estado.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {resumen.por_estado.map((fila) => (
                <Badge
                  key={fila.estado}
                  estado={`${fila.estado}: ${fila.total}`}
                  color={colorEstadoRegistro(fila.estado)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card
          titulo="Últimos errores"
          descripcion="Las 5 ejecuciones fallidas más recientes del periodo"
        >
          {resumen && resumen.ultimos_errores.length > 0 ? (
            <ul className="space-y-3">
              {resumen.ultimos_errores.map((error) => (
                <li
                  key={error.id_registro}
                  className="rounded-lg border border-danger-100 bg-danger-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-danger-800">
                      {error.tipo_operacion}
                    </span>
                    <span className="text-xs text-danger-600">
                      #{error.id_registro}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-danger-700">
                    {error.mensaje_error ?? 'Sin mensaje de error'}
                  </p>
                  <p className="mt-1 text-xs text-danger-400">
                    {formatearFecha(error.fecha_ejecucion)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-slate-400">
              {resumenCargando
                ? 'Cargando…'
                : 'Sin errores en el periodo. 🎉'}
            </p>
          )}
        </Card>
      </div>

      {/* ─── Catálogo de modelos ─── */}
      <Card
        titulo="Modelos desplegados"
        descripcion="Catálogo registrado por el servicio IA (get-or-create al ejecutar)"
      >
        {modelosError && <Alerta variante="error">{modelosError}</Alerta>}
        <TablaPaginada<ModeloIa>
          tituloAccesible="Catálogo de modelos IA"
          columnas={columnasModelos}
          datos={modelos}
          meta={null}
          cargando={modelosCargando}
          rowKey={(m) => m.id_modelo}
          onCambioPagina={() => undefined}
          ocultarPaginacion
          mensajeVacio="Aún no hay modelos registrados (se registran al ejecutar el primer análisis)."
        />
      </Card>

      {/* ─── Bitácora de ejecuciones ─── */}
      <Card
        titulo="Registros de ejecución"
        descripcion="Cada análisis realizado por el servicio IA (duración, estado y confianza)"
      >
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Tipo de operación"
            type="search"
            placeholder="Ej: LECTURA_OCR…"
            value={tipoOperacion}
            onChange={(e) => setTipoOperacion(e.target.value)}
          />
          <Select
            label="Estado"
            value={resultadoEstado}
            onChange={(e) => setResultadoEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="EXITO">EXITO</option>
            <option value="ERROR">ERROR</option>
            <option value="ADVERTENCIA">ADVERTENCIA</option>
          </Select>
        </div>

        {listado.error && <Alerta variante="error">{listado.error}</Alerta>}

        <TablaPaginada<RegistroIa>
          tituloAccesible="Registros de ejecución IA"
          columnas={columnasRegistros}
          datos={listado.datos}
          meta={listado.meta}
          cargando={listado.cargando}
          rowKey={(r) => r.id_registro}
          onCambioPagina={listado.setPagina}
          mensajeVacio="Sin ejecuciones para los filtros aplicados."
        />
      </Card>
    </div>
  );
}
