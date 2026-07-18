'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './pointer-field.module.css';

const trail = ['>>_', '_ _', '_ o', 'o o', '/', '/'] as const;
const symbols = ['>', '_', 'o', '/', '·', ':', '+', '[', ']', '{', '}', '0', '1', '*'] as const;
const suppressedSelector = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'label',
  'h1',
  'h2',
  'h3',
  'p',
  'li',
  'dl',
  'img',
  'iframe',
  '[data-pointer-suppress]',
  '[data-project-media-frame]',
  '[data-aidx-showcase]',
  '[data-stt-media-stage]',
].join(',');

function createSymbolLines(seed: number): string[] {
  const count = 3 + (seed % 3);
  return Array.from({ length: count }, (_, lineIndex) => {
    const length = 6 + ((seed + lineIndex * 3) % 7);
    return Array.from({ length }, (_, symbolIndex) => (
      symbols[(seed * 5 + lineIndex * 7 + symbolIndex * 3) % symbols.length]
    )).join(symbolIndexSpacing(seed, lineIndex));
  });
}

function symbolIndexSpacing(seed: number, lineIndex: number): string {
  return (seed + lineIndex) % 2 === 0 ? '  ' : ' ';
}

function isEligibleTarget(target: EventTarget | null): boolean {
  return !(target instanceof Element && target.closest(suppressedSelector));
}

export function PointerField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const seedRef = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [moving, setMoving] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    update();
    finePointer.addEventListener?.('change', update);
    reducedMotion.addEventListener?.('change', update);
    return () => {
      finePointer.removeEventListener?.('change', update);
      reducedMotion.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
    const clearDecoration = () => {
      clearTimers();
      setMoving(false);
      setLines([]);
    };
    const handleMove = (event: PointerEvent) => {
      if (!isEligibleTarget(event.target)) {
        clearDecoration();
        return;
      }

      rootRef.current?.style.setProperty('--pointer-x', `${event.clientX}px`);
      rootRef.current?.style.setProperty('--pointer-y', `${event.clientY}px`);
      clearTimers();
      setMoving(true);
      setLines([]);
      const stopTimer = window.setTimeout(() => setMoving(false), 170);
      const dwellTimer = window.setTimeout(() => {
        setMoving(false);
        seedRef.current += 1;
        setLines(createSymbolLines(seedRef.current));
        const clearTimer = window.setTimeout(() => setLines([]), 3200);
        timersRef.current = [clearTimer];
      }, 520);
      timersRef.current = [stopTimer, dwellTimer];
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('blur', clearDecoration);
    return () => {
      clearTimers();
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('blur', clearDecoration);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-pointer-field
      data-moving={moving ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div className={styles.trail} data-pointer-trail>
        {trail.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
      {lines.length > 0 ? (
        <div className={styles.cloud} data-pointer-symbol-cloud>
          {lines.map((line, index) => (
            <span
              key={`${line}-${index}`}
              style={{ '--line-index': index } as React.CSSProperties}
              data-pointer-symbol-line
            >
              {line}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
