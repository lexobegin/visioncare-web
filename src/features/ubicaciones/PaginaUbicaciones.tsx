/**
 * ══════════════════════════════════════════════════════
 * CU21 — UBICACIONES EN VIVO (Sprint 3, ADMIN/INSTITUCION).
 *
 * Cuando una persona no vidente se pierde, el personal ve
 * aquí su última posición GPS en un mapa real (Leaflet +
 * OpenStreetMap) mientras el asistente continuo o el toggle
 * "Compartir mi ubicación" estén activos en su móvil:
 *
 *   ● Círculo por usuario en vivo (refresco cada 15 s)
 *   ● Panel con: hace cuánto, precisión GPS, teléfono
 *   ● 📞 Llamar a la persona (tel:)
 *   ● 📞 Llamar a un familiar/contacto autorizado (tel:)
 *   ● Ruta reciente (polyline de los últimos pings)
 *
 * El mapa usa tiles de OpenStreetMap (sin API key). Los
 * botones de llamada usan tel: — funcionan directo en el
 * navegador del teléfono; en escritorio muestran el número.
 * ══════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, CircleMarker, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type {
  UsuarioUbicacion,
  RutaUbicacionRespuesta,
} from '@/types';
import {
  listarUbicacionesActivas,
  obtenerRutaUbicacion,
} from '@/api/ubicaciones.api';

const REFRESCO_MS = 15_000;
/** Centro por defecto: Santa Cruz de la Sierra (proyecto boliviano) */
const CENTRO_INICIAL: [number, number] = [-17.7833, -63.1821];

