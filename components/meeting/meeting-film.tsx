'use client';

import { RotateCcw } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './meeting-film.module.css';

export interface ProductFilmClipProps {
  readonly src: string;
  readonly poster: string;
  readonly frame?: 'plain' | 'browser';
  readonly replayLabel: string;
  readonly title: string;
  readonly description: string;
  readonly fallbackAlt: string;
}

export interface OrientationSource {
  readonly src: string;
  readonly poster: string;
}

export interface OrientationMatchedCutProps {
  readonly portrait: OrientationSource;
  readonly landscape: OrientationSource;
  readonly title: string;
  readonly fallbackAlt: string;
  readonly portraitLabel: string;
  readonly landscapeLabel: string;
  readonly showPortraitLabel: string;
  readonly showLandscapeLabel: string;
}

type Orientation = 'portrait' | 'landscape';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getReducedMotionPreference() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false;
}

function getServerReducedMotionPreference() {
  return true;
}

function useReducedMotionPreferenceRef(
  onPreferenceChange: (matches: boolean) => void,
) {
  const preferenceRef = useRef(getReducedMotionPreference());
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => undefined;

      const media = window.matchMedia(REDUCED_MOTION_QUERY);
      preferenceRef.current = media.matches;

      const handleChange = () => {
        preferenceRef.current = media.matches;
        onPreferenceChange(media.matches);
        onStoreChange();
      };

      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    },
    [onPreferenceChange],
  );
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getReducedMotionPreference,
    getServerReducedMotionPreference,
  );

  return { reducedMotion, reducedMotionRef: preferenceRef } as const;
}

interface OrientationStaticComparisonProps {
  readonly portrait: OrientationSource;
  readonly landscape: OrientationSource;
  readonly title: string;
  readonly fallbackAlt: string;
  readonly portraitLabel: string;
  readonly landscapeLabel: string;
  readonly exposeTestMarker?: boolean;
}

function OrientationStaticComparison({
  portrait,
  landscape,
  title,
  fallbackAlt,
  portraitLabel,
  landscapeLabel,
  exposeTestMarker = true,
}: OrientationStaticComparisonProps) {
  return (
    <div
      className={styles.orientationComparison}
      role="group"
      aria-label={title}
      data-testid={exposeTestMarker ? 'orientation-static-comparison' : undefined}
      data-orientation-static-comparison={exposeTestMarker ? true : undefined}
    >
      <figure className={styles.orientationPoster}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={portrait.poster} alt={`${fallbackAlt} - ${portraitLabel}`} />
        <figcaption>{portraitLabel}</figcaption>
      </figure>
      <figure className={styles.orientationPoster}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={landscape.poster} alt={`${fallbackAlt} - ${landscapeLabel}`} />
        <figcaption>{landscapeLabel}</figcaption>
      </figure>
    </div>
  );
}

