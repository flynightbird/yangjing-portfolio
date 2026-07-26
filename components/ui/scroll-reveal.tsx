'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './scroll-reveal.module.css';

interface ScrollRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const reducedMotion = useReducedMotionPreference();
  const [revealed, setRevealed] = useState(false);
  const isRevealed = reducedMotion || revealed;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || revealedRef.current) return;

    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => {
        revealedRef.current = true;
        setRevealed(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        revealedRef.current = true;
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
      data-scroll-reveal
      data-scroll-reveal-state={isRevealed ? 'revealed' : 'pending'}
    >
      {children}
    </div>
  );
}
