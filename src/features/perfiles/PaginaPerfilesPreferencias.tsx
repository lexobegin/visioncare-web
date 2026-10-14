import { useCallback, useEffect, useState, type FormEvent } from 'react';

import {
  actualizarPreferenciasUsuario,
  obtenerPreferenciasUsuario,
} from '@/api/accesibilidad.api';
import {
  actualizarPerfilUsuario,
  obtenerUsuario,
} from '@/api/usuarios.api';
import { SelectorUsuario } from '@/components/comunes/SelectorUsuario';
import { Alerta, Button, Card, Input, Select, Spinner, useAlerta } from '@/components/ui';
import {
  mensajeDeError,
  type ActualizarPerfilPayload,
  type ActualizarPreferenciasPayload,
  type PreferenciasAccesibilidad,
  type Usuario,
} from '@/types';

export default function PaginaPerfilesPreferencias() {
  const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [preferencias, setPreferencias] =
    useState<PreferenciasAccesibilidad | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPreferencias, setGuardandoPreferencias] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const { alerta, mostrarAlerta, cerrarAlerta } = useAlerta();

  const cargarDatos = useCallback(async (idUsuario: number) => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [detalle, accesibilidad] = await Promise.all([
        obtenerUsuario(idUsuario),
        obtenerPreferenciasUsuario(idUsuario),
      ]);
      setUsuario(detalle);
      setPreferencias(accesibilidad);
    } catch (error) {
      setUsuario(null);
      setPreferencias(null);
      setErrorCarga(mensajeDeError(error));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!seleccionado) {
      setUsuario(null);
      setPreferencias(null);
      setErrorCarga(null);
      return;
    }
    void cargarDatos(seleccionado.id_usuario);
  }, [seleccionado, cargarDatos]);

  async function guardarPerfil(payload: ActualizarPerfilPayload) {
    if (!seleccionado) return;
    setGuardandoPerfil(true);
    try {
      await actualizarPerfilUsuario(seleccionado.id_usuario, payload);
      await cargarDatos(seleccionado.id_usuario);
      mostrarAlerta('exito', 'Perfil actualizado correctamente.');
    } catch (error) {
      mostrarAlerta('error', mensajeDeError(error));
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function guardarPreferencias(payload: ActualizarPreferenciasPayload) {
    if (!seleccionado) return;
    setGuardandoPreferencias(true);
    try {
      await actualizarPreferenciasUsuario(seleccionado.id_usuario, payload);
      await cargarDatos(seleccionado.id_usuario);
      mostrarAlerta('exito', 'Preferencias actualizadas correctamente.');
    } catch (error) {
      mostrarAlerta('error', mensajeDeError(error));
    } finally {
      setGuardandoPreferencias(false);
    }
  }

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

      <Card
        titulo="Seleccionar usuario"
        descripcion="Busca por correo, nombres o apellidos."
      >
        <SelectorUsuario
          seleccionado={seleccionado}
          onSeleccionar={setSeleccionado}
          etiqueta="Usuario"
        />
      </Card>

      {cargando && (
        <Card className="flex justify-center py-12">
          <Spinner etiqueta="Cargando perfil y preferencias" />
        </Card>
      )}

      {errorCarga && <Alerta variante="error">{errorCarga}</Alerta>}

      {!seleccionado && !cargando && (
        <Card className="py-10 text-center text-sm text-slate-500">
          Selecciona un usuario para revisar su perfil y sus preferencias.
        </Card>
      )}

      {usuario?.perfil && preferencias && !cargando && (
        <div className="grid gap-4 xl:grid-cols-2">
          <FormularioPerfil
            key={`perfil-${usuario.id_usuario}`}
            usuario={usuario}
            guardando={guardandoPerfil}
            onGuardar={guardarPerfil}
          />
          <FormularioPreferencias
            key={`preferencias-${preferencias.id_usuario}`}
            preferencias={preferencias}
            guardando={guardandoPreferencias}
            onGuardar={guardarPreferencias}
          />
        </div>
      )}
    </div>
  );
}

interface FormularioPerfilProps {
  usuario: Usuario;
  guardando: boolean;
  onGuardar: (payload: ActualizarPerfilPayload) => Promise<void>;
}

