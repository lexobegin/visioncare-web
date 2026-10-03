import type { HTMLAttributes } from 'react';

import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Tarjeta de contenido con cabecera opcional (título,
 * descripción y acciones a la derecha — ej: botón "Nuevo").
 * ══════════════════════════════════════════════════════
 */

interface CardProps extends HTMLAttributes<HTMLElement> {
  titulo?: string;
  descripcion?: string;
  /** Elementos a la derecha del título (botones, links) */
  acciones?: React.ReactNode;
}

export function Card({
  titulo,
  descripcion,
  acciones,
  className,
  children,
  ...resto
}: CardProps) {
  const tieneCabecera = titulo || acciones;

  return (
    <section className={cx('card p-6', className)} {...resto}>
      {tieneCabecera && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="section-title">{titulo}</h2>}
            {descripcion && (
              <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>
            )}
          </div>
          {acciones && <div className="flex gap-2">{acciones}</div>}
        </header>
      )}
      {children}
    </section>
  );
}