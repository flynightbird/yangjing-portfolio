import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import { MeetingHeroStage } from './meeting-showcase';
import styles from './meeting-layout.module.css';
import './meeting-print.css';

const copy = {
  en: {
    eyebrow: 'AGORA MEETING / ENTERPRISE MEETING aPaaS',
    projectFacts: 'Project facts',
    role: 'Role',
    platforms: 'Platforms',
    platformValue: 'Desktop · Web · Tablet · Mobile',
    status: 'Status',
    product: 'Product',
    productValue: 'Enterprise meeting aPaaS',
  },
  zh: {
    eyebrow: 'AGORA MEETING / 企业会议 aPaaS',
    projectFacts: '项目概况',
    role: '角色',
    platforms: '平台',
    platformValue: '桌面客户端 · Web · 平板 · 手机',
    status: '状态',
    product: '产品',
    productValue: '企业会议 aPaaS',
  },
} as const;

export function MeetingLayout({
  meta,
  locale,
  children,
}: ContentLayoutProps) {
  const text = copy[locale];
  const heroTitleId = `meeting-hero-title-${locale}`;
  const heroPropositionId = `meeting-hero-proposition-${locale}`;

  return (
    <div className={styles.root} data-meeting-case>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" surface="dark" />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={styles.hero}>
            <div className={styles.heroTop}>
              <div className={styles.heroBody}>
                <p className={styles.eyebrow}>{text.eyebrow}</p>
                <h1 id={heroTitleId}>{meta.title}</h1>
                <p id={heroPropositionId} className={styles.proposition}>{meta.proposition}</p>
              </div>
              <div className={styles.heroMeta}>
                <div className={styles.logoMotionRow} data-meeting-logo-row>
                  <div className={styles.logoMotionCard} data-meeting-logo-motion>
                    <video
                      className={styles.logoMotionVideo}
                      src="/videos/meeting/meeting-logo-motion-dark.mp4"
                      poster="/images/meeting/meeting-logo-motion-dark-poster.webp"
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-hidden="true"
                      aria-describedby={`${heroTitleId} ${heroPropositionId}`}
                      />
                    <img
                      className={styles.logoMotionFallback}
                      src="/images/meeting/meeting-logo-dark.webp"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <dl className={styles.metaRow} data-meeting-meta-row aria-label={text.projectFacts}>
                  <div>
                    <dt>{text.role}</dt>
                    <dd>{meta.role}</dd>
                  </div>
                  <div>
                    <dt>{text.platforms}</dt>
                    <dd>{text.platformValue}</dd>
                  </div>
                </dl>
                <dl className={styles.metaRow} data-meeting-meta-row aria-label={text.projectFacts}>
                  <div>
                    <dt>{text.product}</dt>
                    <dd>{text.productValue}</dd>
                  </div>
                  <div>
                    <dt>{text.status}</dt>
                    <dd>{meta.status}</dd>
                  </div>
                </dl>
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