function FormularioPerfil({ usuario, guardando, onGuardar }: FormularioPerfilProps) {
  const perfil = usuario.perfil!;
  const [nombres, setNombres] = useState(perfil.nombres);
  const [apellidos, setApellidos] = useState(perfil.apellidos ?? '');
  const [telefono, setTelefono] = useState(perfil.telefono ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(
    perfil.fecha_nacimiento ?? '',
  );
  const [idioma, setIdioma] = useState<'es' | 'en'>(
    perfil.idioma === 'en' ? 'en' : 'es',
  );
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (nombres.trim().length < 2) {
      setError('Los nombres deben tener al menos 2 caracteres.');
      return;
    }

    await onGuardar({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim() || undefined,
      fecha_nacimiento: fechaNacimiento || undefined,
      idioma,
    });
  }

  return (
    <Card titulo="Perfil del usuario" descripcion={usuario.correo}>
      <form onSubmit={enviar} noValidate className="space-y-4">
        {error && <Alerta variante="error">{error}</Alerta>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} />
          <Input label="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        </div>
        <Input
          label="Teléfono"
          type="tel"
          value={telefono}
          placeholder="+591 70000000"
          onChange={(e) => setTelefono(e.target.value)}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
        />
        <Select
          label="Idioma"
          value={idioma}
          onChange={(e) => setIdioma(e.target.value as 'es' | 'en')}
        >
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </Select>
        <div className="flex justify-end">
          <Button type="submit" cargando={guardando}>Guardar perfil</Button>
        </div>
      </form>
    </Card>
  );
}

interface FormularioPreferenciasProps {
  preferencias: PreferenciasAccesibilidad;
  guardando: boolean;
  onGuardar: (payload: ActualizarPreferenciasPayload) => Promise<void>;
}

function FormularioPreferencias({
  preferencias,
  guardando,
  onGuardar,
}: FormularioPreferenciasProps) {
  const [formulario, setFormulario] = useState(preferencias);

  function booleano(campo: keyof ActualizarPreferenciasPayload, valor: boolean) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function numero(campo: keyof ActualizarPreferenciasPayload, valor: number) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    await onGuardar({
      voz_habilitada: formulario.voz_habilitada,
      volumen_voz: formulario.volumen_voz,
      velocidad_voz: formulario.velocidad_voz,
      alertas_sonoras: formulario.alertas_sonoras,
      vibracion_habilitada: formulario.vibracion_habilitada,
      intensidad_vibracion: formulario.intensidad_vibracion,
      confirmaciones_por_voz: formulario.confirmaciones_por_voz,
      modo_bajo_consumo: formulario.modo_bajo_consumo,
    });
  }

  return (
    <Card titulo="Preferencias de accesibilidad">
      <form onSubmit={enviar} className="space-y-4">
        <CampoBooleano
          etiqueta="Voz habilitada"
          checked={formulario.voz_habilitada}
          onChange={(valor) => booleano('voz_habilitada', valor)}
        />
        <Input
          label="Volumen de voz"
          type="number"
          min={0}
          max={100}
          value={formulario.volumen_voz}
          onChange={(e) => numero('volumen_voz', Number(e.target.value))}
        />
        <Input
          label="Velocidad de voz"
          type="number"
          min={0.5}
          max={3}
          step={0.1}
          value={formulario.velocidad_voz}
          onChange={(e) => numero('velocidad_voz', Number(e.target.value))}
        />
        <CampoBooleano
          etiqueta="Alertas sonoras"
          checked={formulario.alertas_sonoras}
          onChange={(valor) => booleano('alertas_sonoras', valor)}
        />
        <CampoBooleano
          etiqueta="Vibración habilitada"
          checked={formulario.vibracion_habilitada}
          onChange={(valor) => booleano('vibracion_habilitada', valor)}
        />
        <Input
          label="Intensidad de vibración"
          type="number"
          min={0}
          max={100}
          value={formulario.intensidad_vibracion}
          onChange={(e) => numero('intensidad_vibracion', Number(e.target.value))}
        />
        <CampoBooleano
          etiqueta="Confirmaciones por voz"
          checked={formulario.confirmaciones_por_voz}
          onChange={(valor) => booleano('confirmaciones_por_voz', valor)}
        />
        <CampoBooleano
          etiqueta="Modo de bajo consumo"
          checked={formulario.modo_bajo_consumo}
          onChange={(valor) => booleano('modo_bajo_consumo', valor)}
        />
        <div className="flex justify-end">
          <Button type="submit" cargando={guardando}>
            Guardar preferencias
          </Button>
        </div>
      </form>
    </Card>
  );
}

function CampoBooleano({
  etiqueta,
  checked,
  onChange,
}: {
  etiqueta: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
      {etiqueta}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary-600"
      />
    </label>
  );
}
