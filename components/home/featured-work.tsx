import { CommunicationProjects } from '@/components/home/communication-projects';
import { FeaturedProject } from '@/components/home/featured-project';
import { FlagshipProjects } from '@/components/home/flagship-projects';
import { LiveWebsiteProject } from '@/components/home/live-website-project';
import { XuelangHomeComparison } from '@/components/home/xuelang-home-comparison';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import { homepageProjects } from '@/content/home';
import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './home.module.css';

interface FeaturedWorkProps {
  readonly locale: Locale;
}

export function FeaturedWork({ locale }: FeaturedWorkProps) {
  const copy = locale === 'zh' ? zhDictionary.home.projects : enDictionary.home.projects;
  const localeRoot = withBasePath(`/${locale}/`);
  const [xuelang, callAgent, convoAi, meeting, aidx, sttDemo] = homepageProjects;

  return (
    <section
      id="work"
      className={styles.featuredWork}
      aria-label={locale === 'zh' ? '精选作品' : 'Selected work'}
    >
      <ScrollReveal>
        <FlagshipProjects
          locale={locale}
          callAgent={{
            copy: copy.callAgent,
            href: `${localeRoot}${callAgent.href}`,
          }}
          convoAi={{
            copy: copy.convoAi,
            href: `${localeRoot}${convoAi.href}`,
          }}
        />
      </ScrollReveal>
      <ScrollReveal>
        <CommunicationProjects
          locale={locale}
          meeting={{ copy: copy.meeting, href: `${localeRoot}${meeting.href}` }}
          stt={{ copy: copy.sttDemo, href: withBasePath(sttDemo.href) }}
        />
      </ScrollReveal>
      <ScrollReveal>
        <section data-project-chapter="visual-brand">
          <LiveWebsiteProject copy={copy.aidx} href={aidx.href} />
        </section>
      </ScrollReveal>
      <ScrollReveal>
        <section data-project-chapter="product-foundation">
          <FeaturedProject
            id="xuelang"
            copy={copy.xuelang}
            href={`${localeRoot}${xuelang.href}`}
            availability={xuelang.availability}
            companyId="bytedance"
            order="06"
            variant="evidence"
            mediaContent={<XuelangHomeComparison locale={locale} />}
            transitionTone="light"
          />
        </section>
      </ScrollReveal>
    </section>
  );
}
