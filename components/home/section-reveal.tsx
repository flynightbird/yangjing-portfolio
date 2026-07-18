'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './section-reveal.module.css';

type SectionRevealTone = 'dark' | 'iris' | 'light';

interface SectionRevealProps {
  readonly children: ReactNode;
  readonly tone: SectionRevealTone;
  readonly className?: string;
}

export function SectionReveal({ children, tone, className }: SectionRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotion) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-section-reveal
      data-reveal-state={revealed ? 'revealed' : 'pending'}
      data-reveal-tone={tone}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}
