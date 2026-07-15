'use client';

import type { CSSProperties, ReactNode } from 'react';

import styles from '@/components/home/home.module.css';

interface HeroMotionProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

export function HeroMotion({
  children,
  className,
  delay = 0,
}: HeroMotionProps) {
  return (
    <div
      className={[styles.heroReveal, className].filter(Boolean).join(' ')}
      style={{ '--hero-reveal-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
