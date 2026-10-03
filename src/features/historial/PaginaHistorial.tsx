import { useEffect, useState } from 'react';

import {
  listarActividades,
  listarActividadesDeUsuario,
} from '@/api/historial.api';
import { useAuth } from '@/hooks/useAuth';
import { useListado } from '@/hooks/useListado';
import { Alerta, Badge, Card, Input, Select } from '@/components/ui';
import {
  TablaPaginada,
  type Columna,
} from '@/components/comunes/TablaPaginada';
import { SelectorUsuario } from '@/components/comunes/SelectorUsuario';
import type {
  Actividad,
  FuenteActividad,
  Usuario,
} from '@/types';
import { formatearFecha } from '@/utils/fechas';

/**
 * ══════════════════════════════════════════════════════
 * Historial de Actividades (CU37):
 *
 *   - Feed CONSOLIDADO (eventos + comandos de voz + capturas)
 *     o solo eventos explícitos (checkbox).
 *   - Filtros: tipo de actividad, rango de fechas, búsqueda.
 *   - ADMIN: puede ver el historial de otro usuario
 *     (SelectorUsuario → /historial/usuario/:id).
 * ══════════════════════════════════════════════════════
 */

const TIPOS_FILTRO = [
  { valor: '', etiqueta: 'Todos los tipos' },
  { valor: 'COMANDO_VOZ', etiqueta: 'Comandos de voz' },
  { valor: 'CAPTURA_ENTORNO', etiqueta: 'Capturas de entorno' },
  { valor: 'USUARIO_REGISTRADO', etiqueta: 'Usuarios registrados' },
  { valor: 'SESION_INICIADA', etiqueta: 'Inicios de sesión' },
  { valor: 'PERFIL_ACTUALIZADO', etiqueta: 'Perfiles actualizados' },
  { valor: 'CONTRASENA_CAMBIADA', etiqueta: 'Contraseñas cambiadas' },
];

const ICONO_FUENTE: Record<FuenteActividad, string> = {
  EVENTO: '📋',
  VOZ: '🎤',
  CAPTURA: '📷',
};

const COLOR_FUENTE: Record<FuenteActividad, 'neutral' | 'primary' | 'success'> = {
  EVENTO: 'neutral',
  VOZ: 'primary',
  CAPTURA: 'success',
};

export default function PaginaHistorial() {
  const { usuario: usuarioActual } = useAuth();
  const esAdmin = usuarioActual?.rol === 'ADMIN';

  const [usuarioSel, setUsuarioSel] = useState<Usuario | null>(null);
  const [tipo, setTipo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [consolidado, setConsolidado] = useState(true);

  const listado = useListado<Actividad>((consulta) => {
    const query = {
      ...consulta,
      tipo_actividad: tipo || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      consolidado,
    };

    return usuarioSel
      ? listarActividadesDeUsuario(usuarioSel.id_usuario, query)
      : listarActividades(query);
  });

  // Recarga al cambiar cualquier filtro
  useEffect(() => {
    listado.setPagina(1);
    listado.recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, fechaDesde, fechaHasta, consolidado, usuarioSel]);

  const columnas: Columna<Actividad>[] = [
    {
      key: 'fuente',
      encabezado: 'Fuente',
      className: 'w-32',
      render: (a) => (
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-base">
            {ICONO_FUENTE[a.fuente]}
          </span>
          <Badge estado={a.fuente} color={COLOR_FUENTE[a.fuente]} />
        </div>
      ),
    },
    {
      key: 'actividad',
      encabezado: 'Actividad',
      render: (a) => (
        <div>
          <p className="text-slate-700">{a.descripcion ?? a.tipo_actividad}</p>
          <p className="text-xs text-slate-400">{a.tipo_actividad}</p>
        </div>
      ),
    },
    {
      key: 'referencia',
      encabezado: 'Ref.',
      className: 'w-20',
      render: (a) => (
        <span className="text-xs text-slate-400">
          {a.referencia_id != null ? `#${a.referencia_id}` : '—'}
        </span>
      ),
    },
    {
      key: 'fecha',
      encabezado: 'Fecha',
      className: 'w-48',
      render: (a) => (
        <span className="text-xs text-slate-500">
          {formatearFecha(a.fecha)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <section className="card space-y-4 p-4 sm:p-6">
        {esAdmin && (
          <SelectorUsuario
            etiqueta={
              usuarioSel
                ? 'Viendo el historial de:'
                : 'Ver el historial de otro usuario (opcional, ADMIN)'
            }
            seleccionado={usuarioSel}
            onSeleccionar={setUsuarioSel}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Tipo de actividad"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {TIPOS_FILTRO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </Select>

          <Input
            label="Desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />

          <Input
            label="Hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />

          <div className="flex items-end pb-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={consolidado}
                onChange={(e) => setConsolidado(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Incluir voz y capturas
            </label>
          </div>
        </div>

        <Input
          label="Buscar en las descripciones"
          type="search"
          placeholder="Ej: login, comando, captura…"
          value={listado.buscar}
          onChange={(e) => listado.setBuscar(e.target.value)}
          hint="La búsqueda se aplica automáticamente al escribir."
        />
      </section>

      {listado.error && <Alerta variante="error">{listado.error}</Alerta>}

      {/* Feed */}
      <Card
        titulo={
          usuarioSel
            ? `Historial de ${usuarioSel.perfil?.nombres ?? usuarioSel.correo}`
            : 'Mi historial de actividades'
        }
        descripcion={
          consolidado
            ? 'Feed consolidado: eventos + comandos de voz + capturas de entorno'
            : 'Solo eventos explícitos del sistema'
        }
      >
        <TablaPaginada<Actividad>
          tituloAccesible="Historial de actividades"
          columnas={columnas}
          datos={listado.datos}
          meta={listado.meta}
          cargando={listado.cargando}
          rowKey={(a) => a.id}
          onCambioPagina={listado.setPagina}
          mensajeVacio={
            listado.buscar || tipo || fechaDesde || fechaHasta
              ? 'No hay actividades para los filtros aplicados.'
              : 'Aún no tienes actividades registradas.'
          }
        />
      </Card>
    </div>
  );
}