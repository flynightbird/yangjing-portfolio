'use client';

import Image from 'next/image';
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
} from 'react';

import styles from '@/components/home/home.module.css';

const DEFAULT_SPLIT = 48;
const MIN_SPLIT = 8;
const MAX_SPLIT = 92;
const PORTRAIT_SRC = '/images/profile/yang-jing-hero-placeholder.png';

interface HeroMotionProps {
  readonly name: string;
  readonly designerRole: readonly [string, string];
  readonly builderRole: readonly [string, string];
  readonly designerRoleLabel: string;
  readonly builderRoleLabel: string;
  readonly designerSummary: string;
  readonly builderSummary: string;
  readonly portraitLabel: string;
}

interface HeroMotionDebugState {
  scanRuns: number;
  split: number;
}

declare global {
  interface Window {
    __heroMotion?: HeroMotionDebugState;
  }
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const magneticTarget = (value: number) => {
  if (Math.abs(value - 50) <= 3.5) return 50;
  if (value <= 11) return MIN_SPLIT;
  if (value >= 89) return MAX_SPLIT;
  return value;
};

export function HeroMotion({
  name,
  designerRole,
  builderRole,
  designerRoleLabel,
  builderRoleLabel,
  designerSummary,
  builderSummary,
  portraitLabel,
}: HeroMotionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dividerRef = useRef<HTMLButtonElement>(null);
  const splitRef = useRef(DEFAULT_SPLIT);
  const draggingRef = useRef(false);
  const settleFrameRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanRef = useRef<(() => void) | null>(null);
  const reducedMotionRef = useRef(false);
  const wasBuilderRef = useRef(false);
  const pointerRef = useRef({ x: 0.76, y: 0.48 });

  const applySplit = (value: number) => {
    const next = clamp(value, MIN_SPLIT, MAX_SPLIT);
    splitRef.current = next;
    heroRef.current?.style.setProperty('--hero-split', `${next}%`);
    dividerRef.current?.setAttribute('aria-valuenow', String(Math.round(next)));
    if (window.__heroMotion) window.__heroMotion.split = next;
  };

  const stopSettle = () => {
    if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current);
    settleFrameRef.current = 0;
  };

  const clearReset = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
  };

  const settleTo = (target: number) => {
    stopSettle();
    if (reducedMotionRef.current) {
      applySplit(target);
      return;
    }

    let velocity = 0;
    const tick = () => {
      velocity = (velocity + (target - splitRef.current) * 0.075) * 0.76;
      applySplit(splitRef.current + velocity);
      if (Math.abs(target - splitRef.current) < 0.025 && Math.abs(velocity) < 0.025) {
        applySplit(target);
        settleFrameRef.current = 0;
        return;
      }
      settleFrameRef.current = requestAnimationFrame(tick);
    };
    settleFrameRef.current = requestAnimationFrame(tick);
  };

  const splitFromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    applySplit(((event.clientX - rect.left) / rect.width) * 100);
  };

  const handleDividerDown = (event: PointerEvent<HTMLButtonElement>) => {
    draggingRef.current = true;
    clearReset();
    stopSettle();
    event.currentTarget.setPointerCapture(event.pointerId);
    splitFromPointer(event);
    event.preventDefault();
  };

  const handleDividerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (draggingRef.current) splitFromPointer(event);
  };

  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const target = magneticTarget(splitRef.current);
    if (target !== splitRef.current) settleTo(target);
    scanRef.current?.();
  };

  const handleDividerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    clearReset();
    stopSettle();
    applySplit(splitRef.current + (event.key === 'ArrowLeft' ? -4 : 4));
    scanRef.current?.();
    event.preventDefault();
  };

  const handleHeroMove = (event: PointerEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    pointerRef.current = { x, y };

    const builderActive = x * 100 >= splitRef.current;
    if (builderActive && !wasBuilderRef.current && !draggingRef.current) {
      scanRef.current?.();
    }
    wasBuilderRef.current = builderActive;
  };

  const handleHeroLeave = () => {
    wasBuilderRef.current = false;
    if (reducedMotionRef.current || draggingRef.current) return;
    clearReset();
    resetTimerRef.current = setTimeout(() => settleTo(DEFAULT_SPLIT), 5000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    window.__heroMotion = { scanRuns: 0, split: DEFAULT_SPLIT };
    if (navigator.userAgent.includes('jsdom')) {
      return () => delete window.__heroMotion;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = media.matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let running = true;
    let scanStart = media.matches ? Number.NEGATIVE_INFINITY : performance.now() - 1600;
    let scanRuns = 0;
    let smoothX = pointerRef.current.x;
    let smoothY = pointerRef.current.y;

    const codeFragments = [
      { text: 'build()', u: 0.12, v: 0.16, size: 46, depth: 0.95, accent: false },
      { text: '{ interface }', u: 0.42, v: 0.67, size: 22, depth: 0.62, accent: true },
      { text: 'STATE / READY', u: 0.68, v: 0.2, size: 12, depth: 0.34, accent: true },
      { text: 'x:128  y:064', u: 0.17, v: 0.76, size: 12, depth: 0.28, accent: true },
      { text: 'prototype -> product', u: 0.47, v: 0.8, size: 17, depth: 0.72, accent: false },
      { text: '01', u: 0.82, v: 0.7, size: 78, depth: 0.88, accent: true },
      { text: '[ SYSTEM ]', u: 0.75, v: 0.9, size: 14, depth: 0.42, accent: false },
      { text: 'SYNC', u: 0.31, v: 0.52, size: 11, depth: 0.24, accent: true },
    ] as const;

    const triggerScan = () => {
      if (reducedMotionRef.current) return;
      scanRuns += 1;
      scanStart = performance.now();
      canvas.dataset.scanRuns = String(scanRuns);
      if (window.__heroMotion) window.__heroMotion.scanRuns = scanRuns;
    };
    scanRef.current = triggerScan;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (time: number) => {
      if (!running) return;
      const boundary = (width * splitRef.current) / 100;
      const available = Math.max(1, width - boundary);
      const rawProgress = media.matches ? 1 : clamp((time - scanStart) / 1900, 0, 1);
      const progress = rawProgress < 0.5
        ? 8 * rawProgress ** 4
        : 1 - ((-2 * rawProgress + 2) ** 4) / 2;

      if (!media.matches) {
        smoothX += (pointerRef.current.x - smoothX) * 0.045;
        smoothY += (pointerRef.current.y - smoothY) * 0.045;
      }

      context.clearRect(0, 0, width, height);
      context.save();
      context.beginPath();
      context.rect(boundary, 0, available, height);
      context.clip();

      context.strokeStyle = 'rgba(244, 244, 239, 0.065)';
      context.lineWidth = 1;
      for (let index = 1; index < 8; index += 1) {
        const x = boundary + (available * index) / 8;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let index = 1; index < 6; index += 1) {
        const y = (height * index) / 6;
        context.beginPath();
        context.moveTo(boundary, y);
        context.lineTo(width, y);
        context.stroke();
      }

      for (const fragment of codeFragments) {
        const phase = fragment.u * 0.72 + fragment.v * 0.28;
        const reveal = clamp((progress - phase + 0.2) / 0.2, 0.08, 1);
        const x = boundary + available * fragment.u + (smoothX - 0.76) * 34 * fragment.depth;
        const y = height * fragment.v + (smoothY - 0.48) * 18 * fragment.depth;
        context.font = `${fragment.size}px "DM Mono", monospace`;
        context.fillStyle = fragment.accent
          ? `rgba(75, 122, 255, ${0.09 + reveal * (0.22 + fragment.depth * 0.28)})`
          : `rgba(226, 230, 222, ${0.06 + reveal * (0.12 + fragment.depth * 0.2)})`;
        context.fillText(fragment.text, x, y);
      }

      if (!media.matches && rawProgress < 1) {
        const travel = (available + height * 0.42) * progress - height * 0.42;
        context.beginPath();
        context.moveTo(boundary + travel - 150, 0);
        context.lineTo(boundary + travel - 76, 0);
        context.lineTo(boundary + travel - 76 - height * 0.42, height);
        context.lineTo(boundary + travel - 150 - height * 0.42, height);
        context.closePath();
        context.fillStyle = 'rgba(75, 122, 255, 0.08)';
        context.fill();
        context.beginPath();
        context.moveTo(boundary + travel, 0);
        context.lineTo(boundary + travel - height * 0.42, height);
        context.strokeStyle = 'rgba(199, 255, 56, 0.74)';
        context.stroke();
      }

      context.restore();
      frame = requestAnimationFrame(render);
    };

    const stopRendering = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopRendering();
        return;
      }
      if (!running) {
        running = true;
        frame = requestAnimationFrame(render);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    canvas.dataset.scanRuns = '0';
    frame = requestAnimationFrame(render);
    const introTimer = media.matches ? null : setTimeout(triggerScan, 520);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', stopRendering);

    const handleMotionChange = () => {
      reducedMotionRef.current = media.matches;
      if (media.matches) {
        clearReset();
        stopSettle();
      }
    };
    media.addEventListener('change', handleMotionChange);

    return () => {
      if (introTimer) clearTimeout(introTimer);
      stopRendering();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', stopRendering);
      media.removeEventListener('change', handleMotionChange);
      clearReset();
      stopSettle();
      scanRef.current = null;
      delete window.__heroMotion;
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      style={{ '--hero-split': `${DEFAULT_SPLIT}%` } as CSSProperties}
      aria-labelledby="home-title"
      data-media="portrait"
      onPointerEnter={clearReset}
      onPointerMove={handleHeroMove}
      onPointerLeave={handleHeroLeave}
    >
      <header className={styles.heroTopbar}>
        <h1 id="home-title">{name}</h1>
        <span className={styles.heroDirection}>Material Blueprint</span>
        <span className={styles.heroIdentity}>Designer / Builder</span>
      </header>

      <div className={`${styles.heroLayer} ${styles.builderField}`} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.codeCanvas} data-hero-code-canvas />
        <Image
          className={styles.heroPortrait}
          src={PORTRAIT_SRC}
          width={500}
          height={750}
          alt=""
          priority
        />
      </div>

      <div className={`${styles.heroLayer} ${styles.designerField}`}>
        <div
          className={styles.materialBlueprint}
          data-designer-art="material-blueprint"
          aria-hidden="true"
        >
          <span className={`${styles.blueprintPiece} ${styles.blueprintPlaneOne}`} />
          <span className={`${styles.blueprintPiece} ${styles.blueprintPlaneTwo}`} />
          <svg className={styles.blueprintPath} viewBox="0 0 420 540">
            <line x1="74" y1="84" x2="286" y2="84" />
            <line x1="286" y1="84" x2="348" y2="392" />
            <path d="M74 84 C286 84 120 392 348 392" />
            <circle cx="74" cy="84" r="5" />
            <circle cx="286" cy="84" r="5" />
            <circle cx="120" cy="392" r="5" />
            <circle cx="348" cy="392" r="5" />
          </svg>
          <span className={`${styles.blueprintPiece} ${styles.blueprintNode}`} />
        </div>
        <Image
          className={styles.heroPortrait}
          src={PORTRAIT_SRC}
          width={500}
          height={750}
          alt={portraitLabel}
          priority
        />
      </div>

      <div className={`${styles.heroRole} ${styles.designerRole}`}>
        <span>Design judgment</span>
        <h2 aria-label={designerRoleLabel}>
          {designerRole[0]}{' '}
          <br />
          {designerRole[1]}
        </h2>
        <p>{designerSummary}</p>
      </div>

      <div className={`${styles.heroRole} ${styles.builderRole}`}>
        <span>Working output</span>
        <h2 aria-label={builderRoleLabel}>
          {builderRole[0]}{' '}
          <br />
          {builderRole[1]}
        </h2>
        <p>{builderSummary}</p>
      </div>

      <button
        ref={dividerRef}
        className={styles.heroDivider}
        type="button"
        role="separator"
        aria-label="Adjust identity reveal"
        aria-orientation="vertical"
        aria-valuemin={MIN_SPLIT}
        aria-valuemax={MAX_SPLIT}
        aria-valuenow={DEFAULT_SPLIT}
        onPointerDown={handleDividerDown}
        onPointerMove={handleDividerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={handleDividerKey}
      >
        <span aria-hidden="true">&#8596;</span>
      </button>

      <div className={styles.heroMeta} aria-hidden="true">
        <span>Material Blueprint / 03</span>
        <span>One practice. Two modes of making.</span>
      </div>
    </section>
  );
}
