import { useEffect, useState } from 'react';

import { listarInstituciones } from '@/api/instituciones.api';
import {
  activarUsuario,
  desactivarUsuario,
  listarUsuarios,
} from '@/api/usuarios.api';
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
import { IconoEditar } from '@/components/ui/Iconos';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import { ModalEditarUsuario } from './ModalEditarUsuario';
import { ModalCrearUsuario } from './ModalCrearUsuario';
import {
  mensajeDeError,
  type Institucion,
  type Rol,
  type Usuario,
} from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Gestión de Usuarios (CU34) — ADMIN (escritura) e
 * INSTITUCION (solo lectura).
 *
 *   - Listado paginado + búsqueda debounced (correo/nombre)
 *   - Editar (modal): correo, rol, estado, institución
 *   - Desactivar (borrado lógico, con confirmación)
 *   - Reactivar (directo)
 * ══════════════════════════════════════════════════════
 */

const COLOR_ROL: Record<Rol, 'primary' | 'info' | 'neutral'> = {
  ADMIN: 'primary',
  INSTITUCION: 'info',
  USUARIO: 'neutral',
};

export default function PaginaUsuarios() {
  const { usuario: usuarioActual } = useAuth();
  const esAdmin = usuarioActual?.rol === 'ADMIN';

  const listado = useListado<Usuario>(listarUsuarios);
  const { alerta, mostrarAlerta, cerrarAlerta } = useAlerta();

  // Instituciones (para nombres en la tabla + select del modal)
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [creando, setCreando] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Usuario | null>(null);
  const [aDesactivar, setADesactivar] = useState<Usuario | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    // No bloquea la página si falla (ej: institución sin permisos)
    listarInstituciones({ page: 1, limit: 100 })
      .then((r) => setInstituciones(r.datos))
      .catch(() => setInstituciones([]));
  }, []);

  const nombresInstitucion = new Map<number, string>(
    instituciones.map((i) => [i.id_institucion, i.nombre] as const),
  );

  // ─── Acciones ───

  function manejarGuardado(mensaje: string) {
    setEnEdicion(null);
    mostrarAlerta('exito', mensaje);
    listado.recargar();
  }

  function manejarCreado(mensaje: string) {
    setCreando(false);
    mostrarAlerta('exito', mensaje);
    listado.recargar();
  }

  async function confirmarDesactivacion() {
    if (!aDesactivar) return;
    setProcesando(true);
    try {
      const r = await desactivarUsuario(aDesactivar.id_usuario);
      mostrarAlerta('exito', r.mensaje);
      setADesactivar(null);
      listado.recargar();
    } catch (e) {
      mostrarAlerta('error', mensajeDeError(e));
    } finally {
      setProcesando(false);
    }
  }

  async function reactivar(u: Usuario) {
    setProcesando(true);
    try {
      await activarUsuario(u.id_usuario);
      mostrarAlerta('exito', `Usuario ${u.correo} reactivado.`);
      listado.recargar();
    } catch (e) {
      mostrarAlerta('error', mensajeDeError(e));
    } finally {
      setProcesando(false);
    }
  }

  // ─── Columnas de la tabla ───
  const columnas: Columna<Usuario>[] = [
    {
      key: 'usuario',
      encabezado: 'Usuario',
      render: (u) => (
        <div>
          <p className="font-medium text-slate-800">
            {u.perfil?.nombres ?? '—'}
            {u.perfil?.apellidos ? ` ${u.perfil.apellidos}` : ''}
          </p>
          <p className="text-xs text-slate-500">{u.correo}</p>
        </div>
      ),
    },
    {
      key: 'rol',
      encabezado: 'Rol',
      render: (u) => <Badge estado={u.rol} color={COLOR_ROL[u.rol]} />,
    },
    {
      key: 'estado',
      encabezado: 'Estado',
      render: (u) => <Badge estado={u.estado} />,
    },
    {
      key: 'institucion',
      encabezado: 'Institución',
      render: (u) =>
        u.id_institucion != null
          ? (nombresInstitucion.get(u.id_institucion) ?? `#${u.id_institucion}`)
          : '—',
    },
    {
      key: 'ultimo_acceso',
      encabezado: 'Último acceso',
      render: (u) => (
        <span className="text-xs text-slate-500">
          {formatearFecha(u.ultimo_acceso)}
        </span>
      ),
    },
    ...(esAdmin
      ? [
          {
            key: 'acciones',
            encabezado: 'Acciones',
            className: 'w-36',
            render: (u: Usuario) => (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEnEdicion(u)}
                  title="Editar usuario"
                  aria-label={`Editar ${u.correo}`}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  <IconoEditar className="h-4 w-4" />
                </button>

                {u.estado === 'ACTIVO' && (
                  <button
                    type="button"
                    onClick={() => setADesactivar(u)}
                    disabled={usuarioActual?.id_usuario === u.id_usuario}
                    title={
                      usuarioActual?.id_usuario === u.id_usuario
                        ? 'No puedes desactivar tu propia cuenta'
                        : 'Desactivar usuario'
                    }
                    aria-label={`Desactivar ${u.correo}`}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Desactivar
                  </button>
                )}

                {u.estado === 'INACTIVO' && (
                  <button
                    type="button"
                    onClick={() => reactivar(u)}
                    disabled={procesando}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-success-700 transition-colors hover:bg-success-50 disabled:opacity-50"
                  >
                    Activar
                  </button>
                )}

                {u.estado === 'BLOQUEADO' && (
                  <span className="text-xs text-slate-400">Editar p/ desbloquear</span>
                )}
              </div>
            ),
          } satisfies Columna<Usuario>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* Alertas de resultado */}
      {alerta && (
        <Alerta
          variante={alerta.variante}
          onCerrar={cerrarAlerta}
          autoCerrarMs={5000}
        >
          {alerta.mensaje}
        </Alerta>
      )}

      {esAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setCreando(true)}>+ Crear usuario</Button>
        </div>
      )}

      {/* Búsqueda */}
      <section className="card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-64 flex-1">
            <Input
              label="Buscar usuario"
              type="search"
              placeholder="Correo, nombres o apellidos…"
              value={listado.buscar}
              onChange={(e) => listado.setBuscar(e.target.value)}
              hint="La búsqueda se aplica automáticamente al escribir."
            />
          </div>
          <p className="pb-2 text-xs text-slate-400">
            Las cuentas se registran desde la app móvil o el registro
            público; aquí se administran roles, estados e instituciones.
          </p>
        </div>
      </section>

      {/* Error de carga */}
      {listado.error && (
        <Alerta variante="error">{listado.error}</Alerta>
      )}

      {/* Tabla */}
      <section className="card p-4 sm:p-6">
        <TablaPaginada<Usuario>
          tituloAccesible="Listado de usuarios del sistema"
          columnas={columnas}
          datos={listado.datos}
          meta={listado.meta}
          cargando={listado.cargando}
          rowKey={(u) => u.id_usuario}
          onCambioPagina={listado.setPagina}
          mensajeVacio={
            listado.buscar
              ? 'No se encontraron usuarios con ese criterio.'
              : 'Aún no hay usuarios registrados.'
          }
        />
      </section>

      {/* Modal de edición */}
      {creando && (
        <ModalCrearUsuario
          instituciones={instituciones}
          onCerrar={() => setCreando(false)}
          onCreado={manejarCreado}
        />
      )}

      {enEdicion && (
        <ModalEditarUsuario
          usuario={enEdicion}
          instituciones={instituciones}
          onCerrar={() => setEnEdicion(null)}
          onGuardado={manejarGuardado}
        />
      )}

      {/* Confirmación de desactivación */}
      <Modal
        abierto={aDesactivar !== null}
        titulo="Desactivar usuario"
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
          ¿Desactivar la cuenta de{' '}
          <strong className="text-slate-800">{aDesactivar?.correo}</strong>?
          El usuario perderá el acceso <strong>inmediatamente</strong>, pero
          sus datos se conservan (borrado lógico) y podrá reactivarse después.
        </p>
      </Modal>
    </div>
  );
}
