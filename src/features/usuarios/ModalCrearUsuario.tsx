import { useState, type FormEvent } from 'react';

import { crearUsuario } from '@/api/usuarios.api';
import { Alerta, Button, Input, Modal, Select } from '@/components/ui';
import {
  mensajeDeError,
  type AdminCrearUsuarioPayload,
  type Institucion,
  type Rol,
} from '@/types';

interface ModalCrearUsuarioProps {
  instituciones: Institucion[];
  onCerrar: () => void;
  onCreado: (mensaje: string) => void;
}

export function ModalCrearUsuario({
  instituciones,
  onCerrar,
  onCreado,
}: ModalCrearUsuarioProps) {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<Rol>('USUARIO');
  const [idInstitucion, setIdInstitucion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function manejarGuardado(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const nombresLimpios = nombres.trim();
    const correoLimpio = correo.trim().toLowerCase();
    if (nombresLimpios.length < 2) {
      setError('Los nombres deben tener al menos 2 caracteres.');
      return;
    }
    if (!correoLimpio) {
      setError('El correo es obligatorio.');
      return;
    }

    const payload: AdminCrearUsuarioPayload = {
      nombres: nombresLimpios,
      apellidos: apellidos.trim() || undefined,
      correo: correoLimpio,
      contrasena,
      rol,
      id_institucion:
        idInstitucion === '' ? null : Number(idInstitucion),
    };

    setGuardando(true);
    try {
      await crearUsuario(payload);
      onCreado(`Usuario ${correoLimpio} creado correctamente.`);
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal abierto titulo="Crear usuario" onCerrar={onCerrar}>
      <form onSubmit={manejarGuardado} noValidate className="space-y-4">
        {error && (
          <Alerta variante="error" onCerrar={() => setError(null)}>
            {error}
          </Alerta>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
          />
          <Input
            label="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />
        </div>

        <Input
          label="Correo electrónico"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <Input
          label="Contraseña inicial"
          type="password"
          value={contrasena}
          hint="Mínimo 8 caracteres, con mayúscula, minúscula y número."
          onChange={(e) => setContrasena(e.target.value)}
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
            label="Institución"
            value={idInstitucion}
            onChange={(e) => setIdInstitucion(e.target.value)}
          >
            <option value="">Sin institución</option>
            {instituciones.map((i) => (
              <option key={i.id_institucion} value={String(i.id_institucion)}>
                {i.nombre}
              </option>
            ))}
          </Select>
        </div>

        <p className="text-xs text-slate-500">
          La cuenta se creará con estado ACTIVO.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variante="secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            Crear usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
