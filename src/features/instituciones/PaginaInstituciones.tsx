import { useState } from 'react';

import {
  activarInstitucion,
  desactivarInstitucion,
  listarInstituciones,
} from '@/api/instituciones.api';
import { useAuth } from '@/hooks/useAuth';
import { useListado } from '@/hooks/useListado';
import {
  Alerta,
  Badge,
  Button,
  Input,
  Modal,
  useAlerta,
} from '@/components/ui';
import { IconoEditar, IconoMas } from '@/components/ui/Iconos';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import { ModalFormularioInstitucion } from './ModalFormularioInstitucion';
import { mensajeDeError, type Institucion } from '@/types';
import { formatearFechaCorta } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Gestión de Instituciones:
 *   ADMIN  → crear / editar / desactivar / reactivar
 *   INSTITUCION → solo lectura
 * ══════════════════════════════════════════════════════
 */

export default function PaginaInstituciones() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const listado = useListado<Institucion>(listarInstituciones);
  const { alerta, mostrarAlerta, cerrarAlerta } = useAlerta();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Institucion | null>(null);
  const [aDesactivar, setADesactivar] = useState<Institucion | null>(null);
  const [procesando, setProcesando] = useState(false);

  async function confirmarDesactivacion() {
    if (!aDesactivar) return;
    setProcesando(true);
    try {
      const r = await desactivarInstitucion(aDesactivar.id_institucion);
      mostrarAlerta('exito', r.mensaje);
      setADesactivar(null);
      listado.recargar();
    } catch (e) {
      mostrarAlerta('error', mensajeDeError(e));
    } finally {
      setProcesando(false);
    }
  }

  async function reactivar(i: Institucion) {
    setProcesando(true);
    try {
      await activarInstitucion(i.id_institucion);
      mostrarAlerta('exito', `Institución "${i.nombre}" activada.`);
      listado.recargar();
    } catch (e) {
      mostrarAlerta('error', mensajeDeError(e));
    } finally {
      setProcesando(false);
    }
  }

  const columnas: Columna<Institucion>[] = [
    {
      key: 'nombre',
      encabezado: 'Institución',
      render: (i) => (
        <div>
          <p className="font-medium text-slate-800">{i.nombre}</p>
          {i.descripcion && (
            <p className="max-w-64 truncate text-xs text-slate-500">
              {i.descripcion}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'contacto',
      encabezado: 'Contacto',
      render: (i) => (
        <div className="text-xs">
          <p className="text-slate-600">{i.telefono ?? '—'}</p>
          <p className="text-slate-400">{i.correo ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'total_usuarios',
      encabezado: 'Usuarios',
      render: (i) => (
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
          {i.total_usuarios}
        </span>
      ),
    },
    { key: 'estado', encabezado: 'Estado', render: (i) => <Badge estado={i.estado} /> },
    {
      key: 'created_at',
      encabezado: 'Registro',
      render: (i) => (
        <span className="text-xs text-slate-500">
          {formatearFechaCorta(i.created_at)}
        </span>
      ),
    },
    ...(esAdmin
      ? [
          {
            key: 'acciones',
            encabezado: 'Acciones',
            className: 'w-40',
            render: (i: Institucion) => (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEnEdicion(i)}
                  title="Editar institución"
                  aria-label={`Editar ${i.nombre}`}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  <IconoEditar className="h-4 w-4" />
                </button>
                {i.estado === 'ACTIVA' ? (
                  <button
                    type="button"
                    onClick={() => setADesactivar(i)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-50"
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => reactivar(i)}
                    disabled={procesando}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-success-700 transition-colors hover:bg-success-50 disabled:opacity-50"
                  >
                    Activar
                  </button>
                )}
              </div>
            ),
          } satisfies Columna<Institucion>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {alerta && (
        <Alerta
          variante={alerta.variante}
          onCerrar={cerrarAlerta}
          autoCerrarMs={5000}
        >
          {alerta.mensaje}
        </Alerta>
      )}

      {/* Búsqueda + botón nuevo */}
      <section className="card flex flex-wrap items-end justify-between gap-3 p-4">
        <div className="min-w-64 flex-1">
          <Input
            label="Buscar institución"
            type="search"
            placeholder="Nombre o correo…"
            value={listado.buscar}
            onChange={(e) => listado.setBuscar(e.target.value)}
          />
        </div>
        {esAdmin && (
          <Button
            onClick={() => {
              setEnEdicion(null);
              setModalAbierto(true);
            }}
          >
            <IconoMas className="h-4 w-4" />
            Nueva institución
          </Button>
        )}
      </section>

      {listado.error && <Alerta variante="error">{listado.error}</Alerta>}

      <section className="card p-4 sm:p-6">
        <TablaPaginada<Institucion>
          tituloAccesible="Listado de instituciones"
          columnas={columnas}
          datos={listado.datos}
          meta={listado.meta}
          cargando={listado.cargando}
          rowKey={(i) => i.id_institucion}
          onCambioPagina={listado.setPagina}
          mensajeVacio={
            listado.buscar
              ? 'No se encontraron instituciones con ese criterio.'
              : 'Aún no hay instituciones registradas.'
          }
        />
      </section>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <ModalFormularioInstitucion
          institucion={null}
          onCerrar={() => setModalAbierto(false)}
          onGuardado={(m) => {
            setModalAbierto(false);
            mostrarAlerta('exito', m);
            listado.recargar();
          }}
        />
      )}
      {enEdicion && (
        <ModalFormularioInstitucion
          institucion={enEdicion}
          onCerrar={() => setEnEdicion(null)}
          onGuardado={(m) => {
            setEnEdicion(null);
            mostrarAlerta('exito', m);
            listado.recargar();
          }}
        />
      )}

      {/* Confirmación de desactivación */}
      <Modal
        abierto={aDesactivar !== null}
        titulo="Desactivar institución"
        tamano="sm"
        onCerrar={() => setADesactivar(null)}
        footer={
          <>
            <Button
              variante="secundario"
              onClick={() => setADesactivar(null)}
              disabled={procesando}
            >
              Cancelar
            </Button>
            <Button
              variante="peligro"
              cargando={procesando}
              onClick={confirmarDesactivacion}
            >
              Desactivar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Desactivar <strong className="text-slate-800">{aDesactivar?.nombre}</strong>?
          Sus usuarios quedarán con la institución asignada pero la
          institución dejará de ser operativa. Es un borrado lógico
          (reactivable).
        </p>
      </Modal>
    </div>
  );
}