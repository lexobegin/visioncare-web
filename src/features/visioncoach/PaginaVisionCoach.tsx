import { useEffect, useState } from 'react';

import {
  actualizarDesafioVc,
  listarCategoriasVc,
  listarDesafiosVc,
  listarEjerciciosVc,
  listarInsigniasVc,
  listarMisInsigniasVc,
  obtenerProgresoVc,
} from '@/api/visioncoach.api';
import { Alerta, Badge, Button, Card, Select } from '@/components/ui';
import { cx } from '@/components/ui/cx';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import type {
  CategoriaVc,
  DesafioVc,
  EjercicioVc,
  EstadoDesafioPayload,
  InsigniaVc,
  ProgresoVc,
} from '@/types';
import { mensajeDeError } from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * VisionCoach (CU27–CU33) — vista de la plataforma web:
 *
 *   1. Mi progreso: nivel, puntos, rachas + mis insignias.
 *   2. Catálogo: categorías y ejercicios (solo lectura).
 *   3. Desafíos: mis desafíos adaptativos (CU31) con
 *      cambio de estado (EN_CURSO/COMPLETADO/OMITIDO).
 *   4. Insignias: catálogo completo con lo ya obtenido.
 *
 * El flujo de sesiones de entrenamiento es del móvil
 * (CU28–CU30); la web acompaña y da seguimiento.
 * ══════════════════════════════════════════════════════
 */

type Pestana = 'progreso' | 'catalogo' | 'desafios' | 'insignias';

const PESTANAS: { valor: Pestana; etiqueta: string }[] = [
  { valor: 'progreso', etiqueta: 'Mi progreso' },
  { valor: 'catalogo', etiqueta: 'Catálogo' },
  { valor: 'desafios', etiqueta: 'Mis desafíos' },
  { valor: 'insignias', etiqueta: 'Insignias' },
];

type ColorBadge =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary';

function colorDesafio(estado: string): ColorBadge {
  const mapa: Record<string, ColorBadge> = {
    ASIGNADO: 'info',
    EN_CURSO: 'primary',
    COMPLETADO: 'success',
    OMITIDO: 'neutral',
  };
  return mapa[estado] ?? 'neutral';
}

