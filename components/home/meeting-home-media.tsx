'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { withBasePath } from '@/lib/i18n/locales';
import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './home.module.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const WEB_POSTER = '/images/meeting/meeting-hero-web-poster.webp';
const APP_POSTER = '/images/meeting/meeting-hero-app-poster.webp';

export function MeetingHomeMedia() {
  const rootRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotionPreference();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isReducedMotion) return;

    if (typeof IntersectionObserver === 'undefined') {
      let isMounted = true;
      queueMicrotask(() => {
        if (isMounted) setShouldLoadVideo(true);
      });
      return () => {
        isMounted = false;
      };
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isReducedMotion || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let cancelled = false;
    let cleanupMotion: (() => void) | undefined;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        const web = root.querySelector<HTMLElement>('[data-meeting-web-surface]');
        const phone = root.querySelector<HTMLElement>('[data-meeting-phone]');
        const mediaColumn = root.closest<HTMLElement>('[data-scroll-reveal-group="media"]');
        const states = mediaColumn?.querySelectorAll<HTMLElement>('[data-meeting-state]');
        if (!web || !phone || !states?.length) return;
        const isCompact = window.innerWidth < 768;
        gsap.set(states, {
          color: 'rgba(242, 244, 240, 0.48)',
          opacity: 0.44,
        });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top bottom-=10%',
            end: 'bottom top+=40%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(web, { autoAlpha: 0.58, scale: 0.88 }, { autoAlpha: 1, scale: 1, duration: 0.42 })
          .fromTo(
            phone,
            {
              autoAlpha: 0,
              x: isCompact ? 28 : 60,
              y: isCompact ? 32 : 48,
              rotation: isCompact ? 5 : 8,
            },
            { autoAlpha: 1, x: 0, y: 0, rotation: 2, duration: 0.34 },
            0.18,
          )
          .to(web, { scale: 0.965, y: -8, duration: 0.24 }, 0.58)
          .to(
            states,
            { color: 'var(--meeting-accent)', opacity: 1, stagger: 0.08, duration: 0.16 },
            0.55,
          );

        cleanupMotion = () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set([web, phone, ...states], { clearProps: 'all' });
        };
      },
    );

    return () => {
      cancelled = true;
      cleanupMotion?.();
    };
  }, [isReducedMotion]);

  return (
    <div
      ref={rootRef}
      className={styles.meetingMedia}
      data-meeting-home-media
      data-meeting-motion="scrub"
      aria-hidden="true"
    >
      <div className={styles.meetingWebSurface} data-meeting-web-surface>
        <div className={styles.meetingBrowserBar}>
          <span className={styles.meetingBrowserLights}><i /><i /><i /></span>
          <span className={styles.meetingBrowserAddress}>meeting.agora.io / workspace</span>
          <span className={styles.meetingBrowserMeta}>Live</span>
        </div>
        <div className={styles.meetingWebViewport}>
          {isReducedMotion ? (
            <Image
              data-meeting-poster="web"
              src={withBasePath(WEB_POSTER)}
              alt=""
              fill
              sizes="(max-width: 767px) 112vw, 66vw"
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
