'use client';

import { Code, ExternalLink } from 'lucide-react';
import Image from 'next/image';

import { ActionLink } from '@/components/ui/action-link';
import type { Locale } from '@/content/types';

import styles from './build-lab.module.css';

interface DemoFrameProps {
  readonly locale: Locale;
}

const copy = {
  en: {
    eyebrow: 'Pinned interaction surface',
    title: 'Interactive STT static prototype',
    loading: 'Loading pinned local prototype...',
    fallback:
      'Pinned non-interactive session view. Open the prototype for the full desktop interaction.',
    open: 'Open prototype',
    source: 'View source',
    newTab: 'opens in a new tab',
  },
  zh: {
    eyebrow: '固定版本交互界面',
    title: 'STT 交互式静态原型',
    loading: '正在加载本地固定版本原型...',
    fallback: '固定版本的会中静态视图。打开原型可体验完整桌面交互。',
    open: '打开原型',
    source: '查看源代码',
    newTab: '在新标签页打开',
  },
} as const;

export function DemoFrame({ locale }: DemoFrameProps) {
  const text = copy[locale];

  return (
    <figure className={styles.demoFigure} data-demo-frame>
      <div className={styles.demoHeader}>
        <span>{text.eyebrow}</span>
        <code>e5e840a</code>
      </div>
      <div className={styles.demoViewport}>
        <p className={styles.loading} role="status">
          {text.loading}
        </p>
        <iframe
          className={styles.demoIframe}
          src="/demos/stt-demo/index.html"
          title={text.title}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className={styles.posterFallback} data-demo-fallback>
          {/* The poster is copied from the pinned repository's approved baseline. */}
          <Image
            src="/demos/stt-demo/poster.png"
            alt={text.title}
            width="1440"
            height="900"
            loading="eager"
            unoptimized
          />
          <p>{text.fallback}</p>
        </div>
      </div>
      <figcaption className={styles.demoCaption}>
        <div className={styles.demoActions}>
          <ActionLink
            href="/demos/stt-demo/"
            icon={ExternalLink}
            variant="primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text.open}
          </ActionLink>
          <ActionLink
            href="https://github.com/flynightbird/stt-demo/tree/e5e840a"
            icon={Code}
            variant="secondary"
            external
            externalLabel={text.newTab}
          >
            {text.source}
          </ActionLink>
        </div>
      </figcaption>
    </figure>
  );
}
