import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { IconoCerrar } from './Iconos';
import { cx } from './cx';

/**
 * ══════════════════════════════════════════════════════
 * Modal accesible (portal a document.body):
 *
 *   - role="dialog" + aria-modal + aria-labelledby
 *   - ESC cierra | clic en overlay cierra
 *   - FOCUS TRAP: Tab cicla dentro del modal
 *   - Al abrir: enfoca el diálogo; al cerrar: devuelve el
 *     foco al elemento que lo abrió (navegación por teclado)
 *   - Bloquea el scroll del body mientras está abierto
 * ══════════════════════════════════════════════════════
 */

const TAMANOS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  /** Botones de acción en el pie (opcional) */
  footer?: ReactNode;
  tamano?: keyof typeof TAMANOS;
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  footer,
  tamano = 'md',
}: ModalProps) {
  const idTitulo = useId();
  const refDialogo = useRef<HTMLDivElement>(null);
  const refElementoPrevio = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!abierto) return;

    // Guarda el foco actual para restaurarlo al cerrar
    refElementoPrevio.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => refDialogo.current?.focus());

    function manejarTeclado(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCerrar();
        return;
      }

      // Focus trap: Tab / Shift+Tab ciclan dentro del diálogo
      if (e.key === 'Tab' && refDialogo.current) {
        const enfocables = refDialogo.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (enfocables.length === 0) return;

        const primero = enfocables[0];
        const ultimo = enfocables[enfocables.length - 1];

        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    }

    document.addEventListener('keydown', manejarTeclado);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', manejarTeclado);
      document.body.style.overflow = '';
      refElementoPrevio.current?.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Diálogo */}
      <div
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={cx(
          'relative w-full rounded-xl bg-white shadow-pop animate-slide-up',
          'focus:outline-none',
          TAMANOS[tamano],
        )}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2
            id={idTitulo}
            className="text-base font-semibold text-slate-900"
          >
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <IconoCerrar className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer && (
          <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}