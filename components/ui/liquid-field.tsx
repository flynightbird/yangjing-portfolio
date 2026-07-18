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
  aidx: ['#5f4b86', '#8c75bd', '#c8b9ff'],
  footer: ['#493568', '#7658a5', '#b5a3e6'],
} as const;

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
      const strength = variant === 'footer' ? 1 : 0.62;
      const pointerX = interactive ? pointerRef.current.x - 0.5 : 0;
      const pointerY = interactive ? pointerRef.current.y - 0.5 : 0;

      context.clearRect(0, 0, width, height);
      context.fillStyle = variant === 'footer' ? '#171219' : '#171419';
      context.fillRect(0, 0, width, height);

      palette[variant].forEach((color, index) => {
        const baseline = height * (0.35 + index * 0.2 + pointerY * 0.035);
        const amplitude = height * (0.12 + index * 0.025) * strength;
        const phase = elapsed * (0.16 + index * 0.035) + index * 1.8;
        context.beginPath();
        context.moveTo(0, height);
        context.lineTo(0, baseline);
        for (let x = 0; x <= width; x += Math.max(18, width / 50)) {
          const wave = Math.sin((x / width) * Math.PI * 1.6 + phase);
          const secondary = Math.sin((x / width) * Math.PI * 3.2 - phase * 0.55);
          const y = baseline + (wave * 0.72 + secondary * 0.28) * amplitude;
          context.lineTo(x, y + pointerX * height * 0.035);
        }
        context.lineTo(width, height);
        context.closePath();
        context.globalAlpha = 0.64 - index * 0.1;
        context.fillStyle = color;
        context.fill();
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
