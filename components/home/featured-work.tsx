import { BuildLabPreview } from '@/components/home/build-lab-preview';
import { FeaturedProject } from '@/components/home/featured-project';
import { LiveWebsiteProject } from '@/components/home/live-website-project';
import { MeetingPreview } from '@/components/home/meeting-preview';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import { homepageProjects } from '@/content/home';
import type { Locale } from '@/content/types';

import styles from './home.module.css';

interface FeaturedWorkProps {
  readonly locale: Locale;
}

export function FeaturedWork({ locale }: FeaturedWorkProps) {
  const copy = locale === 'zh' ? zhDictionary.home.projects : enDictionary.home.projects;
  const localeRoot = `/${locale}/`;
  const [xuelang, callAgent, meeting, aidx, sttDemo] = homepageProjects;

  return (
    <section
      id="work"
      className={styles.featuredWork}
      aria-label={locale === 'zh' ? '精选作品' : 'Selected work'}
    >
      <FeaturedProject
        id="xuelang"
        copy={copy.xuelang}
        href={`${localeRoot}${xuelang.href}`}
        availability={xuelang.availability}
        order="01"
        variant="flagship"
        media={{
          src: '/images/xuelang/hero-panorama.webp',
          width: 3000,
          height: 1500,
          alt:
            locale === 'zh'
              ? '学浪产品体验全景，呈现发现、决策与学习的关键界面'
              : 'Xuelang product panorama showing key discovery, purchase, and learning interfaces',
        }}
      />
      <FeaturedProject
        id="call-agent"
        copy={copy.callAgent}
        href={`${localeRoot}${callAgent.href}`}
        availability={callAgent.availability}
        order="02"
        variant="evidence"
        media={{
          src: '/images/call-agent/ai-preview-live.png',
          width: 2934,
          height: 1466,
          alt: 'Call Agent configuration next to a live call preview with runtime feedback',
        }}
      />
      <MeetingPreview
        copy={copy.meeting}
        href={`${localeRoot}${meeting.href}`}
      />
      <LiveWebsiteProject copy={copy.aidx} href={aidx.href} />
      <BuildLabPreview
        copy={copy.sttDemo}
        href={`${localeRoot}${sttDemo.href}`}
      />
    </section>
  );
}
