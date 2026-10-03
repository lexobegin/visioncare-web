import { useEffect, useState } from 'react';

import { listarContactosDeUsuario } from '@/api/contactos.api';
import { useListado } from '@/hooks/useListado';
import { Alerta, Badge, Card, Select } from '@/components/ui';
import { IconoContacto } from '@/components/ui/Iconos';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import { SelectorUsuario } from '@/components/comunes/SelectorUsuario';
import type { Contacto, Usuario } from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Contactos de Confianza de un usuario (CU36 — solo lectura).
 *
 * Flujo: seleccionar usuario (buscador) → ver sus contactos
 * con filtro de estado. La EDICIÓN de contactos la hace el
 * propio usuario desde la app móvil (diseño del backend).
 * ══════════════════════════════════════════════════════
 */

type FiltroEstado = 'ACTIVO' | 'INACTIVO' | 'TODOS';

export default function PaginaContactos() {
  const [usuarioSel, setUsuarioSel] = useState<Usuario | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('ACTIVO');

  const listado = useListado<Contacto>((consulta) => {
    if (!usuarioSel) {
      return Promise.resolve({
        ok: true,
        datos: [],
        meta: {
          page: 1,
          limit: consulta.limit ?? 10,
          total: 0,
          totalPaginas: 0,
        },
      });
    }
    return listarContactosDeUsuario(usuarioSel.id_usuario, {
      ...consulta,
      estado: filtroEstado,
    });
  });

  // Recarga al cambiar usuario o filtro (y resetea a página 1)
  useEffect(() => {
    listado.setPagina(1);
    listado.recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioSel, filtroEstado]);

  const columnas: Columna<Contacto>[] = [
    {
      key: 'nombre',
      encabezado: 'Contacto',
      render: (c) => (
        <div>
          <p className="font-medium text-slate-800">{c.nombre}</p>
          {c.parentesco && (
            <p className="text-xs text-slate-500">{c.parentesco}</p>
          )}
        </div>
      ),
    },
    {
      key: 'telefono',
      encabezado: 'Teléfono',
      render: (c) => c.telefono ?? '—',
    },
    {
      key: 'correo',
      encabezado: 'Correo',
      render: (c) => (
        <span className="text-xs text-slate-600">{c.correo ?? '—'}</span>
      ),
    },
    {
      key: 'prioridad',
      encabezado: 'Prioridad',
      render: (c) => (
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-100 px-1.5 text-xs font-bold text-primary-800">
          {c.prioridad}
        </span>
      ),
    },
    {
      key: 'autorizaciones',
      encabezado: 'Autorizaciones',
      render: (c) => (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span
            title="Autorizado para recibir ubicación"
            className={
              c.autorizado_ubicacion
                ? 'rounded-full bg-info-100 px-2 py-0.5 font-semibold text-info-800'
                : 'rounded-full bg-slate-100 px-2 py-0.5 text-slate-400'
            }
          >
            📍 {c.autorizado_ubicacion ? 'Ubicación' : 'Sin ubicación'}
          </span>
          <span
            title="Autorizado para recibir emergencias"
            className={
              c.autorizado_emergencias
                ? 'rounded-full bg-danger-100 px-2 py-0.5 font-semibold text-danger-800'
                : 'rounded-full bg-slate-100 px-2 py-0.5 text-slate-400'
            }
          >
            🚨 {c.autorizado_emergencias ? 'Emergencias' : 'Sin emergencias'}
          </span>
        </div>
      ),
    },
    {
      key: 'estado',
      encabezado: 'Estado',
      render: (c) => <Badge estado={c.estado} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Selector de usuario */}
      <section className="card p-4 sm:p-6">
        <SelectorUsuario
          etiqueta="Selecciona un usuario para ver sus contactos"
          seleccionado={usuarioSel}
          onSeleccionar={setUsuarioSel}
        />
        <p className="mt-2 text-xs text-slate-400">
          Los contactos se gestionan desde la app móvil del usuario;
          aquí se consultan para supervisión y soporte.
        </p>
      </section>

      {/* Filtro de estado (solo con usuario seleccionado) */}
      {usuarioSel && (
        <section className="card flex flex-wrap items-end gap-3 p-4">
          <div className="w-48">
            <Select
              label="Estado del contacto"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
            >
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
              <option value="TODOS">Todos</option>
            </Select>
          </div>
          <p className="pb-2 text-xs text-slate-400">
            Ordenados por prioridad de notificación (1 = primero).
          </p>
        </section>
      )}

      {listado.error && <Alerta variante="error">{listado.error}</Alerta>}

      {/* Tabla de contactos */}
      <Card titulo={usuarioSel ? `Contactos de ${usuarioSel.perfil?.nombres ?? usuarioSel.correo}` : 'Contactos'}>
        {!usuarioSel ? (
          <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
            <IconoContacto className="h-12 w-12" />
            <p className="text-sm">
              Selecciona un usuario arriba para consultar sus contactos de
              confianza.
            </p>
          </div>
        ) : (
          <TablaPaginada<Contacto>
            tituloAccesible={`Contactos de confianza del usuario ${usuarioSel.correo}`}
            columnas={columnas}
            datos={listado.datos}
            meta={listado.meta}
            cargando={listado.cargando}
            rowKey={(c) => c.id_contacto}
            onCambioPagina={listado.setPagina}
            mensajeVacio={
              filtroEstado === 'ACTIVO'
                ? 'Este usuario aún no tiene contactos activos.'
                : 'Sin contactos para este filtro.'
            }
          />
        )}
      </Card>
    </div>
  );
}