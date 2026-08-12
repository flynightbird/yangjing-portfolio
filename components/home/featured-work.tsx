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
  const [xuelang, callAgent, convoAi, growthBase, meeting, aidx, sttDemo] = homepageProjects;
  const workIndex =
    locale === 'zh'
      ? {
          title: '精选作品',
          summary: '从 AI 产品与复杂系统，到消费体验与品牌表达。选择一个方向，直接进入相关项目。',
          items: [
            ['AI 产品与原型', '#ai-products'],
            ['通信系统', '#communication-systems'],
            ['品牌与网站', '#visual-brand'],
            ['消费与增长', '#product-foundation'],
          ] as const,
        }
      : {
          title: 'Selected work',
          summary:
            'From AI products and complex systems to consumer experiences and brand expression. Choose a focus to enter the work.',
          items: [
            ['AI products & prototypes', '#ai-products'],
            ['Communication systems', '#communication-systems'],
            ['Brand & web', '#visual-brand'],
            ['Consumer & growth', '#product-foundation'],
          ] as const,
        };

  return (
    <section
      id="work"
      className={styles.featuredWork}
      aria-label={locale === 'zh' ? '精选作品' : 'Selected work'}
    >
      <header className={styles.workIndex}>
        <div className={styles.workIndexIntro}>
          <h2>{workIndex.title}</h2>
          <p>{workIndex.summary}</p>
        </div>
        <nav
          className={styles.workIndexNav}
          aria-label={locale === 'zh' ? '作品类别' : 'Work categories'}
        >
          {workIndex.items.map(([label, href], index) => (
            <a href={href} key={href}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {label}
            </a>
          ))}
        </nav>
      </header>
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
          growthBase={{
            copy: copy.growthBase,
            href: `${localeRoot}${growthBase.href}`,
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
        <section
          id="visual-brand"
          className={styles.projectAnchor}
          data-project-chapter="visual-brand"
        >
          <LiveWebsiteProject copy={copy.aidx} href={aidx.href} />
        </section>
      </ScrollReveal>
      <ScrollReveal>
        <section
          id="product-foundation"
          className={styles.projectAnchor}
          data-project-chapter="product-foundation"
        >
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
