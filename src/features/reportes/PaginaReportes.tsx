import { useEffect, useState } from 'react';

import {
  eliminarReporte,
  generarReporte,
  listarReportes,
  obtenerDescargaReporte,
  obtenerReporte,
} from '@/api/reportes.api';
import { useAuth } from '@/hooks/useAuth';
import { useListado } from '@/hooks/useListado';
import {
  Alerta,
  Button,
  Card,
  Input,
  Modal,
  Select,
} from '@/components/ui';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import type {
  FormatoReporte,
  Reporte,
  TipoReporte,
} from '@/types';
import { mensajeDeError } from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Reportes (CU39 — ADMIN/INSTITUCION):
 *
 *   1. Generar: tipo + formato (JSON/CSV) + periodo opcional.
 *      ADMIN puede apuntar el reporte a una institución.
 *   2. Listado con filtro por tipo.
 *   3. Detalle (datos JSONB en texto), descarga del CSV en
 *      R2 y eliminación (solo ADMIN).
 *
 * El backend genera sincrónicamente; PDF/XLSX aún no
 * implementados (el contrato los acepta pero devuelve 400).
 * ══════════════════════════════════════════════════════
 */

const TIPOS_REPORTE: { valor: TipoReporte; etiqueta: string }[] = [
  { valor: 'USO_APLICACION', etiqueta: 'Uso de la aplicación' },
  { valor: 'PROGRESO_VISIONCOACH', etiqueta: 'Progreso VisionCoach' },
  { valor: 'INCIDENTES', etiqueta: 'Incidentes' },
  { valor: 'MONITOREO_IA', etiqueta: 'Monitoreo IA' },
];

