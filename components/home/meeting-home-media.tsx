'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { withBasePath } from '@/lib/i18n/locales';

import styles from './home.module.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const WEB_POSTER = '/images/meeting/meeting-hero-web-poster.webp';
const APP_POSTER = '/images/meeting/meeting-hero-app-poster.webp';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function MeetingHomeMedia() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(prefersReducedMotion);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => {
      setIsReducedMotion(query.matches);
      if (query.matches) setShouldLoadVideo(false);
    };

    updatePreference();
    query.addEventListener?.('change', updatePreference);
    return () => query.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isReducedMotion) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoadVideo(true);
        observer.disconnect();
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [isReducedMotion]);

  return (
    <div
      ref={rootRef}
      className={styles.meetingMedia}
      data-meeting-home-media
      aria-hidden="true"
    >
      <div className={styles.meetingWebSurface} data-meeting-web-surface>
        {isReducedMotion ? (
          <Image
            data-meeting-poster="web"
            src={withBasePath(WEB_POSTER)}
            alt=""
            fill
            sizes="(max-width: 767px) 92vw, 66vw"
            unoptimized
          />
        ) : (
          <video
            className={styles.meetingWebVideo}
            poster={withBasePath(WEB_POSTER)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          >
            {shouldLoadVideo ? (
              <source
                src={withBasePath('/videos/meeting/meeting-hero-web.mp4')}
                type="video/mp4"
              />
            ) : null}
          </video>
        )}
      </div>

      <div className={styles.meetingPhone} data-meeting-phone>
        {isReducedMotion ? (
          <Image
            className={styles.meetingPhoneVideo}
            data-meeting-poster="app"
            src={withBasePath(APP_POSTER)}
            alt=""
            fill
            sizes="(max-width: 767px) 30vw, 11vw"
            unoptimized
          />
        ) : (
          <video
            className={styles.meetingPhoneVideo}
            poster={withBasePath(APP_POSTER)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          >
            {shouldLoadVideo ? (
              <source
                src={withBasePath('/videos/meeting/meeting-hero-app.mp4')}
                type="video/mp4"
              />
            ) : null}
          </video>
        )}
      </div>
    </div>
  );
}
