'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './growth-base.module.css';

type GrowthBaseView = 'coach' | 'trainer';

const beforeStates = {
  coach: {
    src: '/images/growth-base/before-ai-coach.jpg',
    alt: { zh: 'AI 教练原方案', en: 'Original AI Coach direction' },
    caption: { zh: 'AI 教练 · 原方案', en: 'AI Coach · Before' },
  },
  trainer: {
    src: '/images/growth-base/before-trainer.jpg',
    alt: { zh: '预约私教原方案', en: 'Original Personal Trainer direction' },
    caption: { zh: '预约私教 · 原方案', en: 'Personal Trainer · Before' },
  },
} as const;

export function GrowthBaseComparison({ locale }: { readonly locale: Locale }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [view, setView] = useState<GrowthBaseView>('coach');
  const before = beforeStates[view];
  const prototypeLanguage = locale === 'zh' ? 'zh-CN' : 'en';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== 'https://flynightbird.github.io' ||
        event.source !== iframeRef.current?.contentWindow ||
        event.data?.source !== 'growth-base-prototype' ||
        event.data?.type !== 'growth-base:view' ||
        (event.data.view !== 'coach' && event.data.view !== 'trainer')
      ) {
        return;
      }

      setView(event.data.view);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className={styles.comparison} data-growth-base-comparison>
      <figure className={styles.beforePhone} data-comparison-role="before">
        <span className={styles.phoneLabel}>BEFORE / ORIGINAL UI</span>
        <span className={styles.paper} aria-hidden="true" />
        <Image
          data-growth-base-before
          src={withBasePath(before.src)}
          alt={before.alt[locale]}
          width={1179}
          height={2556}
          loading="eager"
          unoptimized
        />
        <figcaption aria-live="polite">{before.caption[locale]}</figcaption>
      </figure>

      <div className={styles.afterPhone} data-comparison-role="after">
        <span className={styles.phoneLabel}>AFTER / INTERACTIVE</span>
        <div
          className={styles.afterFrame}
          data-prototype-viewport
          data-canvas-size="390x844"
        >
          <iframe
            ref={iframeRef}
            className={styles.prototype}
            src={`https://flynightbird.github.io/meditation-prototype/?embed=1&lang=${prototypeLanguage}`}
            title={locale === 'zh' ? '成长基地可交互原型' : 'Interactive Growth Base prototype'}
            width="390"
            height="844"
            loading="eager"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
}
