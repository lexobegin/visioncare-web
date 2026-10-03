import { useState, type FormEvent } from 'react';

import {
  actualizarInstitucion,
  crearInstitucion,
} from '@/api/instituciones.api';
import { Alerta, Button, Input, Modal, Textarea } from '@/components/ui';
import {
  mensajeDeError,
  type Institucion,
} from '@/types';

/**
 * ══════════════════════════════════════════════════════
 * Modal de creación/edición de instituciones (solo ADMIN).
 * `institucion === null` → modo CREAR; con objeto → EDITAR
 * (envía solo los campos modificados, PATCH parcial).
 * ══════════════════════════════════════════════════════
 */

interface Props {
  institucion: Institucion | null;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

const REGEX_TELEFONO = /^[+0-9\s().-]{7,30}$/;
const REGEX_CORREO = /^\S+@\S+\.\S+$/;

export function ModalFormularioInstitucion({
  institucion,
  onCerrar,
  onGuardado,
}: Props) {
  const esEdicion = institucion !== null;

  const [nombre, setNombre] = useState(institucion?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(
    institucion?.descripcion ?? '',
  );
  const [telefono, setTelefono] = useState(institucion?.telefono ?? '');
  const [correo, setCorreo] = useState(institucion?.correo ?? '');
  const [direccion, setDireccion] = useState(institucion?.direccion ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function validar(): boolean {
    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }
    if (telefono.trim() && !REGEX_TELEFONO.test(telefono.trim())) {
      setError('El teléfono no tiene un formato válido (ej: +591 2 1234567).');
      return false;
    }
    if (correo.trim() && !REGEX_CORREO.test(correo.trim())) {
      setError('El correo no tiene un formato válido.');
      return false;
    }
    return true;
  }

  async function manejarGuardado(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validar()) return;

    setGuardando(true);
    try {
      if (esEdicion && institucion) {
        // PATCH: solo los campos que cambiaron
        const payload: Record<string, string> = {};
        const nombreNuevo = nombre.trim();
        const correoNuevo = correo.trim().toLowerCase();

        if (nombreNuevo !== institucion.nombre)
          payload.nombre = nombreNuevo;
        if (descripcion !== (institucion.descripcion ?? ''))
          payload.descripcion = descripcion;
        if (telefono.trim() !== (institucion.telefono ?? ''))
          payload.telefono = telefono.trim();
        if (correoNuevo !== (institucion.correo ?? ''))
          payload.correo = correoNuevo;
        if (direccion !== (institucion.direccion ?? ''))
          payload.direccion = direccion;

        if (Object.keys(payload).length > 0) {
          await actualizarInstitucion(
            institucion.id_institucion,
            payload,
          );
        }
        onGuardado(
          `Institución "${nombre.trim()}" actualizada correctamente.`,
        );
      } else {
        // POST: solo los campos con contenido
        await crearInstitucion({
          nombre: nombre.trim(),
          ...(descripcion.trim() && { descripcion: descripcion.trim() }),
          ...(telefono.trim() && { telefono: telefono.trim() }),
          ...(correo.trim() && { correo: correo.trim().toLowerCase() }),
          ...(direccion.trim() && { direccion: direccion.trim() }),
        });
        onGuardado(
          `Institución "${nombre.trim()}" creada correctamente.`,
        );
      }
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal
      abierto
      titulo={esEdicion ? 'Editar institución' : 'Nueva institución'}
      onCerrar={onCerrar}
    >
      <form onSubmit={manejarGuardado} noValidate className="space-y-4">
        {error && (
          <Alerta variante="error" onCerrar={() => setError(null)}>
            {error}
          </Alerta>
        )}

        <Input
          label="Nombre *"
          value={nombre}
          placeholder="Fundación Visión Bolivia"
          hint="Nombre único de la institución (3–150 caracteres)."
          onChange={(e) => setNombre(e.target.value)}
        />

        <Textarea
          label="Descripción"
          value={descripcion}
          placeholder="Breve descripción de la institución…"
          rows={3}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Teléfono"
            type="tel"
            value={telefono}
            placeholder="+591 2 1234567"
            onChange={(e) => setTelefono(e.target.value)}
          />
          <Input
            label="Correo"
            type="email"
            value={correo}
            placeholder="contacto@institucion.org"
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <Input
          label="Dirección"
          value={direccion}
          placeholder="Av. Ballivián 456, Cochabamba"
          onChange={(e) => setDireccion(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variante="secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            {esEdicion ? 'Guardar cambios' : 'Crear institución'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}