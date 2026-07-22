import type { Locale } from '@/content/types';

import { OrientationMatchedCut, ProductFilmClip } from './meeting-film';
import { meetingFilmClips } from './meeting-film-contract';
import { meetingFilmSourcesReady } from './meeting-film-readiness.server';
import styles from './meeting-showcase.module.css';

type MeetingFilmClipId = (typeof meetingFilmClips)[number]['id'];

interface FilmTitleProps {
  readonly title: string;
  readonly supportingLine: string;
}

interface FilmActMediaProps {
  readonly clipId: MeetingFilmClipId;
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly replayLabel: string;
}

const filmCopy = {
  en: {
    triggers: ['People', 'Current content', 'Device context'],
    turn: 'Behind the film is a system of priorities.',
    stageAlt: 'Adaptive meeting-stage interface across portrait and landscape layouts',
    stageCaption: 'The meeting stage reflows as device orientation changes.',
    stageTitle: 'Meeting stage orientation change',
    portrait: 'Portrait',
    landscape: 'Landscape',
    showPortrait: 'Show portrait recording',
    showLandscape: 'Show landscape recording',
    whiteboardAlt: 'Whiteboard workspace across portrait and landscape mobile layouts',
    whiteboardCaption: 'The canvas stays primary while tools and participants move with the device.',
    whiteboardTitle: 'Whiteboard orientation change',
  },
  zh: {
    triggers: ['参会者', '当前内容', '设备环境'],
    turn: '镜头背后，是一套优先级系统。',
    stageAlt: '自适应会议舞台在横屏与竖屏布局中的界面',
    stageCaption: '设备方向变化时，会议舞台随情境重组。',
    stageTitle: '会议舞台横竖屏切换',
    portrait: '竖屏',
    landscape: '横屏',
    showPortrait: '显示竖屏录屏',
    showLandscape: '显示横屏录屏',
    whiteboardAlt: '白板工作区在手机竖屏与横屏布局中的界面',
    whiteboardCaption: '画布保持主位，工具与参会者随设备方向重组。',
    whiteboardTitle: '白板工作区横竖屏切换',
  },
} as const;

export function FilmTitle({ title, supportingLine }: FilmTitleProps) {
  return (
    <header className={styles.filmTitle} data-film-title>
      <h2>{title}</h2>
      <p>{supportingLine}</p>
    </header>
  );
}

export function ChallengeTriggers({ locale }: { readonly locale: Locale }) {
  return (
    <ul className={styles.triggers} data-challenge-triggers>
      {filmCopy[locale].triggers.map((trigger) => (
        <li key={trigger} data-challenge-trigger>{trigger}</li>
      ))}
    </ul>
  );
}

export function FilmTurn({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.filmTurn} data-film-turn>
      <h2>{filmCopy[locale].turn}</h2>
    </div>
  );
}

export function FilmActMedia({
  clipId,
  locale,
  title,
  description,
  replayLabel,
}: FilmActMediaProps) {
  const clip = resolveFilmClip(clipId);

  if (meetingFilmSourcesReady()) {
    return (
      <div className={styles.actMedia} data-film-video-ready data-film-clip-id={clip.id}>
        <ProductFilmClip
          src={clip.src}
          poster={clip.poster}
          frame="browser"
          replayLabel={replayLabel}
          title={title}
          description={description}
          fallbackAlt={clip.fallback[locale]}
        />
      </div>
    );
  }

  return (
    <figure
      className={styles.staticMedia}
      data-film-static-fallback
      data-film-clip-id={clip.id}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={clip.poster}
        alt={clip.fallback[locale]}
        width={1800}
        height={1100}
        loading="lazy"
        decoding="async"
      />
      <figcaption className={styles.staticCopy} data-film-static-copy>
        <strong>{title}</strong>
        <span>{description}</span>
      </figcaption>
    </figure>
  );
}

