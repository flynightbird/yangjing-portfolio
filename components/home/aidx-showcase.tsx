'use client';

import { useEffect, useRef, useState } from 'react';

import { LiquidField } from '@/components/ui/liquid-field';
import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './aidx-showcase.module.css';

interface AidxShowcaseProps {
  readonly href: string;
  readonly caption: string;
}

export function AidxShowcase({ href, caption }: AidxShowcaseProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { threshold: 0.15 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === 'aidx-showcase-ready'
      ) {
        setReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: 'aidx-showcase-playback', paused: engaged || !visible },
      window.location.origin,
    );
  }, [engaged, ready, visible]);

  return (
    <a
      ref={rootRef}
      className={styles.root}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-aidx-showcase
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      <LiquidField variant="aidx" className={styles.liquid} />
      <span className={styles.veil} aria-hidden="true" />
      <div className={styles.browser} data-aidx-browser data-browser-theme="light">
        <div className={styles.chrome} aria-hidden="true">
          <i />
          <i />
          <i />
          <span>aidxtech.com</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.fallback}
          src="/images/aidx/home-2026-07.png"
          width={1440}
          height={900}
          alt="AIDX public website homepage with Tested AI, Trusted AI positioning"
        />
        {!reducedMotion ? (
          <iframe
            ref={frameRef}
            className={styles.frame}
            src="/demos/aidx-showcase/index.html"
            title="AIDX homepage scrolling showcase"
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
          />
        ) : null}
        <span className={styles.caption}>{caption}</span>
      </div>
    </a>
  );
}
