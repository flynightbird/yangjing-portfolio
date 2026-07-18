import { CommunicationProjects } from '@/components/home/communication-projects';
import { FeaturedProject } from '@/components/home/featured-project';
import { FlagshipProjects } from '@/components/home/flagship-projects';
import { LiveWebsiteProject } from '@/components/home/live-website-project';
import { SectionReveal } from '@/components/home/section-reveal';
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
  const [xuelang, callAgent, convoAi, meeting, aidx, sttDemo] = homepageProjects;

  return (
    <section
      id="work"
      className={styles.featuredWork}
      aria-label={locale === 'zh' ? '精选作品' : 'Selected work'}
    >
      <SectionReveal tone="dark">
        <FlagshipProjects
          callAgent={{
            copy: copy.callAgent,
            href: `${localeRoot}${callAgent.href}`,
          }}
          convoAi={{
            copy: copy.convoAi,
            href: convoAi.href,
          }}
        />
      </SectionReveal>
      <SectionReveal tone="dark">
        <CommunicationProjects
          locale={locale}
          meeting={{ copy: copy.meeting, href: `${localeRoot}${meeting.href}` }}
          stt={{ copy: copy.sttDemo, href: sttDemo.href }}
        />
      </SectionReveal>
      <SectionReveal tone="iris">
        <section data-project-chapter="visual-brand">
          <LiveWebsiteProject copy={copy.aidx} href={aidx.href} />
        </section>
      </SectionReveal>
      <SectionReveal tone="light">
        <section data-project-chapter="product-foundation">
          <FeaturedProject
            id="xuelang"
            copy={copy.xuelang}
            href={`${localeRoot}${xuelang.href}`}
            availability={xuelang.availability}
            companyId="bytedance"
            order="06"
            variant="evidence"
            media={{
              src: '/images/xuelang/hero-panorama.webp',
              width: 3000,
              height: 1500,
              alt:
                locale === 'zh'
                  ? '学浪产品体验全景，呈现发现、决策与学习的关键界面'
                  : 'Xuelang product panorama showing key discovery, purchase, and learning interfaces',
            }}
            transitionTone="light"
          />
        </section>
      </SectionReveal>
    </section>
  );
}