export function StageOrientationMedia({ locale }: { readonly locale: Locale }) {
  const portrait = resolveFilmClip('meeting-stage-portrait');
  const landscape = resolveFilmClip('meeting-stage-landscape');
  const text = filmCopy[locale];

  if (meetingFilmSourcesReady()) {
    return (
      <div className={styles.orientationMedia} data-stage-orientation-media data-film-video-ready>
        <OrientationMatchedCut
          portrait={{
            src: portrait.src,
            poster: portrait.poster,
          }}
          landscape={{
            src: landscape.src,
            poster: landscape.poster,
          }}
          title={text.stageTitle}
          fallbackAlt={text.stageAlt}
          portraitLabel={text.portrait}
          landscapeLabel={text.landscape}
          showPortraitLabel={text.showPortrait}
          showLandscapeLabel={text.showLandscape}
        />
      </div>
    );
  }

  return (
    <figure
      className={styles.staticMedia}
      data-stage-orientation-media
      data-film-static-fallback
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portrait.poster}
        alt={text.stageAlt}
        width={1800}
        height={1100}
        loading="lazy"
        decoding="async"
      />
      <figcaption><strong>{text.stageCaption}</strong></figcaption>
    </figure>
  );
}

export function WhiteboardOrientationMedia({ locale }: { readonly locale: Locale }) {
  const portrait = resolveFilmClip('meeting-whiteboard-portrait');
  const landscape = resolveFilmClip('meeting-whiteboard-landscape');
  const text = filmCopy[locale];

  if (meetingFilmSourcesReady()) {
    return (
      <div className={styles.orientationMedia} data-whiteboard-orientation-media data-film-video-ready>
        <OrientationMatchedCut
          portrait={{
            src: portrait.src,
            poster: portrait.poster,
          }}
          landscape={{
            src: landscape.src,
            poster: landscape.poster,
          }}
          title={text.whiteboardTitle}
          fallbackAlt={text.whiteboardAlt}
          portraitLabel={text.portrait}
          landscapeLabel={text.landscape}
          showPortraitLabel={text.showPortrait}
          showLandscapeLabel={text.showLandscape}
        />
      </div>
    );
  }

  return (
    <figure
      className={styles.staticMedia}
      data-whiteboard-orientation-media
      data-film-static-fallback
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portrait.poster}
        alt={text.whiteboardAlt}
        width={1800}
        height={1100}
        loading="lazy"
        decoding="async"
      />
      <figcaption><strong>{text.whiteboardCaption}</strong></figcaption>
    </figure>
  );
}

export function WebWorkspaceMedia({ locale }: { readonly locale: Locale }) {
  const isChinese = locale === 'zh';

  return (
    <div className={styles.webMediaGrid} data-web-workspace-media>
      <FilmActMedia
        clipId="meeting-web-transcription"
        locale={locale}
        title={isChinese ? 'Web 实时转写与页面利用' : 'Web transcription workspace'}
        description={isChinese
          ? '转写面板与会议舞台并行展开，信息增加时仍保持主要内容清晰。'
          : 'The transcript and meeting stage share the workspace while primary content stays clear.'}
        replayLabel={isChinese ? '重新播放' : 'Replay'}
      />
      <FilmActMedia
        clipId="meeting-web-layout"
        locale={locale}
        title={isChinese ? 'Web 左右布局切换' : 'Web side-panel layout'}
        description={isChinese
          ? '辅助面板在舞台两侧切换，会议内容始终保持连续。'
          : 'Supporting panels move around the stage while meeting content remains continuous.'}
        replayLabel={isChinese ? '重新播放' : 'Replay'}
      />
    </div>
  );
}

function resolveFilmClip(clipId: MeetingFilmClipId) {
  const clip = meetingFilmClips.find(({ id }) => id === clipId);
  if (!clip) throw new Error(`Unknown Meeting film clip: ${clipId}`);
  return clip;
}

const proofRows = {
  en: [
    ['01', '4 device classes', 'Desktop, Web, tablet, and mobile'],
    ['02', '3 signature decisions', 'Stage, workspace, and information layer'],
    ['03', 'Shipped product', 'One product system across four device classes'],
  ],
  zh: [
    ['01', '4 类终端', '桌面客户端、Web、平板与手机'],
    ['02', '3 个核心决策', '舞台、工作区与实时信息层'],
    ['03', '已上线产品', '同一套产品系统覆盖四类终端'],
  ],
} as const;

export function ShowcaseProof({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.proof} data-showcase-proof>
      {proofRows[locale].map(([index, title, detail]) => (
        <div key={index}>
          <span>{index}</span>
          <strong>{title}</strong>
          <p>{detail}</p>
        </div>
      ))}
    </div>
  );
}
