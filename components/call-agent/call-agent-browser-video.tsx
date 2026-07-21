'use client';

import { useEffect, useId, useRef, useState } from 'react';

import styles from './call-agent-browser-video.module.css';

export interface CallAgentBrowserVideoProps {
  readonly src: string;
  readonly poster: string;
  readonly playbackRate: number;
  readonly title: string;
  readonly description: string;
  readonly active?: boolean;
  readonly priority?: boolean;
  readonly loop?: boolean;
  readonly onEnded?: () => void;
}

export function CallAgentBrowserImage({
  src,
  title,
  description,
}: {
  readonly src: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <figure className={styles.root} data-call-agent-browser data-media-kind="image">
      <div className={styles.browser}>
        <div className={styles.chrome} aria-hidden="true">
          <span data-browser-dot />
          <span data-browser-dot />
          <span data-browser-dot />
          <b>{title}</b>
        </div>
        <div className={styles.viewport}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} loading="lazy" />
        </div>
      </div>
      <figcaption>{description}</figcaption>
    </figure>
  );
}

export function CallAgentBrowserVideo({
  src,
  poster,
  playbackRate,
  title,
  description,
  active = true,
  priority = false,
  loop = true,
  onEnded,
}: CallAgentBrowserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const descriptionId = useId();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    video.defaultPlaybackRate = playbackRate;
    video.playbackRate = playbackRate;
  }, [playbackRate, reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    if (!active) {
      video.pause();
      return;
    }

    const play = () => {
      if (video.ended) video.currentTime = 0;
      void Promise.resolve(video.play()).catch(() => undefined);
    };
    if (typeof IntersectionObserver === 'undefined') {
      play();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.target === video && entry.isIntersecting)) play();
      else video.pause();
    }, { threshold: 0.08 });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [active, reducedMotion]);

  return (
    <figure className={styles.root} data-call-agent-browser data-media-kind="video">
      <div className={styles.browser}>
        <div className={styles.chrome} aria-hidden="true">
          <span data-browser-dot />
          <span data-browser-dot />
          <span data-browser-dot />
          <b>{title}</b>
        </div>
        <div className={styles.viewport} data-call-agent-video-viewport>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.poster} src={poster} alt={title} loading={priority ? 'eager' : 'lazy'} />
          {!reducedMotion ? (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              muted
              loop={loop}
              playsInline
              preload={priority ? 'auto' : 'metadata'}
              aria-label={title}
              aria-describedby={descriptionId}
              onEnded={onEnded}
              onLoadedMetadata={(event) => {
                event.currentTarget.defaultPlaybackRate = playbackRate;
                event.currentTarget.playbackRate = playbackRate;
              }}
            />
          ) : null}
        </div>
      </div>
      <figcaption id={descriptionId}>{description}</figcaption>
    </figure>
  );
}
