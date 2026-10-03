import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ConsultaPaginada,
  MetaPaginacion,
  RespuestaPaginada,
} from '@/types';
import { mensajeDeError } from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Hook genérico para listados paginados del backend.
 *
 * Gestiona: datos + meta + cargando + error, número de
 * página, búsqueda con DEBOUNCE (reinicia a página 1) y
 * recarga manual (tras crear/editar/eliminar).
 *
 * El fetcher va en un ref: las funciones de módulo de
 * api/*.ts se pasan directo sin useCallback.
 *
 * Uso:
 *   const listado = useListado<Usuario>(listarUsuarios);
 *   listado.datos / .meta / .cargando / .error
 *   listado.pagina / .setPagina / .buscar / .setBuscar
 *   listado.recargar()
 * ══════════════════════════════════════════════════════
 */

interface OpcionesUseListado {
  /** Registros por página (default 10) */
  limite?: number;
  /** Espera del debounce de búsqueda en ms (default 400) */
  busquedaDebounceMs?: number;
}

export function useListado<T>(
  fetcher: (consulta: ConsultaPaginada) => Promise<RespuestaPaginada<T>>,
  opciones?: OpcionesUseListado,
) {
  const limite = opciones?.limite ?? 10;
  const debounceMs = opciones?.busquedaDebounceMs ?? 400;

  const [datos, setDatos] = useState<T[]>([]);
  const [meta, setMeta] = useState<MetaPaginacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagina, setPagina] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [sello, setSello] = useState(0); // dispara recargas manuales

  // Ref estable: evita requerir useCallback en el llamador
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Debounce del texto de búsqueda (reinicia a página 1)
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(buscar.trim());
      setPagina(1);
    }, debounceMs);
    return () => clearTimeout(temporizador);
  }, [buscar, debounceMs]);

  // Carga de datos (se dispara por página, búsqueda o recarga)
  useEffect(() => {
    let cancelado = false;
    setCargando(true);

    fetcherRef.current({
      page: pagina,
      limit: limite,
      buscar: busquedaAplicada || undefined,
    })
      .then((respuesta) => {
        if (cancelado) return;
        setDatos(respuesta.datos);
        setMeta(respuesta.meta);
        setError(null);
      })
      .catch((e) => {
        if (cancelado) return;
        setError(mensajeDeError(e));
        setDatos([]);
        setMeta(null);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pagina, busquedaAplicada, sello, limite]);

  const recargar = useCallback(() => setSello((s) => s + 1), []);

  return {
    datos,
    meta,
    cargando,
    error,
    pagina,
    setPagina,
    buscar,
    setBuscar,
    recargar,
  };
}