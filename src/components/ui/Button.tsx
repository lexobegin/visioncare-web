import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

import { Spinner } from './Spinner';
import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Botón — 4 variantes, 3 tamaños, estado de carga.
 *
 * - `cargando`: deshabilita automáticamente y muestra un
 *   spinner dentro del botón (aria-busy para lectores).
 * - React 19: `ref` llega como prop normal (sin forwardRef).
 * - type="button" por defecto: evita submits accidentales
 *   dentro de <form> (el submit explícito se declara).
 * ══════════════════════════════════════════════════════
 */

type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';
type TamanoBoton = 'sm' | 'md' | 'lg';

const VARIANTES: Record<VarianteBoton, string> = {
  primario:
    'bg-primary-600 text-white shadow-soft hover:bg-primary-700 ' +
    'disabled:bg-primary-300',
  secundario:
    'border border-slate-300 bg-white text-slate-700 shadow-soft ' +
    'hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400',
  peligro:
    'bg-danger-600 text-white shadow-soft hover:bg-danger-700 ' +
    'disabled:bg-danger-300',
  fantasma:
    'bg-transparent text-primary-700 hover:bg-primary-50 ' +
    'disabled:text-slate-400 disabled:hover:bg-transparent',
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  /** Muestra spinner y deshabilita el botón */
  cargando?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className,
  children,
  type = 'button',
  ref,
  ...resto
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg',
        'font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
        'disabled:cursor-not-allowed',
        VARIANTES[variante],
        TAMANOS[tamano],
        className,
      )}
      {...resto}
    >
      {cargando && <Spinner tamano="sm" etiqueta="Procesando" />}
      {children}
    </button>
  );
}