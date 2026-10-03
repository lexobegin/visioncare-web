import { useId, type Ref, type SelectHTMLAttributes } from 'react';

import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Selector desplegable con el mismo contrato accesible que
 * Input (label + error + hint con aria-describedby).
 * Las <option> se pasan como children.
 * ══════════════════════════════════════════════════════
 */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | null;
  hint?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  label,
  error,
  hint,
  className,
  id: idExterno,
  children,
  ref,
  ...resto
}: SelectProps) {
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

      <select
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritaPor}
        className={cx('input-field', error && 'input-field-error', className)}
        {...resto}
      >
        {children}
      </select>

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