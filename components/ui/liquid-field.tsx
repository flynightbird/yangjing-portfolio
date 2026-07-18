'use client';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './liquid-field.module.css';

interface LiquidFieldProps {
  readonly variant: 'aidx' | 'footer';
  readonly interactive?: boolean;
  readonly className?: string;
}

const palette = {
  aidx: ['#d9e3ff', '#a8b9ef', '#8c8dde'],
  footer: ['#5c4777', '#8169a7', '#b5a3e6'],
} as const;

const fieldLayout = [
  { x: 0.02, y: 0.1, radiusX: 0.54, radiusY: 0.62, phase: 0.2 },
  { x: 0.82, y: 0.16, radiusX: 0.48, radiusY: 0.58, phase: 2.1 },
  { x: 0.26, y: 0.88, radiusX: 0.58, radiusY: 0.54, phase: 4.2 },
  { x: 0.96, y: 0.82, radiusX: 0.5, radiusY: 0.64, phase: 5.4 },
] as const;

export function LiquidField({
  variant,
  interactive = false,
  className,
}: LiquidFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const reducedMotion = useReducedMotionPreference();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: '120px' },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let start = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const elapsed = reducedMotion ? 0 : (now - start) / 1000;
      const pointerX = interactive ? pointerRef.current.x - 0.5 : 0;
      const pointerY = interactive ? pointerRef.current.y - 0.5 : 0;

      context.clearRect(0, 0, width, height);
      context.fillStyle = variant === 'footer' ? '#171219' : '#919fd3';
      context.fillRect(0, 0, width, height);

      fieldLayout.forEach((field, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const speed = variant === 'footer' ? 0.055 : 0.07;
        const phase = field.phase + elapsed * speed * direction;
        const driftX = Math.sin(phase) * width * 0.09;
        const driftY = Math.cos(phase * 0.82) * height * 0.075;
        const centerX = field.x * width + driftX + pointerX * width * 0.025;
        const centerY = field.y * height + driftY + pointerY * height * 0.025;
        const radiusX = Math.max(width, height) * field.radiusX;
        const radiusY = Math.max(width, height) * field.radiusY;
        const color = palette[variant][index % palette[variant].length];
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);

        gradient.addColorStop(0, `${color}e6`);
        gradient.addColorStop(0.42, `${color}9c`);
        gradient.addColorStop(0.76, `${color}35`);
        gradient.addColorStop(1, `${color}00`);

        context.save();
        context.translate(centerX, centerY);
        context.rotate(Math.sin(phase * 0.65) * 0.18);
        context.scale(radiusX, radiusY);
        context.beginPath();
        context.arc(0, 0, 1, 0, Math.PI * 2);
        context.globalAlpha = variant === 'footer' ? 0.72 : 0.88;
        context.fillStyle = gradient;
        context.fill();
        context.restore();
      });
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      draw(now);
      if (!reducedMotion && visible) frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),
      };
    };

    resize();
    draw(start);
    if (!reducedMotion && visible) frame = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    if (interactive) canvas.parentElement?.addEventListener('pointermove', move);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      if (interactive) canvas.parentElement?.removeEventListener('pointermove', move);
      start = 0;
    };
  }, [interactive, reducedMotion, variant, visible]);

  return (
    <canvas
      ref={canvasRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-liquid-field={variant}
      data-motion={reducedMotion ? 'reduced' : visible ? 'running' : 'paused'}
      aria-hidden="true"
    />
  );
}
