import { useEffect, useState } from 'react';

import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Banner de mensajes (éxito, error, advertencia, info).
 *
 * - role="alert": anuncio inmediato en lectores de pantalla.
 * - Dismissible opcional con auto-cierre configurable.
 * - Icono por variante (decorativo, aria-hidden).
 * ══════════════════════════════════════════════════════
 */

type VarianteAlerta = 'info' | 'exito' | 'advertencia' | 'error';

const ESTILOS: Record<VarianteAlerta, { contenedor: string; icono: string }> = {
  info: { contenedor: 'bg-info-50 text-info-900 border-info-200', icono: 'ℹ️' },
  exito: { contenedor: 'bg-success-50 text-success-900 border-success-200', icono: '✅' },
  advertencia: { contenedor: 'bg-warning-50 text-warning-900 border-warning-200', icono: '⚠️' },
  error: { contenedor: 'bg-danger-50 text-danger-900 border-danger-200', icono: '⛔' },
};

interface AlertaProps {
  variante?: VarianteAlerta;
  children: React.ReactNode;
  /** Muestra botón ✕ para cerrar (controlado por el padre) */
  onCerrar?: () => void;
  /** Cierra automáticamente tras N ms (requiere onCerrar) */
  autoCerrarMs?: number;
  className?: string;
}

export function Alerta({
  variante = 'info',
  children,
  onCerrar,
  autoCerrarMs,
  className,
}: AlertaProps) {
  const { contenedor, icono } = ESTILOS[variante];

  // Auto-cierre (solo si es dismissible y se configuró)
  useEffect(() => {
    if (!onCerrar || !autoCerrarMs) return;
    const temporizador = setTimeout(onCerrar, autoCerrarMs);
    return () => clearTimeout(temporizador);
  }, [onCerrar, autoCerrarMs]);

  return (
    <div
      role="alert"
      className={cx(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in',
        contenedor,
        className,
      )}
    >
      <span aria-hidden="true" className="text-base leading-none mt-0.5">
        {icono}
      </span>

      <div className="flex-1">{children}</div>

      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar mensaje"
          className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Hook pequeño para mensajes que se auto-limpian:
 *
 *   const { alerta, mostrarAlerta, cerrarAlerta } = useAlerta();
 *   mostrarAlerta('exito', 'Usuario creado.');
 *   ...
 *   {alerta && <Alerta variante={alerta.variante} onCerrar={cerrarAlerta} autoCerrarMs={4000}>{alerta.mensaje}</Alerta>}
 */
export interface EstadoAlerta {
  variante: VarianteAlerta;
  mensaje: string;
}

export function useAlerta() {
  const [alerta, setAlerta] = useState<EstadoAlerta | null>(null);

  return {
    alerta,
    /** Muestra un mensaje (reemplaza al anterior) */
    mostrarAlerta: (variante: VarianteAlerta, mensaje: string) =>
      setAlerta({ variante, mensaje }),
    cerrarAlerta: () => setAlerta(null),
  };
}