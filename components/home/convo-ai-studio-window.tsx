'use client';

import type { Locale } from '@/content/types';

import styles from './home.module.css';

interface ConvoAiStudioWindowProps {
  readonly locale: Locale;
}

export function ConvoAiStudioWindow({ locale }: ConvoAiStudioWindowProps) {
  const isChinese = locale === 'zh';
  const source = `/demos/convo-ai-studio/${locale}/index.html`;

  return (
    <div
      className={styles.studioWindow}
      data-convo-studio-window
      data-locale={locale}
      aria-hidden="true"
    >
      <div className={styles.studioBrowserBar}>
        <span className={styles.studioTrafficLights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.studioAddress}>
          <span className={styles.studioLock}>●</span>
          studio.agora.io / overview
        </span>
        <span className={styles.studioBrowserAction}>•••</span>
      </div>
      <div className={styles.studioViewport}>
        <iframe
          className={styles.studioFrame}
          src={source}
          title={isChinese ? '声网 Convo AI Studio 控制台预览' : 'Agora Convo AI Studio console preview'}
          tabIndex={-1}
          aria-hidden="true"
          loading="eager"
          sandbox="allow-scripts"
          data-convo-studio-frame
        />
      </div>
    </div>
  );
}
