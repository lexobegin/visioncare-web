import { useEffect, useRef, useState } from 'react';

import { listarUsuarios } from '@/api/usuarios.api';
import { Spinner } from '@/components/ui/Spinner';
import { IconoCerrar, IconoUsuarios } from '@/components/ui/Iconos';
import type { Usuario } from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Buscador de usuarios con dropdown (debounce 400 ms).
 * Reutilizado por: Contactos (CU36) e Historial (modo admin).
 *
 * Estados: vacío (input) → seleccionado (chip con ✕).
 * ══════════════════════════════════════════════════════
 */

interface SelectorUsuarioProps {
  seleccionado: Usuario | null;
  onSeleccionar: (usuario: Usuario | null) => void;
  etiqueta?: string;
}

export function SelectorUsuario({
  seleccionado,
  onSeleccionar,
  etiqueta = 'Buscar usuario',
}: SelectorUsuarioProps) {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);

  const refContenedor = useRef<HTMLDivElement>(null);

  // Búsqueda con debounce (solo si no hay selección activa)
  useEffect(() => {
    if (seleccionado) return;

    const temporizador = setTimeout(() => {
      const buscar = texto.trim();
      if (buscar.length === 0) {
        setResultados([]);
        setAbierto(false);
        return;
      }
      setCargando(true);
      listarUsuarios({ page: 1, limit: 10, buscar })
        .then((r) => {
          setResultados(r.datos);
          setAbierto(true);
        })
        .catch(() => setResultados([]))
        .finally(() => setCargando(false));
    }, 400);

    return () => clearTimeout(temporizador);
  }, [texto, seleccionado]);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function clicFuera(e: MouseEvent) {
      if (
        refContenedor.current &&
        !refContenedor.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', clicFuera);
    return () => document.removeEventListener('mousedown', clicFuera);
  }, []);

  // ─── Usuario seleccionado: chip ───
  if (seleccionado) {
    const nombre = seleccionado.perfil?.nombres ?? seleccionado.correo;
    return (
      <div>
        <span className="label-field">{etiqueta}</span>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {nombre}
                {seleccionado.perfil?.apellidos
                  ? ` ${seleccionado.perfil.apellidos}`
                  : ''}
              </p>
              <p className="truncate text-xs text-slate-500">
                {seleccionado.correo} · {seleccionado.rol}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSeleccionar(null)}
            aria-label="Quitar usuario seleccionado"
            title="Quitar selección"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary-100 hover:text-slate-600"
          >
            <IconoCerrar className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Sin selección: buscador ───
  return (
    <div ref={refContenedor} className="relative">
      <label htmlFor="selector-usuario" className="label-field">
        {etiqueta}
      </label>

      <input
        id="selector-usuario"
        type="search"
        role="combobox"
        aria-expanded={abierto}
        aria-controls="selector-usuario-lista"
        autoComplete="off"
        placeholder="Correo, nombres o apellidos…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="input-field"
      />

      {cargando && (
        <div className="absolute right-3 top-9">
          <Spinner tamano="sm" etiqueta="Buscando usuarios" />
        </div>
      )}

      {abierto && (
        <div
          id="selector-usuario-lista"
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-pop"
        >
          {resultados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">
              Sin resultados.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {resultados.map((u) => (
                <li key={u.id_usuario}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      onSeleccionar(u);
                      setAbierto(false);
                      setTexto('');
                      setResultados([]);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary-50"
                  >
                    <IconoUsuarios className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {u.perfil?.nombres ?? u.correo}
                        {u.perfil?.apellidos
                          ? ` ${u.perfil.apellidos}`
                          : ''}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {u.correo} · {u.rol} · {u.estado}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}