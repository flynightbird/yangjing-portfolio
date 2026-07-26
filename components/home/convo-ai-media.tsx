'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { withBasePath } from '@/lib/i18n/locales';

import styles from './home.module.css';

const INERT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

export function ConvoAiMedia() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [shouldLoadPhoneVideo, setShouldLoadPhoneVideo] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const isDesktop = typeof window.matchMedia !== 'function'
      || window.matchMedia('(min-width: 768px)').matches;
    if (!isDesktop) return;

    if (typeof IntersectionObserver === 'undefined') {
      let isMounted = true;
      queueMicrotask(() => {
        if (isMounted) setShouldLoadPhoneVideo(true);
      });
      return () => {
        isMounted = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoadPhoneVideo(true);
        observer.disconnect();
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mediaRef} className={styles.convoHomeMedia} data-convo-home-media>
      <Image
        className={styles.convoCardBackground}
        data-convo-card-background
        src={withBasePath('/images/convo-ai/home-card-background.png')}
        alt=""
        aria-hidden="true"
        fill
        sizes="(max-width: 767px) calc(100vw - 2rem), 40vw"
        unoptimized
      />
      <div className={styles.convoWebBrowser} data-convo-web-browser>
        <div className={styles.convoBrowserBar}>
          <span className={styles.convoTrafficLights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.convoAddress}>convoai.agora.io / conversation</span>
          <span className={styles.convoBrowserAction}>•••</span>
        </div>
        <div className={styles.convoWebViewport} data-convo-web-viewport>
          <picture className={styles.convoWebPicture}>
            <source
              media="(min-width: 768px)"
              srcSet={withBasePath('/images/convo-ai/figma/web-ready.png')}
            />
            <img
              className={styles.convoWebImage}
              src={INERT_IMAGE}
              alt="ConvoAI web conversation ready state"
            />
          </picture>
        </div>
      </div>

      <div className={styles.convoPhone} data-convo-phone aria-hidden="true">
        <video
          key={shouldLoadPhoneVideo ? 'video' : 'poster'}
          className={styles.convoPhoneVideo}
          poster={shouldLoadPhoneVideo
            ? withBasePath('/images/convo-ai/posters/app-conversation-start.webp')
            : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          {shouldLoadPhoneVideo ? (
            <source
              media="(min-width: 768px) and (prefers-reduced-motion: no-preference)"
              src={withBasePath('/videos/convo-ai/app-conversation-start.mp4')}
              type="video/mp4"
            />
          ) : null}
        </video>
      </div>

      <picture className={styles.convoMobileLoop} data-convo-mobile-loop>
        <source
          media="(max-width: 767px) and (prefers-reduced-motion: no-preference)"
          srcSet={withBasePath('/images/convo-ai/home-mobile-loop.gif')}
        />
        <img
          className={styles.convoMobileImage}
          src={INERT_IMAGE}
          alt="ConvoAI conversation across web and mobile"
        />
      </picture>
      <picture className={styles.convoMobilePoster} data-convo-mobile-poster>
        <source
          media="(max-width: 767px) and (prefers-reduced-motion: reduce)"
          srcSet={withBasePath('/images/convo-ai/home-mobile-loop-poster.webp')}
        />
        <img
          className={styles.convoMobileImage}
          src={INERT_IMAGE}
          alt="ConvoAI conversation across web and mobile"
        />
      </picture>
    </div>
  );
}
