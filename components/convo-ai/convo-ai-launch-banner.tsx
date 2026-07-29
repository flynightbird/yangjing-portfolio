import Image from 'next/image';

import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './convo-ai-layout.module.css';

const copy = {
  zh: {
    title: '声网 AI Studio 正式上线',
    subtitle: '自由搭配 ASR、LLM、TTS、数字人等，快速搭建 AI 智能体。',
  },
  en: {
    title: 'Agora AI Studio is officially live',
    subtitle: 'Mix and match ASR, LLM, TTS, digital humans, and more to rapidly build AI agents.',
  },
} as const;

export function ConvoAiLaunchBanner({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <section
      className={styles.launchBanner}
      role="region"
      aria-label={text.title}
      data-convo-launch-banner
    >
      <div className={styles.launchCopy}>
        <p className={styles.launchTitle}>{text.title}</p>
        <p className={styles.launchSubtitle}>{text.subtitle}</p>
      </div>
      <div
        className={styles.launchArtwork}
        data-convo-launch-artwork
        aria-hidden="true"
      >
        <Image
          className={styles.launchBase}
          src={withBasePath('/images/convo-ai/launch-banner/base.png')}
          alt=""
          width={861}
          height={300}
        />
        <Image
          className={styles.launchFloatOne}
          src={withBasePath('/images/convo-ai/launch-banner/float-robot.png')}
          alt=""
          width={148}
          height={142}
        />
        <Image
          className={styles.launchFloatTwo}
          src={withBasePath('/images/convo-ai/launch-banner/float-cloud.png')}
          alt=""
          width={107}
          height={77}
        />
      </div>
    </section>
  );
}
