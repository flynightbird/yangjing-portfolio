import type { ContentLayoutProps } from '@/components/case-study/case-layout';
import { ChapterNav } from '@/components/case-study/chapter-nav';

import { MeetingHeroStage } from './meeting-showcase';
import styles from './meeting-layout.module.css';
import './meeting-print.css';

const copy = {
  en: {
    projectFacts: 'Project facts',
    role: 'Role',
    duration: 'Duration',
    platforms: 'Platforms',
    platformValue: 'Desktop · Web · Tablet · Mobile',
    status: 'Status',
  },
  zh: {
    projectFacts: '项目概况',
    role: '角色',
    duration: '周期',
    platforms: '平台',
    platformValue: '桌面客户端 · Web · 平板 · 手机',
    status: '状态',
  },
} as const;

export function MeetingSystemLayout({ meta, locale, children }: ContentLayoutProps) {
  const text = copy[locale];

  return (
    <div
      className={`${styles.root} ${styles.systemRoot}`}
      data-meeting-case
      data-meeting-system-case
    >
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav
            chapters={meta.chapters ?? []}
            locale={locale}
            compactAt="wide"
            surface="dark"
          />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={`${styles.hero} ${styles.systemHero}`}>
            <div className={styles.heroTop}>
              <div className={styles.heroBody}>
                <h1>{meta.title}</h1>
                <p className={styles.proposition}>{meta.proposition}</p>
              </div>
              <div className={styles.heroMeta}>
                <dl className={styles.metaRow} aria-label={text.projectFacts}>
                  <div>
                    <dt>{text.role}</dt>
                    <dd>{meta.role}</dd>
                  </div>
                  <div>
                    <dt>{text.duration}</dt>
                    <dd>{meta.duration}</dd>
                  </div>
                </dl>
                <dl className={styles.metaRow} aria-label={text.projectFacts}>
                  <div>
                    <dt>{text.platforms}</dt>
                    <dd>{text.platformValue}</dd>
                  </div>
                  <div>
                    <dt>{text.status}</dt>
                    <dd>{meta.status}</dd>
                  </div>
                </dl>
                {meta.facts?.length ? (
                  <dl className={styles.metaRow} aria-label={text.projectFacts}>
                    {meta.facts.map((fact) => (
                      <div key={`${fact.label}:${fact.value}`}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </div>
            <div className={styles.heroMedia}>
              <MeetingHeroStage locale={locale} />
            </div>
          </header>
          <div className={styles.content}>{children}</div>
        </article>
      </div>
    </div>
  );
}