export default function PaginaReportes() {
  const { usuario: usuarioActual } = useAuth();
  const esAdmin = usuarioActual?.rol === 'ADMIN';

  // ─── Formulario de generación ───
  const [tipoForm, setTipoForm] = useState<TipoReporte>('USO_APLICACION');
  const [formatoForm, setFormatoForm] = useState<FormatoReporte>('JSON');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFin, setPeriodoFin] = useState('');
  const [institucionForm, setInstitucionForm] = useState('');
  const [generando, setGenerando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  async function generar() {
    setGenerando(true);
    setExito(null);
    setErrorForm(null);

    try {
      const reporte = await generarReporte({
        tipo_reporte: tipoForm,
        formato: formatoForm,
        periodo_inicio: periodoInicio || undefined,
        periodo_fin: periodoFin || undefined,
        id_institucion: esAdmin && institucionForm
          ? Number(institucionForm)
          : undefined,
      });
      setExito(`Reporte #${reporte.id_reporte} generado: ${reporte.titulo}`);
      listado.recargar();
    } catch (e) {
      setErrorForm(mensajeDeError(e));
    } finally {
      setGenerando(false);
    }
  }

  // ─── Listado ───
  const [tipoFiltro, setTipoFiltro] = useState('');

  const listado = useListado<Reporte>((consulta) =>
    listarReportes({
      ...consulta,
      tipo_reporte: (tipoFiltro || undefined) as TipoReporte | undefined,
    }),
  );

  useEffect(() => {
    listado.setPagina(1);
    listado.recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoFiltro]);

  // ─── Detalle (modal) ───
  const [detalle, setDetalle] = useState<Reporte | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  async function abrirDetalle(id: number) {
    setDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);

    try {
      setDetalle(await obtenerReporte(id));
    } catch (e) {
      setErrorDetalle(mensajeDeError(e));
    } finally {
      setCargandoDetalle(false);
    }
  }

  // ─── Descarga del CSV ───
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function descargar(id: number) {
    setErrorAccion(null);

    try {
      const descarga = await obtenerDescargaReporte(id);
      if (!descarga.url) {
        setErrorAccion(
          'El reporte no tiene archivo para descargar (los JSON se consultan en el detalle).',
        );
        return;
      }
      window.open(descarga.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    }
  }

  // ─── Eliminar (solo ADMIN) ───
  async function eliminar(reporte: Reporte) {
    if (!window.confirm(`¿Eliminar el reporte #${reporte.id_reporte} (${reporte.titulo})?`)) {
      return;
    }

    setErrorAccion(null);

    try {
      await eliminarReporte(reporte.id_reporte);
      listado.recargar();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    }
  }

  const columnas: Columna<Reporte>[] = [
    {
      key: 'id',
      encabezado: 'ID',
      className: 'w-16',
      render: (r) => <span className="text-xs text-slate-400">#{r.id_reporte}</span>,
    },
    {
      key: 'titulo',
      encabezado: 'Reporte',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-700">{r.titulo}</p>
          <p className="max-w-xs truncate text-xs text-slate-400">
            {r.resumen ?? r.tipo_reporte}
          </p>
        </div>
      ),
    },
    {
      key: 'formato',
      encabezado: 'Formato',
      className: 'w-20',
      render: (r) => (
        <span className="text-xs font-semibold text-slate-600">{r.formato}</span>
      ),
    },
    {
      key: 'periodo',
      encabezado: 'Periodo',
      className: 'w-40',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.periodo_inicio ? `${r.periodo_inicio} → ${r.periodo_fin ?? '—'}` : 'Histórico'}
        </span>
      ),
    },
    {
      key: 'fecha',
      encabezado: 'Generado',
      className: 'w-44',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {formatearFecha(r.fecha_generacion)}
        </span>
      ),
    },
    {
      key: 'acciones',
      encabezado: 'Acciones',
      className: 'w-64',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button
            variante="fantasma"
            tamano="sm"
            onClick={() => abrirDetalle(r.id_reporte)}
          >
            Ver
          </Button>
          {r.formato === 'CSV' && (
            <Button
              variante="fantasma"
              tamano="sm"
              onClick={() => descargar(r.id_reporte)}
            >
              Descargar
            </Button>
          )}
          {esAdmin && (
            <Button
              variante="fantasma"
              tamano="sm"
              className="text-danger-700 hover:bg-danger-50"
              onClick={() => eliminar(r)}
            >
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Generar reporte ─── */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="section-title">Generar nuevo reporte</h2>

        {exito && <Alerta variante="exito">{exito}</Alerta>}
        {errorForm && <Alerta variante="error">{errorForm}</Alerta>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Tipo de reporte"
            value={tipoForm}
            onChange={(e) => setTipoForm(e.target.value as TipoReporte)}
          >
            {TIPOS_REPORTE.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </Select>

          <Select
            label="Formato"
            value={formatoForm}
            onChange={(e) => setFormatoForm(e.target.value as FormatoReporte)}
          >
            <option value="JSON">JSON (consulta en el panel)</option>
            <option value="CSV">CSV (archivo descargable)</option>
          </Select>

          {esAdmin && (
            <Input
              label="Institución (ID, opcional)"
              type="number"
              min={1}
              placeholder="Sin ella: global"
              value={institucionForm}
              onChange={(e) => setInstitucionForm(e.target.value)}
            />
          )}

          <Input
            label="Periodo desde"
            type="date"
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
          />

          <Input
            label="Periodo hasta"
            type="date"
            value={periodoFin}
            onChange={(e) => setPeriodoFin(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={generar} cargando={generando}>
            Generar reporte
          </Button>
          <p className="text-xs text-slate-400">
            Sin periodo: histórico completo. La generación es sincrónica.
          </p>
        </div>
      </section>

      {/* ─── Listado ─── */}
      <Card
        titulo="Reportes generados"
        descripcion={
          esAdmin
            ? 'ADMIN ve todos los reportes del sistema'
            : 'Ves los reportes generados por tu institución'
        }
      >
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Filtrar por tipo"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {TIPOS_REPORTE.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </Select>
        </div>

        {errorAccion && <Alerta variante="error">{errorAccion}</Alerta>}
        {listado.error && <Alerta variante="error">{listado.error}</Alerta>}

        <TablaPaginada<Reporte>
          tituloAccesible="Listado de reportes"
          columnas={columnas}
          datos={listado.datos}
          meta={listado.meta}
          cargando={listado.cargando}
          rowKey={(r) => r.id_reporte}
          onCambioPagina={listado.setPagina}
          mensajeVacio="Aún no se han generado reportes."
        />
      </Card>

      {/* ─── Modal de detalle ─── */}
      <Modal
        abierto={cargandoDetalle || detalle !== null}
        titulo={detalle ? detalle.titulo : 'Cargando reporte…'}
        tamano="lg"
        onCerrar={() => {
          setDetalle(null);
          setErrorDetalle(null);
        }}
        footer={
          detalle && (
            <Button
              variante="secundario"
              onClick={() => {
                setDetalle(null);
                setErrorDetalle(null);
              }}
            >
              Cerrar
            </Button>
          )
        }
      >
        {errorDetalle && <Alerta variante="error">{errorDetalle}</Alerta>}

        {!detalle && cargandoDetalle && (
          <p className="py-6 text-center text-sm text-slate-400">
            Cargando detalle…
          </p>
        )}

        {detalle && (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Tipo
                </p>
                <p className="text-slate-700">{detalle.tipo_reporte}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Generado
                </p>
                <p className="text-slate-700">
                  {formatearFecha(detalle.fecha_generacion)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Periodo
                </p>
                <p className="text-slate-700">
                  {detalle.periodo_inicio
                    ? `${detalle.periodo_inicio} → ${detalle.periodo_fin ?? '—'}`
                    : 'Histórico completo'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Formato
                </p>
                <p className="text-slate-700">{detalle.formato}</p>
              </div>
            </div>

            {detalle.resumen && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {detalle.resumen}
              </p>
            )}

            {detalle.datos ? (
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Datos
                </p>
                <pre className="mt-1 max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                  {JSON.stringify(detalle.datos, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Este reporte no lleva datos embebidos.
              </p>
            )}

            {detalle.url_descarga && (
              <a
                href={detalle.url_descarga}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold text-primary-700 hover:underline"
              >
                Descargar CSV ↗
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
