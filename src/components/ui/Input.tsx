import { useId, type InputHTMLAttributes, ReactNode, Ref } from 'react';

import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Campo de texto con etiqueta, error y pista accesibles.
 *
 * Accesibilidad automática:
 *   - <label htmlFor> enlazado con id generado (useId).
 *   - error → aria-invalid="true" + aria-describedby al
 *     mensaje + role="alert" (el lector lo anuncia).
 *   - hint → también enlazado por aria-describedby.
 * ══════════════════════════════════════════════════════
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Texto de la etiqueta (arriba del campo) */
  label: string;
  /** Mensaje de error (activa el estilo y los aria) */
  error?: string | null;
  /** Texto de ayuda bajo el campo (solo si no hay error) */
  hint?: string;
  /** Oculta el texto (password) — solo semántico, el tipo lo da `type` */
  ref?: Ref<HTMLInputElement>;
  /** Elemento opcional a la derecha del label (ej: link "olvidé") */
  accionLabel?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  accionLabel,
  className,
  id: idExterno,
  ref,
  ...resto
}: InputProps) {
  // id estable entre renders (SSR-safe, sin colisiones)
  const idGenerado = useId();
  const id = idExterno ?? idGenerado;
  const idError = `${id}-error`;
  const idHint = `${id}-hint`;

  const descritaPor = [
    error ? idError : null,
    !error && hint ? idHint : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="label-field">
          {label}
        </label>
        {accionLabel}
      </div>

      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritaPor}
        className={cx('input-field', error && 'input-field-error', className)}
        {...resto}
      />

      {error ? (
        <p id={idError} role="alert" className="mt-1 text-xs text-danger-700">
          {error}
        </p>
      ) : hint ? (
        <p id={idHint} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}