export function OrientationMatchedCut({
  portrait,
  landscape,
  title,
  fallbackAlt,
  portraitLabel,
  landscapeLabel,
  showPortraitLabel,
  showLandscapeLabel,
}: OrientationMatchedCutProps) {
  const [activeOrientation, setActiveOrientation] = useState<Orientation>('portrait');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [targetOrientation, setTargetOrientation] = useState<Orientation>('portrait');
  const activeOrientationRef = useRef<Orientation>('portrait');
  const swapTimer = useRef<number | null>(null);
  const transitionGeneration = useRef(0);

  const invalidateTransition = useCallback(() => {
    transitionGeneration.current += 1;

    if (swapTimer.current !== null) {
      window.clearTimeout(swapTimer.current);
      swapTimer.current = null;
    }

    return transitionGeneration.current;
  }, []);

  const handleReducedMotionChange = useCallback(
    (matches: boolean) => {
      invalidateTransition();
      if (matches) setTargetOrientation(activeOrientationRef.current);
    },
    [invalidateTransition],
  );
  const { reducedMotion, reducedMotionRef } = useReducedMotionPreferenceRef(
    handleReducedMotionChange,
  );
  const activeSource = activeOrientation === 'portrait' ? portrait : landscape;
  const failed = failedSrc === activeSource.src;

  useEffect(
    () => () => {
      invalidateTransition();
    },
    [invalidateTransition],
  );

  const selectOrientation = (orientation: Orientation) => {
    if (orientation === targetOrientation) return;

    const generation = invalidateTransition();
    setTargetOrientation(orientation);

    if (orientation === activeOrientation) return;

    swapTimer.current = window.setTimeout(() => {
      if (
        generation !== transitionGeneration.current ||
        reducedMotionRef.current
      ) {
        return;
      }

      activeOrientationRef.current = orientation;
      setActiveOrientation(orientation);
      swapTimer.current = null;
    }, 300);
  };

  const handleMediaError = () => {
    invalidateTransition();
    setTargetOrientation(activeOrientationRef.current);
    setFailedSrc(activeSource.src);
  };

  if (reducedMotion || failed) {
    return (
      <figure className={styles.orientationCut}>
        <OrientationStaticComparison
          portrait={portrait}
          landscape={landscape}
          title={title}
          fallbackAlt={fallbackAlt}
          portraitLabel={portraitLabel}
          landscapeLabel={landscapeLabel}
        />
      </figure>
    );
  }

  return (
    <figure className={styles.orientationCut}>
      <div className={styles.orientationStage} data-orientation-stage>
        <div
          className={styles.deviceShell}
          data-device-shell
          data-orientation={targetOrientation}
        >
          <span
            className={styles.deviceHardwareCue}
            data-device-hardware-cue
            aria-hidden="true"
          />
          <div className={styles.orientationFrame} data-orientation-frame>
            <video
              key={`${activeOrientation}:${activeSource.src}`}
              className={styles.orientationVideo}
              src={activeSource.src}
              poster={activeSource.poster}
              autoPlay
              muted
              playsInline
              controls
              preload="metadata"
              aria-label={title}
              onError={handleMediaError}
            />
          </div>
        </div>
      </div>
      <div
        className={styles.orientationControls}
        role="group"
        aria-label={title}
        data-orientation-controls
      >
        <button
          className={styles.orientationButton}
          type="button"
          aria-label={showPortraitLabel}
          aria-pressed={targetOrientation === 'portrait'}
          onClick={() => selectOrientation('portrait')}
        >
          {portraitLabel}
        </button>
        <button
          className={styles.orientationButton}
          type="button"
          aria-label={showLandscapeLabel}
          aria-pressed={targetOrientation === 'landscape'}
          onClick={() => selectOrientation('landscape')}
        >
          {landscapeLabel}
        </button>
      </div>
      <div
        className={styles.orientationPrintComparison}
        data-orientation-print-comparison
      >
        <OrientationStaticComparison
          portrait={portrait}
          landscape={landscape}
          title={title}
          fallbackAlt={fallbackAlt}
          portraitLabel={portraitLabel}
          landscapeLabel={landscapeLabel}
          exposeTestMarker={false}
        />
      </div>
    </figure>
  );
}

export function ProductFilmClip({
  src,
  poster,
  frame = 'plain',
  replayLabel,
  title,
  description,
  fallbackAlt,
}: ProductFilmClipProps) {
  const descriptionId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const failed = failedSrc === src;
  const showPoster = reducedMotion || failed;

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    void video.play().catch(() => undefined);
  };

  return (
    <figure className={styles.clip} data-product-film-clip>
      <div className={styles.mediaFrame} data-film-frame={frame}>
        {frame === 'browser' && (
          <div className={styles.browserChrome} data-browser-chrome aria-hidden="true">
            <div className={styles.browserDots}>
              <span data-browser-dot />
              <span data-browser-dot />
              <span data-browser-dot />
            </div>
            <span className={styles.browserAddress}>meeting.agora.io</span>
          </div>
        )}
        <div className={styles.media}>
          {!reducedMotion && (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={title}
              aria-describedby={descriptionId}
              aria-hidden={failed || undefined}
              hidden={failed}
              onError={() => setFailedSrc(src)}
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.fallback}
            src={poster}
            alt={fallbackAlt}
            aria-hidden={showPoster ? undefined : true}
            hidden={!showPoster}
          />
        </div>
      </div>
      <figcaption
        id={descriptionId}
        className={styles.filmFooter}
        data-film-footer
      >
        <span className={styles.filmCopy}>
          <strong className={styles.filmTitle}>{title}</strong>
          <span className={styles.filmDescription}>{description}</span>
        </span>
        {!showPoster && (
          <button
            className={styles.replay}
            type="button"
            onClick={replay}
            aria-label={`${replayLabel} ${title}`}
            title={`${replayLabel} ${title}`}
          >
            <RotateCcw aria-hidden="true" size={18} />
          </button>
        )}
        {showPoster && (
          <span
            className={styles.replayPlaceholder}
            data-film-replay-placeholder
            aria-hidden="true"
          />
        )}
      </figcaption>
    </figure>
  );
}
