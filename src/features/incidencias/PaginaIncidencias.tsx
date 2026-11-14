import { useEffect, useState } from 'react';

import {
  actualizarEstadoIncidente,
  listarIncidentesDeUsuario,
  obtenerIncidente,
} from '@/api/incidencias.api';
import { useListado } from '@/hooks/useListado';
import {
  Alerta,
  Badge,
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
import { SelectorUsuario } from '@/components/comunes/SelectorUsuario';
import type {
  EstadoIncidente,
  Incidente,
  RespuestaPaginada,
  SeveridadIncidente,
  Usuario,
} from '@/types';
import { mensajeDeError } from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Gestión de incidentes (CU38 — ADMIN/INSTITUCION):
 *
 *   1. Seleccionar usuario (SelectorUsuario) → su listado.
 *   2. Detalle: descripción, ubicación (mapa) y evidencias
 *      (imágenes/videos/audio/docs desde R2).
 *   3. Cambiar estado (ciclo completo) y severidad.
 *
 * El flujo de reporte desde el móvil es CU22 (fuera de la web).
 * ══════════════════════════════════════════════════════
 */

type ColorBadge =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary';

const ESTADOS_INCIDENTE: EstadoIncidente[] = [
  'ABIERTO',
  'EN_REVISION',
  'RESUELTO',
  'CERRADO',
];

const SEVERIDADES: SeveridadIncidente[] = [
  'BAJA',
  'MEDIA',
  'ALTA',
  'CRITICA',
];

function colorEstado(estado: string): ColorBadge {
  const mapa: Record<string, ColorBadge> = {
    ABIERTO: 'warning',
    EN_REVISION: 'info',
    RESUELTO: 'success',
    CERRADO: 'neutral',
  };
  return mapa[estado] ?? 'neutral';
}

function colorSeveridad(severidad: string): ColorBadge {
  const mapa: Record<string, ColorBadge> = {
    BAJA: 'neutral',
    MEDIA: 'info',
    ALTA: 'warning',
    CRITICA: 'danger',
  };
  return mapa[severidad] ?? 'neutral';
}

/** Listado vacío mientras no se seleccione usuario */
const VACIO: RespuestaPaginada<Incidente> = {
  ok: true,
  datos: [],
  meta: { page: 1, limit: 10, total: 0, totalPaginas: 0 },
};

export default function PaginaIncidencias() {
  const [usuarioSel, setUsuarioSel] = useState<Usuario | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [severidadFiltro, setSeveridadFiltro] = useState('');

  const listado = useListado<Incidente>((consulta) => {
    if (!usuarioSel) return Promise.resolve(VACIO);

    return listarIncidentesDeUsuario(usuarioSel.id_usuario, {
      ...consulta,
      estado: (estadoFiltro || undefined) as EstadoIncidente | undefined,
      severidad: (severidadFiltro || undefined) as
        | SeveridadIncidente
        | undefined,
    });
  });

  // Recarga al cambiar usuario o filtros
  useEffect(() => {
    listado.setPagina(1);
    listado.recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioSel, estadoFiltro, severidadFiltro]);

  // ─── Detalle (modal) ───
  const [detalle, setDetalle] = useState<Incidente | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [estadoForm, setEstadoForm] = useState<EstadoIncidente>('ABIERTO');
  const [severidadForm, setSeveridadForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [alertaDetalle, setAlertaDetalle] = useState<string | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  async function abrirDetalle(id: number) {
    setDetalle(null);
    setAlertaDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);

    try {
      const incidente = await obtenerIncidente(id);
      setDetalle(incidente);
      setEstadoForm(incidente.estado);
      setSeveridadForm(incidente.severidad);
    } catch (e) {
      setErrorDetalle(mensajeDeError(e));
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function guardarEstado() {
    if (!detalle) return;
    setGuardando(true);
    setAlertaDetalle(null);
    setErrorDetalle(null);

    try {
      const actualizado = await actualizarEstadoIncidente(
        detalle.id_incidente,
        {
          estado: estadoForm,
          severidad: (severidadForm || undefined) as
            | SeveridadIncidente
            | undefined,
        },
      );
      setDetalle(actualizado);
      setAlertaDetalle('Incidente actualizado correctamente.');
      listado.recargar();
    } catch (e) {
      setErrorDetalle(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const columnas: Columna<Incidente>[] = [
    {
      key: 'id',
      encabezado: 'ID',
      className: 'w-16',
      render: (i) => <span className="text-xs text-slate-400">#{i.id_incidente}</span>,
    },
    {
      key: 'tipo',
      encabezado: 'Incidente',
      render: (i) => (
        <div>
          <p className="font-medium text-slate-700">{i.tipo_incidente}</p>
          <p className="max-w-xs truncate text-xs text-slate-400">
            {i.descripcion ?? 'Sin descripción'}
          </p>
        </div>
      ),
    },
    {
      key: 'severidad',
      encabezado: 'Severidad',
      className: 'w-28',
      render: (i) => (
        <Badge estado={i.severidad} color={colorSeveridad(i.severidad)} />
      ),
    },
    {
      key: 'estado',
      encabezado: 'Estado',
      className: 'w-32',
      render: (i) => <Badge estado={i.estado} color={colorEstado(i.estado)} />,
    },
    {
      key: 'evidencias',
      encabezado: 'Evidencias',
      className: 'w-24',
      render: (i) => (
        <span className="text-xs text-slate-600">
          {i.evidencias?.length ?? 0}
        </span>
      ),
    },
    {
      key: 'fecha',
      encabezado: 'Fecha',
      className: 'w-44',
      render: (i) => (
        <span className="text-xs text-slate-500">
          {formatearFecha(i.fecha_incidente)}
        </span>
      ),
    },
    {
      key: 'acciones',
      encabezado: '',
      className: 'w-24',
      render: (i) => (
        <Button
          variante="fantasma"
          tamano="sm"
          onClick={() => abrirDetalle(i.id_incidente)}
        >
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Selección de usuario + filtros ─── */}
      <section className="card space-y-4 p-4 sm:p-6">
        <SelectorUsuario
          etiqueta={
            usuarioSel
              ? 'Incidentes de:'
              : 'Busca el usuario cuyos incidentes quieres gestionar'
          }
          seleccionado={usuarioSel}
          onSeleccionar={setUsuarioSel}
        />

        {usuarioSel && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Estado"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {ESTADOS_INCIDENTE.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>

            <Select
              label="Severidad"
              value={severidadFiltro}
              onChange={(e) => setSeveridadFiltro(e.target.value)}
            >
              <option value="">Todas</option>
              {SEVERIDADES.map((severidad) => (
                <option key={severidad} value={severidad}>
                  {severidad}
                </option>
              ))}
            </Select>
          </div>
        )}

        <Input
          label="Buscar en el tipo y la descripción"
          type="search"
          placeholder="Ej: obstrucción, bordillo…"
          value={listado.buscar}
          onChange={(e) => listado.setBuscar(e.target.value)}
          hint="La búsqueda se aplica automáticamente al escribir."
        />
      </section>

      {listado.error && <Alerta variante="error">{listado.error}</Alerta>}

      {/* ─── Listado ─── */}
      <Card
        titulo={
          usuarioSel
            ? `Incidentes de ${usuarioSel.perfil?.nombres ?? usuarioSel.correo}`
            : 'Incidentes reportados'
        }
        descripcion={
          usuarioSel
            ? 'Gestiona el ciclo de vida: ABIERTO → EN_REVISION → RESUELTO/CERRADO'
            : 'Selecciona un usuario para ver sus incidentes reportados desde el móvil.'
        }
      >
        <TablaPaginada<Incidente>
          tituloAccesible="Listado de incidentes"
          columnas={columnas}
          datos={listado.datos}
          meta={listado.meta}
          cargando={listado.cargando}
          rowKey={(i) => i.id_incidente}
          onCambioPagina={listado.setPagina}
          mensajeVacio={
            usuarioSel
              ? 'Este usuario no tiene incidentes con los filtros aplicados.'
              : 'Selecciona un usuario para comenzar.'
          }
        />
      </Card>

      {/* ─── Modal de detalle ─── */}
      <Modal
        abierto={cargandoDetalle || detalle !== null}
        titulo={
          detalle
            ? `Incidente #${detalle.id_incidente} — ${detalle.tipo_incidente}`
            : 'Cargando incidente…'
        }
        tamano="lg"
        onCerrar={() => {
          setDetalle(null);
          setAlertaDetalle(null);
          setErrorDetalle(null);
        }}
        footer={
          detalle && (
            <>
              <Button
                variante="secundario"
                onClick={() => {
                  setDetalle(null);
                  setAlertaDetalle(null);
                  setErrorDetalle(null);
                }}
              >
                Cerrar
              </Button>
              <Button onClick={guardarEstado} cargando={guardando}>
                Guardar cambios
              </Button>
            </>
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
          <div className="space-y-5">
            {alertaDetalle && (
              <Alerta variante="exito">{alertaDetalle}</Alerta>
            )}

            {/* Datos generales */}
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Estado actual
                </p>
                <Badge estado={detalle.estado} color={colorEstado(detalle.estado)} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Severidad
                </p>
                <Badge
                  estado={detalle.severidad}
                  color={colorSeveridad(detalle.severidad)}
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Fecha del incidente
                </p>
                <p className="text-slate-700">
                  {formatearFecha(detalle.fecha_incidente)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Cierre
                </p>
                <p className="text-slate-700">
                  {formatearFecha(detalle.fecha_cierre)}
                </p>
              </div>
            </div>

            {detalle.descripcion && (
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Descripción
                </p>
                <p className="mt-1 text-slate-700">{detalle.descripcion}</p>
              </div>
            )}

            {/* Ubicación + mapa */}
            {detalle.ubicacion && (
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Ubicación
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Lat {detalle.ubicacion.latitud}, Lon{' '}
                  {detalle.ubicacion.longitud}
                  {detalle.ubicacion.precision_metros != null &&
                    ` (±${detalle.ubicacion.precision_metros} m)`}
                </p>
                {detalle.url_mapa && (
                  <a
                    href={detalle.url_mapa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-primary-700 hover:underline"
                  >
                    Ver en el mapa ↗
                  </a>
                )}
              </div>
            )}

            {/* Evidencias */}
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Evidencias ({detalle.evidencias?.length ?? 0})
              </p>
              {!detalle.evidencias || detalle.evidencias.length === 0 ? (
                <p className="mt-1 text-sm text-slate-400">
                  Sin evidencias adjuntas.
                </p>
              ) : (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {detalle.evidencias.map((evidencia) => (
                    <div
                      key={evidencia.id_evidencia}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge estado={evidencia.tipo_archivo} />
                        <span className="truncate text-xs text-slate-400">
                          {evidencia.nombre_archivo ?? `#${evidencia.id_evidencia}`}
                        </span>
                      </div>

                      {evidencia.url_publica &&
                        evidencia.tipo_archivo === 'IMAGEN' && (
                          <img
                            src={evidencia.url_publica}
                            alt={`Evidencia ${evidencia.id_evidencia}`}
                            className="max-h-48 w-full rounded-md object-cover"
                          />
                        )}

                      {evidencia.url_publica &&
                        evidencia.tipo_archivo === 'VIDEO' && (
                          <video
                            src={evidencia.url_publica}
                            controls
                            className="w-full rounded-md"
                          />
                        )}

                      {evidencia.url_publica &&
                        evidencia.tipo_archivo === 'AUDIO' && (
                          <audio
                            src={evidencia.url_publica}
                            controls
                            className="w-full"
                          />
                        )}

                      {evidencia.url_publica &&
                        (evidencia.tipo_archivo === 'DOCUMENTO' ||
                          evidencia.tipo_archivo === 'AUDIO') && (
                          <a
                            href={evidencia.url_publica}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-primary-700 hover:underline"
                          >
                            Abrir archivo ↗
                          </a>
                        )}

                      {!evidencia.url_publica && (
                        <p className="text-xs text-slate-400">
                          Archivo en R2 sin URL pública configurada.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cambio de estado / severidad */}
            <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <Select
                label="Nuevo estado"
                value={estadoForm}
                onChange={(e) => setEstadoForm(e.target.value as EstadoIncidente)}
              >
                {ESTADOS_INCIDENTE.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </Select>

              <Select
                label="Severidad (opcional)"
                value={severidadForm}
                onChange={(e) => setSeveridadForm(e.target.value)}
              >
                {SEVERIDADES.map((severidad) => (
                  <option key={severidad} value={severidad}>
                    {severidad}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