export default function PaginaUbicaciones() {
  const [usuarios, setUsuarios] = useState<UsuarioUbicacion[]>([]);
  const [ventanaMin, setVentanaMin] = useState(15);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seleccion, setSeleccion] = useState<UsuarioUbicacion | null>(null);
  const [ruta, setRuta] = useState<RutaUbicacionRespuesta | null>(null);
  const [rutaCargando, setRutaCargando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const resp = await listarUbicacionesActivas(ventanaMin);
      setUsuarios(resp.datos);
      setError(null);
    } catch {
      setError('No se pudieron cargar las ubicaciones. ¿El backend está arriba?');
    } finally {
      setCargando(false);
    }
  }, [ventanaMin]);

  // Carga inicial + refresco automático cada 15 s
  useEffect(() => {
    setCargando(true);
    void cargar();
    const t = setInterval(() => void cargar(), REFRESCO_MS);
    return () => clearInterval(t);
  }, [cargar]);

  async function elegir(u: UsuarioUbicacion) {
    setSeleccion(u);
    setRuta(null);
    setRutaCargando(true);
    try {
      setRuta(await obtenerRutaUbicacion(u.id_usuario, 30));
    } catch {
      setRuta(null);
    } finally {
      setRutaCargando(false);
    }
  }

  const centro = useMemo<[number, number] | undefined>(() => {
    if (!seleccion) return undefined;
    return [seleccion.latitud, seleccion.longitud];
  }, [seleccion]);

  return (
    <div className="space-y-5">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Ubicaciones en vivo (CU21)
          </h2>
          <p className="text-sm text-slate-500">
            Personas con ping GPS en los últimos{' '}
            <strong>{ventanaMin} minutos</strong> — asistente continuo o
            compartir ubicación activos en su móvil.
          </p>
        </div>
        <select
          value={ventanaMin}
          onChange={(e) => setVentanaMin(Number(e.target.value))}
          aria-label="Ventana de ubicación en vivo"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        >
          {[5, 15, 30, 60].map((v) => (
            <option key={v} value={v}>
              últimos {v} minutos
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          ⚠️ {error}
        </p>
      )}

      {/* ─── Lista de usuarios en vivo ─── */}
      {cargando && usuarios.length === 0 ? (
        <p className="text-sm text-slate-500">Cargando ubicaciones…</p>
      ) : usuarios.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Nadie está compartiendo ubicación en este momento. Los pings llegan
          cuando el usuario activa el <strong>asistente continuo</strong> o el
          toggle <strong>"Compartir mi ubicación"</strong> en la app móvil.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Panel izquierdo: usuarios */}
          <div className="space-y-3">
            {usuarios.map((u) => (
              <article
                key={u.id_usuario}
                className={cxTarjeta(u.id_usuario === seleccion?.id_usuario)}
              >
                <button
                  type="button"
                  onClick={() => void elegir(u)}
                  className="w-full text-left"
                  aria-label={`Ver en el mapa a ${u.nombre}`}
                >
                  <p className="font-semibold text-slate-800">
                    🔴 {u.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    hace {u.minutos_desde} min ·{' '}
                    {u.precision_metros != null
                      ? `±${Math.round(u.precision_metros)} m`
                      : 'precisión n/d'}{' '}
                    · {u.rol}
                  </p>
                </button>

                {u.telefono && (
                  <a
                    href={`tel:${u.telefono}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    📞 Llamar a la persona
                  </a>
                )}

                {u.contactos_autorizados.length > 0 && (
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Familiares / contactos autorizados
                    </p>
                    <ul className="mt-1 space-y-1">
                      {u.contactos_autorizados.map((c) => (
                        <li
                          key={`${u.id_usuario}-${c.nombre}-${c.telefono}`}
                          className="flex items-center justify-between gap-2 text-xs text-slate-600"
                        >
                          <span>
                            {c.nombre}
                            {c.parentesco ? ` (${c.parentesco})` : ''}
                          </span>
                          <a
                            href={`tel:${c.telefono}`}
                            className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-primary-700 hover:bg-slate-200"
                          >
                            📞 {c.telefono}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Mapa */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <MapaUsuarios
              usuarios={usuarios}
              seleccion={seleccion}
              ruta={ruta}
              centro={centro}
            />
            <p className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400">
              Mapa © OpenStreetMap · se actualiza automáticamente cada 15 s ·
              círculos = posición estimada (el radio es la precisión GPS)
            </p>
          </div>
        </div>
      )}

      {/* ─── Ruta del usuario seleccionado ─── */}
      {seleccion && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-700">
            Ruta reciente de {seleccion.nombre}
          </h3>
          {rutaCargando && (
            <p className="mt-1 text-sm text-slate-500">Cargando ruta…</p>
          )}
          {!rutaCargando && (!ruta || ruta.puntos.length === 0) && (
            <p className="mt-1 text-sm text-slate-500">
              Sin pings guardados aún para este usuario.
            </p>
          )}
          {!rutaCargando && ruta && ruta.puntos.length > 0 && (
            <ol className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-slate-600">
              {ruta.puntos.map((p, i) => (
                <li key={p.id_ubicacion}>
                  {i + 1}. {new Date(p.fecha_registro).toLocaleString('es-BO')} —{' '}
                  {p.latitud.toFixed(5)}, {p.longitud.toFixed(5)}
                  {p.precision_metros != null &&
                    ` (±${Math.round(p.precision_metros)} m)`}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

/* ═══════════════════ MAPA (sub-componente) ═══════════════════ */

function MapaUsuarios(props: {
  usuarios: UsuarioUbicacion[];
  seleccion: UsuarioUbicacion | null;
  ruta: RutaUbicacionRespuesta | null;
  centro: [number, number] | undefined;
}) {
  const { usuarios, seleccion, ruta, centro } = props;

  return (
    <div role="application" aria-label="Mapa de ubicaciones en vivo">
      <MapContainer
        center={centro ?? CENTRO_INICIAL}
        zoom={centro ? 16 : 12}
        scrollWheelZoom
        style={{ height: 460, width: '100%' }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Ruta reciente (polyline, más antigua → más nueva) */}
      {seleccion && ruta && ruta.puntos.length > 1 && (
        <Polyline
          positions={[
            ...ruta.puntos.map((p) => [p.latitud, p.longitud] as [number, number]),
          ].reverse()}
          pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.6 }}
        />
      )}

      {/* Posición actual de cada usuario en vivo */}
      {usuarios.map((u) => (
        <CircleMarker
          key={u.id_usuario}
          center={[u.latitud, u.longitud]}
          radius={u.id_usuario === seleccion?.id_usuario ? 12 : 8}
          pathOptions={{
            color: u.id_usuario === seleccion?.id_usuario ? '#1d4ed8' : '#dc2626',
            fillColor: u.id_usuario === seleccion?.id_usuario ? '#3b82f6' : '#ef4444',
            fillOpacity: 0.7,
          }}
        >
          <Tooltip permanent={false} direction="top">
            <strong>{u.nombre}</strong>
            <br />
            hace {u.minutos_desde} min
            {u.telefono ? (
              <>
                <br />
                {u.telefono}
              </>
            ) : null}
          </Tooltip>
        </CircleMarker>
      ))}
      </MapContainer>
    </div>
  );
}

/** Clase de tarjeta (seleccionada vs normal) */
function cxTarjeta(sel: boolean): string {
  return sel
    ? 'rounded-xl border-2 border-primary-500 bg-primary-50 p-3 shadow-soft'
    : 'rounded-xl border border-slate-200 bg-white p-3 shadow-soft';
}
