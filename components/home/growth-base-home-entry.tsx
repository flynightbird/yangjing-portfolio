'use client';

import { Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';

import { ActionLink } from '@/components/ui/action-link';

import { ProjectMeta } from './project-meta';
import styles from './growth-base-home-entry.module.css';
import homeStyles from './home.module.css';

interface GrowthBaseHomeCopy {
  readonly company: string;
  readonly kind: string;
  readonly title: string;
  readonly proposition: string;
  readonly role: string;
  readonly mediaLabel?: string;
  readonly action: string;
}

export function GrowthBaseHomeEntry({
  copy,
  href,
}: {
  readonly copy: GrowthBaseHomeCopy;
  readonly href: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreferences = () => {
      setFinePointer(pointerQuery.matches);
      setReducedMotion(motionQuery.matches);
    };

    syncPreferences();
    pointerQuery.addEventListener?.('change', syncPreferences);
    motionQuery.addEventListener?.('change', syncPreferences);
    return () => {
      pointerQuery.removeEventListener?.('change', syncPreferences);
      motionQuery.removeEventListener?.('change', syncPreferences);
    };
  }, []);

  const play = () => {
    const promise = videoRef.current?.play();
    promise?.catch(() => setPlaying(false));
  };

  const pause = () => videoRef.current?.pause();

  const handlePointerEnter = () => {
    if (finePointer && !reducedMotion) play();
  };

  const handlePointerLeave = () => {
    if (finePointer) pause();
  };

  const toggleSound = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
  };

  return (
    <article
      className={styles.entry}
      data-project-id="growth-base"
      data-project-kind="deep-case"
    >
      <div className={styles.copy} data-scroll-reveal-group="text">
        <ProjectMeta companyId="personal" company={copy.company} kind={copy.kind} />
        <a
          className={styles.titleLink}
          href={href}
          data-page-transition-tone="dark"
        >
          <h2 className={homeStyles.coreProjectTitle} data-core-project-title>
            {copy.title}
          </h2>
        </a>
        <p className={styles.proposition}>{copy.proposition}</p>
        <p className={styles.role}>{copy.role}</p>
        <ActionLink
          className={`${homeStyles.flagshipCta} ${homeStyles.whiteCta} ${homeStyles.homeProjectCta} ${styles.cta}`}
          href={href}
          aria-label={`${copy.action} ${copy.title}`}
          data-page-transition-tone="dark"
          data-cta-treatment="white"
          data-home-project-cta
          variant="primary"
        >
          {copy.action}
        </ActionLink>
      </div>

      <div className={styles.mediaReveal} data-scroll-reveal-group="media">
        <div
          className={styles.media}
          data-growth-base-home-media
          data-media-radius="24"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <video
            ref={videoRef}
            className={styles.video}
            data-growth-base-home-video
            src="/videos/growth-base/home-loop.mp4"
            poster="/images/growth-base/home-video-poster.webp"
            muted={muted}
            playsInline
            loop
            preload="metadata"
            aria-describedby="growth-base-home-video-description"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          <a
            className={styles.mediaLink}
            href={href}
            aria-label={`Open ${copy.title} case study`}
            data-page-transition-tone="dark"
          />
          <p className={styles.srOnly} id="growth-base-home-video-description">
            {copy.mediaLabel ?? 'Generative character film and interactive prototype'}
          </p>
          {!playing ? (
            <button
              className={styles.playButton}
              type="button"
              aria-label="Play video"
              onClick={(event) => {
                event.stopPropagation();
                play();
              }}
            >
              <Play aria-hidden="true" size={20} fill="currentColor" />
            </button>
          ) : null}
          <button
            className={styles.soundButton}
            type="button"
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            onClick={toggleSound}
          >
            {muted ? (
              <VolumeX aria-hidden="true" size={19} />
            ) : (
              <Volume2 aria-hidden="true" size={19} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
