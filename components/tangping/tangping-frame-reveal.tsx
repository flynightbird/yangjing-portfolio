'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

interface TangpingFrameRevealProps {
  readonly children: ReactNode;
  readonly className: string;
  readonly frameId: number;
  readonly layout: string;
}

export function TangpingFrameReveal({
  children,
  className,
  frameId,
  layout,
}: TangpingFrameRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const [revealed, setRevealed] = useState(false);
  const isRevealed = reducedMotion || revealed;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
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
    <section
      ref={rootRef}
      className={className}
      data-tangping-frame
      data-frame-id={frameId}
      data-layout={layout}
      data-contiguous="true"
      data-reveal-state={isRevealed ? 'revealed' : 'pending'}
    >
      {children}
    </section>
  );
}
