'use client';

import { Maximize2, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import styles from './lightbox.module.css';

interface LightboxProps {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly triggerLabel: string;
  readonly dialogLabel: string;
  readonly closeLabel: string;
  readonly expandLabel?: string;
}

const subscribeToHydration = () => () => {};
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Lightbox({
  src,
  width,
  height,
  alt,
  triggerLabel,
  dialogLabel,
  closeLabel,
  expandLabel,
}: LightboxProps) {
  const resolvedExpandLabel = expandLabel
    ?? (/[㐀-鿿]/u.test(triggerLabel) ? '放大' : 'Expand');
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousOverflowRef = useRef('');

  useEffect(() => {
    if (!open) {
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const returnFocusTo = triggerRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter(
          (element) =>
            !element.hasAttribute('hidden') &&
            element.getAttribute('aria-hidden') !== 'true',
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        const active = document.activeElement;

        if (!first || !last) {
          event.preventDefault();
          dialog.focus();
        } else if (
          focusable.length === 1 ||
          !dialog.contains(active) ||
          (event.shiftKey && active === first) ||
          (!event.shiftKey && active === last)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflowRef.current;
      returnFocusTo?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label={triggerLabel}
        data-hydrated={hydrated ? 'true' : 'false'}
        onClick={() => setOpen(true)}
      >
        {/* Preserve the verified evidence file and its intrinsic dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={width} height={height} alt={alt} loading="lazy" />
        <span className={styles.expandCue} data-expand-cue aria-hidden="true">
          <Maximize2 size={15} strokeWidth={1.8} />
          <span>{resolvedExpandLabel}</span>
        </span>
      </button>
      {open
        ? createPortal(
            <div
              ref={dialogRef}
              className={styles.backdrop}
              role="dialog"
              aria-modal="true"
              aria-label={dialogLabel}
              tabIndex={-1}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setOpen(false);
                }
              }}
            >
              <div className={styles.surface}>
                <button
                  ref={closeRef}
                  className={styles.close}
                  type="button"
                  aria-label={closeLabel}
                  onClick={() => setOpen(false)}
                >
                  <X aria-hidden="true" size={24} />
                </button>
                {/* Preserve the verified evidence file and its intrinsic dimensions. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} width={width} height={height} alt={alt} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
