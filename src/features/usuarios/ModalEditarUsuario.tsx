import { useState, type FormEvent } from 'react';

import { actualizarUsuario } from '@/api/usuarios.api';
import { useAuth } from '@/hooks/useAuth';
import { Alerta, Button, Input, Modal, Select } from '@/components/ui';
import {
  mensajeDeError,
  type AdminActualizarUsuarioPayload,
  type EstadoUsuario,
  type Institucion,
  type Rol,
  type Usuario,
} from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Modal de edición de usuario (CU34 — solo ADMIN).
 *
 * Envía SOLO los campos modificados (PATCH parcial, igual
 * que el AdminActualizarUsuarioDto del backend).
 *
 * Protecciones:
 *   - No puedes cambiar tu PROPIO estado (self-lockout).
 *   - Tras editar tu propia cuenta, la sesión se refresca
 *     (refrescarPerfil) por si cambió el rol.
 * ══════════════════════════════════════════════════════
 */

interface ModalEditarUsuarioProps {
  usuario: Usuario;
  instituciones: Institucion[];
  onCerrar: () => void;
  /** El padre cierra, muestra alerta y recarga el listado */
  onGuardado: (mensaje: string) => void;
}

export function ModalEditarUsuario({
  usuario,
  instituciones,
  onCerrar,
  onGuardado,
}: ModalEditarUsuarioProps) {
  const { usuario: usuarioActual, refrescarPerfil } = useAuth();

  const [correo, setCorreo] = useState(usuario.correo);
  const [rol, setRol] = useState<Rol>(usuario.rol);
  const [estado, setEstado] = useState<EstadoUsuario>(usuario.estado);
  const [idInstitucion, setIdInstitucion] = useState(
    usuario.id_institucion != null ? String(usuario.id_institucion) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esPerfilPropio = usuarioActual?.id_usuario === usuario.id_usuario;
  const institucionOriginal = usuario.id_institucion ?? null;
  const nombreInstitucionActual = instituciones.find(
    (i) => i.id_institucion === institucionOriginal,
  )?.nombre;

  async function manejarGuardado(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // ─── Construir payload SOLO con cambios ───
    const payload: AdminActualizarUsuarioPayload = {};

    const correoLimpio = correo.trim().toLowerCase();
    if (!correoLimpio) {
      setError('El correo es obligatorio.');
      return;
    }
    if (correoLimpio !== usuario.correo) payload.correo = correoLimpio;
    if (rol !== usuario.rol) payload.rol = rol;
    if (estado !== usuario.estado) payload.estado = estado;

    const nuevoId = idInstitucion === '' ? null : Number(idInstitucion);
    if (nuevoId !== institucionOriginal) payload.id_institucion = nuevoId;

    if (Object.keys(payload).length === 0) {
      setError('No hay cambios por guardar.');
      return;
    }

    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id_usuario, payload);
      if (esPerfilPropio) void refrescarPerfil();
      onGuardado(`Usuario ${correoLimpio} actualizado correctamente.`);
      // No liberamos `guardando`: el padre desmonta el modal
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal
      abierto
      titulo={`Editar: ${usuario.perfil?.nombres ?? usuario.correo}`}
      onCerrar={onCerrar}
    >
      <form onSubmit={manejarGuardado} noValidate className="space-y-4">
        {/* Datos del perfil (informativo, se editan en CU04) */}
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">
            {usuario.perfil?.nombres ?? 'Sin perfil'}
            {usuario.perfil?.apellidos ? ` ${usuario.perfil.apellidos}` : ''}
          </span>
          <span className="text-slate-400"> · registrado el perfil asociado</span>
        </div>

        {error && (
          <Alerta variante="error" onCerrar={() => setError(null)}>
            {error}
          </Alerta>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
          >
            <option value="USUARIO">USUARIO</option>
            <option value="ADMIN">ADMIN</option>
            <option value="INSTITUCION">INSTITUCION</option>
          </Select>

          <Select
            label="Estado"
            value={estado}
            disabled={esPerfilPropio}
            hint={esPerfilPropio ? 'No puedes cambiar tu propio estado.' : undefined}
            onChange={(e) => setEstado(e.target.value as EstadoUsuario)}
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="BLOQUEADO">BLOQUEADO</option>
          </Select>
        </div>

        <Select
          label="Institución"
          value={idInstitucion}
          hint={
            nombreInstitucionActual
              ? `Actual: ${nombreInstitucionActual}`
              : undefined
          }
          onChange={(e) => setIdInstitucion(e.target.value)}
        >
          <option value="">Sin institución</option>
          {instituciones.map((i) => (
            <option key={i.id_institucion} value={String(i.id_institucion)}>
              {i.nombre}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variante="secundario"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}