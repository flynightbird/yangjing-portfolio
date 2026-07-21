import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import styles from './meeting-layout.module.css';
import './meeting-print.css';

const copy = {
  en: {
    eyebrow: 'AGORA MEETING / ENTERPRISE MEETING aPaaS',
    projectFacts: 'Project facts',
    role: 'Role',
    timeline: 'Timeline',
    platforms: 'Platforms',
    platformValue: 'Desktop · Web · Tablet · Mobile',
    status: 'Status',
    disclosure: 'Evidence boundary',
    heroAlt: 'Agora Meeting desktop stage with participant video, controls, and live meeting state',
    heroCaption: 'Shipped meeting stage / Desktop',
  },
  zh: {
    eyebrow: 'AGORA MEETING / 企业会议 aPaaS',
    projectFacts: '项目概况',
    role: '角色',
    timeline: '周期',
    platforms: '平台',
    platformValue: '桌面客户端 · Web · 平板 · 手机',
    status: '状态',
    disclosure: '证据边界',
    heroAlt: 'Agora Meeting 桌面会议舞台，包含参会者视频、控制栏与实时会议状态',
    heroCaption: '已上线会议舞台 / 桌面端',
  },
} as const;

export function MeetingLayout({
  meta,
  locale,
  children,
  previous,
  next,
}: ContentLayoutProps) {
  const text = copy[locale];

  return (
    <div className={styles.root} data-meeting-case>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" surface="light" />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>{text.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p className={styles.proposition}>{meta.proposition}</p>
            <dl className={styles.facts} aria-label={text.projectFacts}>
              <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
              <div><dt>{text.timeline}</dt><dd>{meta.duration}</dd></div>
              <div><dt>{text.platforms}</dt><dd>{text.platformValue}</dd></div>
              <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
            </dl>
            <div className={styles.disclosure}>
              <span>{text.disclosure}</span>
              <p>{meta.disclosure}</p>
            </div>
            <figure className={styles.heroMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={meta.heroMedia} alt={text.heroAlt} width={2400} height={1430} />
              <figcaption>{text.heroCaption}</figcaption>
            </figure>
          </header>
          <div className={styles.content}>{children}</div>
          <CaseNeighbors locale={locale} previous={previous} next={next} />
        </article>
      </div>
    </div>
  );
}

function CaseNeighbors({
  locale,
  previous,
  next,
}: Pick<ContentLayoutProps, 'locale' | 'previous' | 'next'>) {
  if (!previous && !next) return null;
  const text = locale === 'zh'
    ? { label: '项目导航', previous: '上一个项目', next: '下一个项目' }
    : { label: 'Project navigation', previous: 'Previous project', next: 'Next project' };

  return (
    <nav className={styles.neighbors} aria-label={text.label}>
      {previous ? (
        <a href={previous.href} data-project-previous>
          <span>{text.previous}</span><strong>{previous.title}</strong>
        </a>
      ) : <span />}
      {next ? (
        <a href={next.href} data-project-next>
          <span>{text.next}</span><strong>{next.title}</strong>
        </a>
      ) : null}
    </nav>
  );
}
