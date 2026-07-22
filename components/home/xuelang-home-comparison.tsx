'use client';

import { MoveHorizontal } from 'lucide-react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';

import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './xuelang-home-comparison.module.css';

export const MIN_POSITION = 4;
export const MAX_POSITION = 96;
export const INITIAL_POSITION = 38;

const KEYBOARD_STEP = 3;
const AUTO_KEYFRAMES = [INITIAL_POSITION, 82, 18, 82, INITIAL_POSITION] as const;
const AUTO_LEG_DURATION = 650;

type AutoState = 'idle' | 'running' | 'complete' | 'cancelled' | 'disabled';

interface XuelangHomeComparisonProps {
  readonly locale: Locale;
}

const copy = {
  en: {
    before: 'Before',
    after: 'After',
    controlLabel: 'Compare the old and new Xuelang learning experience',
  },
  zh: {
    before: '旧版',
    after: '新版',
    controlLabel: '对比学浪旧版与新版学习体验',
  },
} as const;

function clampPosition(value: number) {
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, value));
}

export function XuelangHomeComparison({ locale }: XuelangHomeComparisonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const frameRef = useRef<number | null>(null);
  const autoStateRef = useRef<AutoState>('idle');
  const touchStartPositionRef = useRef(INITIAL_POSITION);
  const labels = copy[locale];

  function setPosition(value: number) {
    const position = clampPosition(value);
    rootRef.current?.style.setProperty('--wipe-position', `${position}%`);
    if (controlRef.current) {
      controlRef.current.value = String(position);
      controlRef.current.setAttribute('aria-valuenow', String(Math.round(position)));
    }
  }

  function setAutoState(state: AutoState, leg?: number) {
    autoStateRef.current = state;
    rootRef.current?.setAttribute('data-auto-state', state);
    if (leg !== undefined) rootRef.current?.setAttribute('data-auto-leg', String(leg));
  }

  function cancelAutoMotion() {
    observerRef.current?.disconnect();
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (autoStateRef.current !== 'complete' && autoStateRef.current !== 'disabled') {
      setAutoState('cancelled');
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    cancelAutoMotion();
    const currentPosition = Number(event.currentTarget.value);
    let nextPosition: number | undefined;

    if (event.key === 'ArrowLeft') nextPosition = currentPosition - KEYBOARD_STEP;
    if (event.key === 'ArrowRight') nextPosition = currentPosition + KEYBOARD_STEP;
    if (event.key === 'Home') nextPosition = MIN_POSITION;
    if (event.key === 'End') nextPosition = MAX_POSITION;
    if (nextPosition === undefined) return;

    event.preventDefault();
    setPosition(nextPosition);
  }

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    if (event.pointerType === 'touch') {
      touchStartPositionRef.current = Number(event.currentTarget.value);
    }
    cancelAutoMotion();
  }

  function handlePointerCancel(event: PointerEvent<HTMLInputElement>) {
    if (event.pointerType === 'touch') setPosition(touchStartPositionRef.current);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setAutoState('disabled', 0);
      return;
    }

    if (!('IntersectionObserver' in window)) return;

    function runLeg(leg: number) {
      const from = AUTO_KEYFRAMES[leg - 1];
      const to = AUTO_KEYFRAMES[leg];
      const startedAt = performance.now();
      setAutoState('running', leg);

      function animate(now: number) {
        if (autoStateRef.current !== 'running') return;
        const progress = Math.min(1, (now - startedAt) / AUTO_LEG_DURATION);
        const eased = progress * progress * (3 - 2 * progress);
        setPosition(from + (to - from) * eased);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else if (leg < AUTO_KEYFRAMES.length - 1) {
          runLeg(leg + 1);
        } else {
          frameRef.current = null;
          setPosition(INITIAL_POSITION);
          setAutoState('complete', AUTO_KEYFRAMES.length - 1);
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observerRef.current?.disconnect();
        runLeg(1);
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0.01 },
    );
    observerRef.current.observe(root);

    return () => {
      observerRef.current?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const style = { '--wipe-position': `${INITIAL_POSITION}%` } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={style}
      data-xuelang-home-comparison
      data-auto-state="idle"
      data-auto-leg="0"
    >
      {/* Both layers must share exact geometry for the wipe boundary. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.afterImage}
        src={withBasePath('/images/xuelang/learning-after-board.webp')}
        width={1662}
        height={1080}
        alt={labels.after}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.beforeImage}
        src={withBasePath('/images/xuelang/learning-before-board.webp')}
        width={1662}
        height={1080}
        alt={labels.before}
        draggable={false}
      />
      <span className={`${styles.label} ${styles.beforeLabel}`}>{labels.before}</span>
      <span className={`${styles.label} ${styles.afterLabel}`}>{labels.after}</span>
      <span className={styles.divider} aria-hidden="true" />
      <span className={styles.handle} aria-hidden="true">
        <MoveHorizontal size={19} strokeWidth={1.8} />
      </span>
      <input
        ref={controlRef}
        className={styles.control}
        type="range"
        min={MIN_POSITION}
        max={MAX_POSITION}
        step={1}
        defaultValue={INITIAL_POSITION}
        aria-label={labels.controlLabel}
        aria-valuenow={INITIAL_POSITION}
        onPointerDown={handlePointerDown}
        onPointerCancel={handlePointerCancel}
        onChange={(event) => {
          cancelAutoMotion();
          setPosition(Number(event.currentTarget.value));
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
