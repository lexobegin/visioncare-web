import { useId, type Ref, type TextareaHTMLAttributes } from 'react';

import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Área de texto (descripciones, observaciones) con el mismo
 * contrato accesible que Input (label + error + hint).
 * ══════════════════════════════════════════════════════
 */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  hint?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id: idExterno,
  rows = 3,
  ref,
  ...resto
}: TextareaProps) {
  const id = idExterno ?? useId();
  const idError = `${id}-error`;
  const idHint = `${id}-hint`;

  const descritaPor =
    [error ? idError : null, !error && hint ? idHint : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="w-full">
      <label htmlFor={id} className="label-field">
        {label}
      </label>

      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritaPor}
        className={cx('input-field resize-y', error && 'input-field-error', className)}
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