/** Tarjeta KPI del progreso */
function Kpi({
  titulo,
  valor,
  detalle,
}: {
  titulo: string;
  valor: string | number;
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

export default function PaginaVisionCoach() {
  const [pestana, setPestana] = useState<Pestana>('progreso');

  // ─── Progreso + mis insignias (pestaña 1) ───
  const [progreso, setProgreso] = useState<ProgresoVc | null>(null);
  const [misInsignias, setMisInsignias] = useState<InsigniaVc[]>([]);
  const [cargandoProgreso, setCargandoProgreso] = useState(true);
  const [errorProgreso, setErrorProgreso] = useState<string | null>(null);

  // ─── Catálogo (pestaña 2) ───
  const [categorias, setCategorias] = useState<CategoriaVc[]>([]);
  const [ejercicios, setEjercicios] = useState<EjercicioVc[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [dificultadFiltro, setDificultadFiltro] = useState('');
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);

  // ─── Desafíos (pestaña 3) ───
  const [desafios, setDesafios] = useState<DesafioVc[]>([]);
  const [cargandoDesafios, setCargandoDesafios] = useState(true);
  const [errorDesafios, setErrorDesafios] = useState<string | null>(null);
  const [alertaDesafios, setAlertaDesafios] = useState<string | null>(null);
  const [guardandoDesafio, setGuardandoDesafio] = useState<number | null>(null);

  // ─── Catálogo de insignias (pestaña 4) ───
  const [insignias, setInsignias] = useState<InsigniaVc[]>([]);
  const [cargandoInsignias, setCargandoInsignias] = useState(true);
  const [errorInsignias, setErrorInsignias] = useState<string | null>(null);

  // Progreso + mis insignias: al montar
  useEffect(() => {
    let cancelado = false;
    setCargandoProgreso(true);

    Promise.all([obtenerProgresoVc(), listarMisInsigniasVc()])
      .then(([p, insigniasMias]) => {
        if (cancelado) return;
        setProgreso(p);
        setMisInsignias(insigniasMias);
        setErrorProgreso(null);
      })
      .catch((e) => {
        if (!cancelado) setErrorProgreso(mensajeDeError(e));
      })
      .finally(() => {
        if (!cancelado) setCargandoProgreso(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Catálogo: categorías siempre + ejercicios según filtros
  useEffect(() => {
    if (pestana !== 'catalogo') return;

    let cancelado = false;
    setCargandoCatalogo(true);

    const promesaCategorias = categorias.length
      ? Promise.resolve(categorias)
      : listarCategoriasVc();

    Promise.all([
      promesaCategorias,
      listarEjerciciosVc({
        id_categoria: categoriaFiltro ? Number(categoriaFiltro) : undefined,
        dificultad: dificultadFiltro ? Number(dificultadFiltro) : undefined,
      }),
    ])
      .then(([listaCategorias, listaEjercicios]) => {
        if (cancelado) return;
        setCategorias(listaCategorias);
        setEjercicios(listaEjercicios);
        setErrorCatalogo(null);
      })
      .catch((e) => {
        if (!cancelado) setErrorCatalogo(mensajeDeError(e));
      })
      .finally(() => {
        if (!cancelado) setCargandoCatalogo(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestana, categoriaFiltro, dificultadFiltro]);

  // Desafíos: al entrar a la pestaña (y tras actualizar uno)
  const [selloDesafios, setSelloDesafios] = useState(0);

  useEffect(() => {
    if (pestana !== 'desafios') return;

    let cancelado = false;
    setCargandoDesafios(true);
    setAlertaDesafios(null);

    listarDesafiosVc()
      .then((lista) => {
        if (!cancelado) {
          setDesafios(lista);
          setErrorDesafios(null);
        }
      })
      .catch((e) => {
        if (!cancelado) setErrorDesafios(mensajeDeError(e));
      })
      .finally(() => {
        if (!cancelado) setCargandoDesafios(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pestana, selloDesafios]);

  async function cambiarEstadoDesafio(
    desafio: DesafioVc,
    estado: EstadoDesafioPayload,
  ) {
    setGuardandoDesafio(desafio.id_desafio);
    setAlertaDesafios(null);

    try {
      await actualizarDesafioVc(desafio.id_desafio, { estado });
      setAlertaDesafios(
        `Desafío #${desafio.id_desafio} actualizado a ${estado}.`,
      );
      setSelloDesafios((s) => s + 1); // recarga la lista
    } catch (e) {
      setErrorDesafios(mensajeDeError(e));
    } finally {
      setGuardandoDesafio(null);
    }
  }

  // Catálogo de insignias: al entrar a la pestaña
  useEffect(() => {
    if (pestana !== 'insignias') return;

    let cancelado = false;
    setCargandoInsignias(true);

    listarInsigniasVc()
      .then((lista) => {
        if (!cancelado) {
          setInsignias(lista);
          setErrorInsignias(null);
        }
      })
      .catch((e) => {
        if (!cancelado) setErrorInsignias(mensajeDeError(e));
      })
      .finally(() => {
        if (!cancelado) setCargandoInsignias(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pestana]);

  const idsMisInsignias = new Set(misInsignias.map((i) => i.id_insignia));

  const columnasEjercicios: Columna<EjercicioVc>[] = [
    {
      key: 'nombre',
      encabezado: 'Ejercicio',
      render: (e) => (
        <div>
          <p className="font-medium text-slate-700">{e.nombre}</p>
          <p className="max-w-md truncate text-xs text-slate-400">
            {e.descripcion}
          </p>
        </div>
      ),
    },
    {
      key: 'categoria',
      encabezado: 'Categoría',
      className: 'w-36',
      render: (e) => (
        <span className="text-xs text-slate-600">
          {e.categoria_nombre ?? '—'}
        </span>
      ),
    },
    {
      key: 'dificultad',
      encabezado: 'Dificultad',
      className: 'w-28',
      render: (e) => (
        <span className="text-xs text-slate-600" aria-label={`Dificultad ${e.dificultad} de 5`}>
          {'★'.repeat(e.dificultad)}
          {'☆'.repeat(5 - e.dificultad)}
        </span>
      ),
    },
    {
      key: 'puntos',
      encabezado: 'Puntos',
      className: 'w-20',
      render: (e) => (
        <span className="text-xs font-semibold text-slate-600">
          {e.puntos_base}
        </span>
      ),
    },
    {
      key: 'duracion',
      encabezado: 'Duración est.',
      className: 'w-28',
      render: (e) => (
        <span className="text-xs text-slate-500">
          {e.duracion_estimada_segundos != null
            ? `${e.duracion_estimada_segundos} s`
            : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Pestañas ─── */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secciones VisionCoach">
        {PESTANAS.map((p) => (
          <button
            key={p.valor}
            type="button"
            role="tab"
            aria-selected={pestana === p.valor}
            onClick={() => setPestana(p.valor)}
            className={cx(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
              pestana === p.valor
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-white text-slate-600 shadow-soft hover:bg-slate-50',
            )}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {/* ═══════════ PESTAÑA: MI PROGRESO ═══════════ */}
      {pestana === 'progreso' && (
        <div className="space-y-4">
          {errorProgreso && <Alerta variante="error">{errorProgreso}</Alerta>}

          {progreso ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi titulo="Nivel" valor={progreso.nivel} />
                <Kpi
                  titulo="Puntos totales"
                  valor={progreso.puntos_totales}
                  detalle="Acumulados en todas las sesiones"
                />
                <Kpi
                  titulo="Racha"
                  valor={progreso.racha_actual}
                  detalle={`Mejor racha: ${progreso.mejor_racha}`}
                />
                <Kpi
                  titulo="Ejercicios completados"
                  valor={progreso.ejercicios_completados}
                  detalle={`Insignias: ${progreso.total_insignias}`}
                />
              </div>

              <Card
                titulo="Mis insignias"
                descripcion={
                  cargandoProgreso
                    ? 'Cargando…'
                    : `${misInsignias.length} insignia(s) obtenida(s)`
                }
              >
                {misInsignias.length === 0 && !cargandoProgreso ? (
                  <p className="py-4 text-sm text-slate-400">
                    Aún no tienes insignias. ¡Completa ejercicios y rachas para
                    conseguirlas!
                  </p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {misInsignias.map((insignia) => (
                      <li
                        key={insignia.id_insignia}
                        className="rounded-lg border border-success-200 bg-success-50 p-3"
                      >
                        <p className="text-sm font-semibold text-success-800">
                          🏅 {insignia.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-success-700">
                          {insignia.descripcion}
                        </p>
                        <p className="mt-1 text-xs text-success-500">
                          Obtenida: {formatearFecha(insignia.fecha_obtencion)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          ) : (
            <p className="card p-6 text-sm text-slate-400">
              {cargandoProgreso ? 'Cargando progreso…' : 'Sin datos de progreso.'}
            </p>
          )}
        </div>
      )}

      {/* ═══════════ PESTAÑA: CATÁLOGO ═══════════ */}
      {pestana === 'catalogo' && (
        <div className="space-y-4">
          <section className="card space-y-4 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Categoría"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </Select>

              <Select
                label="Dificultad"
                value={dificultadFiltro}
                onChange={(e) => setDificultadFiltro(e.target.value)}
              >
                <option value="">Cualquiera</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    Nivel {n}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          {errorCatalogo && <Alerta variante="error">{errorCatalogo}</Alerta>}

          <Card
            titulo="Ejercicios disponibles"
            descripcion={`${ejercicios.length} ejercicio(s) en el catálogo activo`}
          >
            <TablaPaginada<EjercicioVc>
              tituloAccesible="Catálogo de ejercicios"
              columnas={columnasEjercicios}
              datos={ejercicios}
              meta={null}
              cargando={cargandoCatalogo}
              rowKey={(e) => e.id_ejercicio}
              onCambioPagina={() => undefined}
              ocultarPaginacion
              mensajeVacio="No hay ejercicios para los filtros aplicados."
            />
          </Card>
        </div>
      )}

      {/* ═══════════ PESTAÑA: MIS DESAFÍOS ═══════════ */}
      {pestana === 'desafios' && (
        <div className="space-y-4">
          {alertaDesafios && <Alerta variante="exito">{alertaDesafios}</Alerta>}
          {errorDesafios && <Alerta variante="error">{errorDesafios}</Alerta>}

          {desafios.length === 0 && !cargandoDesafios && !errorDesafios ? (
            <Card titulo="Mis desafíos adaptativos">
              <p className="py-4 text-sm text-slate-400">
                No tienes desafíos asignados todavía. Se generan automáticamente
                al finalizar una sesión de entrenamiento en el móvil (CU31).
              </p>
            </Card>
          ) : (
            desafios.map((desafio) => (
              <div
                key={desafio.id_desafio}
                className="card flex flex-wrap items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">
                      {desafio.ejercicio_nombre ??
                        `Ejercicio #${desafio.id_ejercicio}`}
                    </p>
                    <Badge
                      estado={desafio.estado}
                      color={colorDesafio(desafio.estado)}
                    />
                    <span className="text-xs text-slate-400">
                      Dificultad asignada: {desafio.dificultad_asignada}/5
                    </span>
                  </div>
                  {desafio.motivo_adaptacion && (
                    <p className="mt-1 text-sm text-slate-500">
                      {desafio.motivo_adaptacion}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Asignado: {formatearFecha(desafio.fecha_asignacion)}
                    {desafio.fecha_completado &&
                      ` · Completado: ${formatearFecha(desafio.fecha_completado)}`}
                  </p>
                </div>

                {(desafio.estado === 'ASIGNADO' ||
                  desafio.estado === 'EN_CURSO') && (
                  <div className="flex flex-wrap gap-2">
                    {desafio.estado === 'ASIGNADO' && (
                      <Button
                        tamano="sm"
                        variante="secundario"
                        cargando={guardandoDesafio === desafio.id_desafio}
                        onClick={() =>
                          cambiarEstadoDesafio(desafio, 'EN_CURSO')
                        }
                      >
                        Empezar
                      </Button>
                    )}
                    <Button
                      tamano="sm"
                      cargando={guardandoDesafio === desafio.id_desafio}
                      onClick={() =>
                        cambiarEstadoDesafio(desafio, 'COMPLETADO')
                      }
                    >
                      Completar
                    </Button>
                    <Button
                      tamano="sm"
                      variante="secundario"
                      cargando={guardandoDesafio === desafio.id_desafio}
                      onClick={() => cambiarEstadoDesafio(desafio, 'OMITIDO')}
                    >
                      Omitir
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}

          {cargandoDesafios && (
            <p className="text-sm text-slate-400">Cargando desafíos…</p>
          )}
        </div>
      )}

      {/* ═══════════ PESTAÑA: INSIGNIAS ═══════════ */}
      {pestana === 'insignias' && (
        <div className="space-y-4">
          {errorInsignias && <Alerta variante="error">{errorInsignias}</Alerta>}

          <Card
            titulo="Catálogo de insignias"
            descripcion="Todas las insignias del sistema; en verde las que ya obtuviste"
          >
            {insignias.length === 0 && !cargandoInsignias ? (
              <p className="py-4 text-sm text-slate-400">
                El catálogo está vacío (se puebla con la migración de seed).
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {insignias.map((insignia) => {
                  const obtenida = idsMisInsignias.has(insignia.id_insignia);
                  const miInsignia = misInsignias.find(
                    (i) => i.id_insignia === insignia.id_insignia,
                  );

                  return (
                    <li
                      key={insignia.id_insignia}
                      className={cx(
                        'rounded-lg border p-3',
                        obtenida
                          ? 'border-success-200 bg-success-50'
                          : 'border-slate-200 bg-white',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cx(
                            'text-sm font-semibold',
                            obtenida ? 'text-success-800' : 'text-slate-700',
                          )}
                        >
                          🏅 {insignia.nombre}
                        </p>
                        {obtenida && <Badge estado="OBTENIDA" color="success" />}
                      </div>
                      <p
                        className={cx(
                          'mt-0.5 text-xs',
                          obtenida ? 'text-success-700' : 'text-slate-500',
                        )}
                      >
                        {insignia.descripcion}
                      </p>
                      {insignia.condicion && (
                        <p className="mt-1 text-xs text-slate-400">
                          Condición: {insignia.condicion}
                        </p>
                      )}
                      {obtenida && miInsignia && (
                        <p className="mt-1 text-xs text-success-500">
                          Obtenida: {formatearFecha(miInsignia.fecha_obtencion)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {cargandoInsignias && (
              <p className="text-sm text-slate-400">Cargando insignias…</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
