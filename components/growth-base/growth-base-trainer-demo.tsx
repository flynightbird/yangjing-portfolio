'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './growth-base.module.css';

const beforeCopy = {
  zh: { alt: '预约私教原方案', caption: '预约私教 · 原方案', title: '预约私教高保真自动演示' },
  en: { alt: 'Original Personal Trainer direction', caption: 'Personal Trainer · Before', title: 'Automatic high-fidelity Personal Trainer demo' },
} as const;

const prototypeBaseUrl = process.env.NEXT_PUBLIC_GROWTH_BASE_PROTOTYPE_URL
  ?? 'https://flynightbird.github.io/meditation-prototype/';

function createDemoControl(action: 'play' | 'pause') {
  return {
    source: 'growth-base-portfolio',
    type: 'growth-base:demo-control',
    action,
  };
}

export function GrowthBaseTrainerDemo({ locale }: { readonly locale: Locale }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copy = beforeCopy[locale];
  const prototypeLanguage = locale === 'zh' ? 'zh-CN' : 'en';

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (typeof IntersectionObserver === 'undefined') {
      iframeRef.current?.contentWindow?.postMessage(createDemoControl('play'), '*');
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      iframeRef.current?.contentWindow?.postMessage(
        createDemoControl(entry.isIntersecting ? 'play' : 'pause'),
        '*',
      );
    }, { threshold: 0.35 });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.trainerComparison} data-trainer-auto-demo>
      <figure className={styles.trainerBefore}>
        <span className={styles.phoneLabel}>BEFORE / ORIGINAL UI</span>
        <Image alt={copy.alt} height={2556} src={withBasePath('/images/growth-base/before-trainer.jpg')} width={1179} unoptimized />
        <figcaption>{copy.caption}</figcaption>
      </figure>

      <div className={styles.trainerAfter} ref={stageRef}>
        <span className={styles.phoneLabel}>AFTER / AUTO DEMO</span>
        <div className={styles.trainerFrame} data-prototype-viewport data-canvas-size="390x844">
          <iframe
            ref={iframeRef}
            className={styles.trainerPrototype}
            src={`${prototypeBaseUrl}?embed=1&demo=trainer&lang=${prototypeLanguage}`}
            title={copy.title}
            width="390"
            height="844"
            loading="lazy"
            allow="autoplay"
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}
