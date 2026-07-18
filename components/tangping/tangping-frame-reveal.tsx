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
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || revealed) return;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
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
  }, [reducedMotion, revealed]);

  return (
    <section
      ref={rootRef}
      className={className}
      data-tangping-frame
      data-frame-id={frameId}
      data-layout={layout}
      data-contiguous="true"
      data-reveal-state={revealed ? 'revealed' : 'pending'}
    >
      {children}
    </section>
  );
}
