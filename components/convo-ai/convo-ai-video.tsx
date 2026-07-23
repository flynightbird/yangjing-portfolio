'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { type Ref, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { Locale } from '@/content/types';
import { getConvoAiMedia, type ConvoAiMediaId } from './convo-ai-media-catalog';
import styles from './convo-ai-media.module.css';

interface ConvoAiViewportVideoProps {
  readonly id: ConvoAiMediaId;
  readonly locale: Locale;
  readonly describedBy?: string;
  readonly videoRef?: Ref<HTMLVideoElement>;
  readonly onError?: () => void;
  readonly onLoadedData?: () => void;
}

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => undefined;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener?.('change', onChange);
  return () => media.removeEventListener?.('change', onChange);
}

function reducedMotionSnapshot() {
  return typeof window === 'undefined'
    || typeof window.matchMedia !== 'function'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function assignRef(ref: Ref<HTMLVideoElement> | undefined, value: HTMLVideoElement | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function muteOtherVideos(current: HTMLVideoElement) {
  document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')
    .forEach((video) => {
      if (video === current) return;
      video.muted = true;
      video.dispatchEvent(new Event('convo-ai-muted'));
    });
}

export function ConvoAiViewportVideo({ id, locale, describedBy, videoRef, onError, onLoadedData }: ConvoAiViewportVideoProps) {
  const media = getConvoAiMedia(id);
  const localRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, reducedMotionSnapshot, () => true);
  const setRef = useCallback((video: HTMLVideoElement | null) => {
    localRef.current = video;
    assignRef(videoRef, video);
  }, [videoRef]);

  useEffect(() => {
    const video = localRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      void video.play().catch(() => undefined);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.25) void video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: [0, 0.25] });
    observer.observe(video);
    return () => observer.disconnect();
  }, [id, reducedMotion]);

  useEffect(() => {
    const video = localRef.current;
    if (!video) return;
    const reflectMutedState = () => setMuted(true);
    video.addEventListener('convo-ai-muted', reflectMutedState);
    return () => video.removeEventListener('convo-ai-muted', reflectMutedState);
  }, [id]);

  const toggleSound = () => {
    const video = localRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    if (!nextMuted) muteOtherVideos(video);
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) void video.play().catch(() => undefined);
  };

  return <div className={styles.videoShell}>
    <video
      ref={setRef}
      data-convo-ai-video="true"
      src={media.src}
      poster={media.poster}
      playsInline
      preload="metadata"
      loop
      muted={muted}
      aria-label={media.copy[locale].title}
      aria-describedby={describedBy}
      onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }}
      onError={onError}
      onLoadedData={onLoadedData}
    />
    {media.audio ? <button
      className={styles.soundToggle}
      type="button"
      aria-label={locale === 'zh' ? (muted ? '开启声音' : '关闭声音') : (muted ? 'Turn sound on' : 'Turn sound off')}
      aria-pressed={!muted}
      onClick={toggleSound}
    >{muted ? <VolumeX aria-hidden="true" size={18} /> : <Volume2 aria-hidden="true" size={18} />}</button> : null}
  </div>;
}
