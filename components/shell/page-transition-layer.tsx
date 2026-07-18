'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './page-transition-layer.module.css';

export type PageTransitionTone = 'light' | 'dark';

export const PAGE_TRANSITION_DURATION_MS = 1200;

interface PageTransitionLayerProps {
  readonly children: ReactNode;
  readonly navigate?: (href: string) => void;
}

interface ActiveTransition {
  readonly href: string;
  readonly tone: PageTransitionTone;
}

function defaultNavigate(href: string) {
  window.location.assign(href);
}

function isTransitionTone(value: string | undefined): value is PageTransitionTone {
  return value === 'light' || value === 'dark';
}

function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function findTransitionAnchor(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return null;

  return target.closest<HTMLAnchorElement>('a[data-page-transition-tone]');
}

export function PageTransitionLayer({
  children,
  navigate = defaultNavigate,
}: PageTransitionLayerProps) {
  const [active, setActive] = useState<ActiveTransition | null>(null);
  const transitionLocked = useRef(false);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    let navigationTimer: ReturnType<typeof setTimeout> | undefined;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const anchor = findTransitionAnchor(event);
      if (!anchor || anchor.hasAttribute('download')) return;

      const target = anchor.getAttribute('target');
      if (target && target.toLowerCase() !== '_self') return;

      const tone = anchor.dataset.pageTransitionTone;
      const href = anchor.getAttribute('href');
      if (!isTransitionTone(tone) || !href || href.startsWith('#')) return;

      event.preventDefault();
      if (transitionLocked.current) return;

      transitionLocked.current = true;

      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        navigateRef.current(href);
        return;
      }

      setActive({ href, tone });
      navigationTimer = setTimeout(() => {
        navigateRef.current(href);
      }, PAGE_TRANSITION_DURATION_MS);
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (navigationTimer) clearTimeout(navigationTimer);
    };
  }, []);

  return (
    <>
      {children}
      <div
        aria-hidden="true"
        className={styles.overlay}
        data-state={active ? 'running' : 'idle'}
        data-tone={active?.tone}
        data-testid="page-transition-layer"
      />
    </>
  );
}
