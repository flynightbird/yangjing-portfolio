'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';

import styles from './home.module.css';

interface BuildLabMediaProps {
  readonly href: string;
}

export function BuildLabMedia({ href }: BuildLabMediaProps) {
  const reduceMotion = useReducedMotion();
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isVisibleRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [iframeSource, setIframeSource] = useState<Window | null>(null);
  const [readySource, setReadySource] = useState<Window | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 150, damping: 22, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 150, damping: 22, mass: 0.7 });

  const postPlaybackState = useCallback((paused: boolean) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'stt-stage-playback', paused },
      window.location.origin,
    );
  }, []);

  const setIframeNode = useCallback((iframe: HTMLIFrameElement | null) => {
    iframeRef.current = iframe;
    const source = iframe?.contentWindow ?? null;
    setIframeSource((currentSource) =>
      currentSource === source ? currentSource : source,
    );
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const media = mediaRef.current;
    if (!media) return;

    if (typeof IntersectionObserver === 'undefined') {
      let isMounted = true;
      queueMicrotask(() => {
        if (!isMounted) return;

        isVisibleRef.current = true;
        setShouldLoad(true);
      });
      return () => {
        isMounted = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(media);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!shouldLoad || reduceMotion || typeof IntersectionObserver === 'undefined') return;

    const media = mediaRef.current;
    if (!media || !iframeRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find(({ target }) => target === media);
        if (!entry) return;

        isVisibleRef.current = entry.isIntersecting;
        postPlaybackState(!entry.isIntersecting);
      },
      { threshold: 0.05 },
    );

    observer.observe(media);
    return () => observer.disconnect();
  }, [postPlaybackState, reduceMotion, shouldLoad]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const currentIframeSource = iframeRef.current?.contentWindow;
      if (
        !currentIframeSource ||
        !event.data ||
        typeof event.data !== 'object' ||
        event.data.type !== 'stt-stage-ready' ||
        event.origin !== window.location.origin ||
        event.source !== currentIframeSource
      ) {
        return;
      }

      setReadySource(currentIframeSource);
      postPlaybackState(!isVisibleRef.current);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [postPlaybackState]);

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || event.pointerType === 'touch') return;

    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 20);
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * 12);
  };

  const resetPosition = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const isReady =
    !reduceMotion &&
    shouldLoad &&
    iframeSource !== null &&
    readySource === iframeSource;

  return (
    <a
      ref={mediaRef}
      className={styles.buildMedia}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the interactive STT Demo in a new tab"
      data-stt-media-stage
      data-stt-ready={isReady ? 'true' : 'false'}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onBlur={resetPosition}
    >
      <motion.div
        className={styles.buildBrowserWindow}
        data-stt-browser-window
        style={{ x, y }}
      >
        <span className={styles.buildBrowserChrome} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {shouldLoad && !reduceMotion ? (
          <iframe
            ref={setIframeNode}
            src="/demos/stt-demo/index.html?embed=stage"
            title="Animated STT Demo conversation stage"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : null}
        {/* This image is rendered from the pinned local STT Demo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/stt-demo/stt-product-stage@2x.png"
          width={1266}
          height={1120}
          alt="STT Demo product stage showing a speaker, bilingual transcript, translation, and participants"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      </motion.div>
    </a>
  );
}
