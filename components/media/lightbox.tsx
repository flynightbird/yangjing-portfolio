'use client';

import { X } from 'lucide-react';
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
}

const subscribeToHydration = () => () => {};

export function Lightbox({
  src,
  width,
  height,
  alt,
  triggerLabel,
  dialogLabel,
}: LightboxProps) {
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
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
      </button>
      {open
        ? createPortal(
            <div
              className={styles.backdrop}
              role="dialog"
              aria-modal="true"
              aria-label={dialogLabel}
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
                  aria-label={dialogLabel.startsWith('查看') ? '关闭图片' : 'Close image'}
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
