import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import { ProductFilmClip } from './meeting-film';
import { meetingFilmClips } from './meeting-film-contract';
import { meetingFilmSourcesReady } from './meeting-film-readiness.server';
import styles from './meeting-layout.module.css';
import './meeting-print.css';

const copy = {
  en: {
    eyebrow: 'AGORA MEETING / ENTERPRISE MEETING aPaaS',
    platformValue: 'Desktop · Web · Tablet · Mobile',
    heroAlt: 'Agora Meeting desktop stage with participant video, controls, and live meeting state',
    heroCaption: 'Shipped meeting stage / Desktop',
    clipTitle: 'Agora Meeting product film opening',
    replayLabel: 'Replay',
  },
  zh: {
    eyebrow: 'AGORA MEETING / 企业会议 aPaaS',
    platformValue: '桌面客户端 · Web · 平板 · 手机',
    heroAlt: 'Agora Meeting 桌面会议舞台，包含参会者视频、控制栏与实时会议状态',
    heroCaption: '已上线会议舞台 / 桌面端',
    clipTitle: 'Agora Meeting 产品片开场',
    replayLabel: '重新播放',
  },
} as const;

export function MeetingLayout({
  meta,
  locale,
  children,
}: ContentLayoutProps) {
  const filmReady = meetingFilmSourcesReady();
  return (
    <MeetingLayoutView
      meta={meta}
      locale={locale}
      filmReady={filmReady}
    >
      {children}
    </MeetingLayoutView>
  );
}

export function MeetingLayoutView({
  meta,
  locale,
  children,
  filmReady,
}: ContentLayoutProps & { readonly filmReady: boolean }) {
  const text = copy[locale];
  const landscapeClip = meetingFilmClips.find(
    ({ id }) => id === 'meeting-stage-landscape',
  );
  if (!landscapeClip) throw new Error('Missing Meeting landscape film descriptor');

  return (
    <div
      className={styles.root}
      data-meeting-case
      data-meeting-film-ready={filmReady ? 'true' : 'false'}
    >
      <div className={styles.frame} data-meeting-frame>
        <aside className={styles.rail} data-meeting-rail>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} />
        </aside>
        <article className={styles.case} data-case-study>
          <header
            className={styles.hero}
            data-meeting-hero
            data-meeting-cold-open
            data-film-state={filmReady ? 'video' : 'static'}
          >
            <p className={styles.eyebrow}>{text.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p className={styles.proposition}>{meta.proposition}</p>
            <p className={styles.scopeLine} data-testid="meeting-scope-line">
              <span>{meta.role}<i aria-hidden="true"> · </i></span>
              <span>{meta.duration}<i aria-hidden="true"> · </i></span>
              <span>{text.platformValue}<i aria-hidden="true"> · </i></span>
              <span>{meta.status}</span>
            </p>
            <div className={styles.heroMedia}>
              {filmReady ? (
                <ProductFilmClip
                  src={landscapeClip.src}
                  poster={landscapeClip.poster}
                  frame="browser"
                  replayLabel={text.replayLabel}
                  title={text.clipTitle}
                  description={text.heroCaption}
                  fallbackAlt={landscapeClip.fallback[locale]}
                />
              ) : (
                <figure className={styles.heroPoster} data-film-static-fallback>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={meta.heroMedia} alt={text.heroAlt} width={2400} height={1430} />
                  <figcaption>{text.heroCaption}</figcaption>
                </figure>
              )}
            </div>
          </header>
          <div className={styles.content} data-meeting-content>{children}</div>
        </article>
      </div>
    </div>
  );
}
