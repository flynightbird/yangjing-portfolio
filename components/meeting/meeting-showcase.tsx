'use client';

/* eslint-disable @next/next/no-img-element */

import { RotateCcw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import type { Locale } from '@/content/types';
import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './meeting-showcase.module.css';

type MeetingMediaId =
  | 'hero-web'
  | 'hero-app'
  | 'stage-web'
  | 'stage-landscape-app'
  | 'stage-portrait-app'
  | 'whiteboard-web'
  | 'whiteboard-app-1'
  | 'whiteboard-app-2'
  | 'transcript-app'
  | 'interpretation-on-app'
  | 'interpretation-live-app'
  | 'beauty-app'
  | 'safety-app';

type MediaKind = 'browser' | 'landscape' | 'phone';

interface MediaDefinition {
  readonly id: MeetingMediaId;
  readonly kind: MediaKind;
  readonly src: string;
  readonly poster: string;
  readonly width: number;
  readonly height: number;
  readonly label: { readonly en: string; readonly zh: string };
  readonly title: { readonly en: string; readonly zh: string };
  readonly description: { readonly en: string; readonly zh: string };
}

const mediaCatalog: Record<MeetingMediaId, MediaDefinition> = {
  'hero-web': {
    id: 'hero-web',
    kind: 'browser',
    src: '/videos/meeting/meeting-hero-web.mp4',
    poster: '/images/meeting/meeting-hero-web-poster.webp',
    width: 1600,
    height: 808,
    label: { en: 'Web workspace', zh: 'Web 工作区' },
    title: { en: 'Real-time transcript stays in the live workspace', zh: '转写与会议内容并行' },
    description: {
      en: 'The browser surface keeps people, transcript, and content editing in one view.',
      zh: '参会者、实时转写和内容处理集中在同一界面。',
    },
  },
  'hero-app': {
    id: 'hero-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-hero-app.mp4',
    poster: '/images/meeting/meeting-hero-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'App portrait', zh: '手机竖屏' },
    title: { en: 'Portrait stage keeps the meeting readable', zh: '小屏仍保留会议信息重点' },
    description: {
      en: 'On mobile portrait, the stage compresses without losing awareness of who is present and what is active.',
      zh: '压缩布局，不压缩参会者和当前会议状态。',
    },
  },
  'stage-web': {
    id: 'stage-web',
    kind: 'browser',
    src: '/videos/meeting/meeting-stage-web.mp4',
    poster: '/images/meeting/meeting-stage-web-poster.webp',
    width: 1600,
    height: 872,
    label: { en: 'Adaptive stage', zh: '自适应舞台' },
    title: { en: 'The stage moves with context, not with raw viewport math', zh: '任务变化，布局随之切换' },
    description: {
      en: 'Share, speaker, and workspace states each promote a different primary object.',
      zh: '对话、共享和协作分别对应不同的信息重点。',
    },
  },
  'stage-landscape-app': {
    id: 'stage-landscape-app',
    kind: 'landscape',
    src: '/videos/meeting/meeting-stage-landscape-app.mp4',
    poster: '/images/meeting/meeting-stage-landscape-app-poster.webp',
    width: 1280,
    height: 590,
    label: { en: 'Landscape viewport', zh: '横屏视窗' },
    title: { en: 'Landscape releases the main stage', zh: '横屏释放主舞台' },
    description: {
      en: 'The wider viewport gives content and participant video room to expand.',
      zh: '更宽的视窗优先承载内容与参会者画面。',
    },
  },
  'stage-portrait-app': {
    id: 'stage-portrait-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-stage-portrait-app.mp4',
    poster: '/images/meeting/meeting-stage-portrait-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Portrait viewport', zh: '竖屏视窗' },
    title: { en: 'Portrait reorders the hierarchy', zh: '竖屏重排信息层级' },
    description: {
      en: 'The narrow viewport retains the main stage, meeting context, and core controls.',
      zh: '有限宽度下保留主舞台、会议信息与核心控制。',
    },
  },
  'whiteboard-web': {
    id: 'whiteboard-web',
    kind: 'browser',
    src: '/videos/meeting/meeting-whiteboard-web.mp4',
    poster: '/images/meeting/meeting-whiteboard-web-poster.webp',
    width: 1600,
    height: 984,
    label: { en: 'Whiteboard web', zh: 'Web 白板' },
    title: { en: 'Canvas first on the large surface', zh: '大屏优先释放白板空间' },
    description: {
      en: 'The shared board expands first, while meeting controls stay available without competing for dominance.',
      zh: '白板占据主要区域，会议控制保持可用。',
    },
  },
  'whiteboard-app-1': {
    id: 'whiteboard-app-1',
    kind: 'phone',
    src: '/videos/meeting/meeting-whiteboard-app-1.mp4',
    poster: '/images/meeting/meeting-whiteboard-app-1-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Portrait whiteboard A', zh: '手机白板 A' },
    title: { en: 'Portrait keeps one participant channel above the board', zh: '白板优先，参会者仍然可见' },
    description: {
      en: 'The board stays primary, while a compact participant window preserves meeting awareness.',
      zh: '白板上方保留一个参会者画面。',
    },
  },
  'whiteboard-app-2': {
    id: 'whiteboard-app-2',
    kind: 'phone',
    src: '/videos/meeting/meeting-whiteboard-app-2.mp4',
    poster: '/images/meeting/meeting-whiteboard-app-2-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Portrait whiteboard B', zh: '手机白板 B' },
    title: { en: 'The same rule survives another whiteboard state', zh: '状态变化，规则保持一致' },
    description: {
      en: 'Different whiteboard moments still follow the same layout logic rather than device-by-device exceptions.',
      zh: '不同白板状态沿用同一套布局判断。',
    },
  },
  'transcript-app': {
    id: 'transcript-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-transcript-app.mp4',
    poster: '/images/meeting/meeting-transcript-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Live transcript', zh: '实时转写' },
    title: { en: 'Transcript becomes an in-meeting layer', zh: '转写直接进入会中流程' },
    description: {
      en: 'Comprehension support stays close to the active meeting rather than becoming a separate after-the-fact export.',
      zh: '用户无需离开会议即可查看实时内容。',
    },
  },
  'interpretation-on-app': {
    id: 'interpretation-on-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-interpretation-on-app.mp4',
    poster: '/images/meeting/meeting-interpretation-on-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Interpretation setup', zh: '同声传译·开启' },
    title: { en: 'Language tools begin with explicit activation', zh: '同传由会议统一开启' },
    description: {
      en: 'Turning on interpretation is treated as a meeting capability, not a hidden personal preference.',
      zh: '它属于会议级能力，而不是个人偏好。',
    },
  },
  'interpretation-live-app': {
    id: 'interpretation-live-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-interpretation-live-app.mp4',
    poster: '/images/meeting/meeting-interpretation-live-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Interpretation live', zh: '同声传译·翻译官角色' },
    title: { en: 'Translation stays legible inside the active room', zh: '翻译结果与会议同步呈现' },
    description: {
      en: 'Translation and understanding support stay attached to the live stage instead of creating a separate destination.',
      zh: '用户在当前会议中直接获取翻译内容。',
    },
  },
  'beauty-app': {
    id: 'beauty-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-beauty-app.mp4',
    poster: '/images/meeting/meeting-beauty-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Camera polish', zh: '美颜设置' },
    title: { en: 'Personal polish still belongs inside the meeting flow', zh: '个人设置沿用统一交互' },
    description: {
      en: 'Even personal camera tuning keeps the same product tone and control density.',
      zh: '相机调节保持与会议主流程一致的控制方式。',
    },
  },
  'safety-app': {
    id: 'safety-app',
    kind: 'phone',
    src: '/videos/meeting/meeting-safety-app.mp4',
    poster: '/images/meeting/meeting-safety-app-poster.webp',
    width: 590,
    height: 1280,
    label: { en: 'Member and safety', zh: '成员与安全' },
    title: { en: 'Member visibility and safety sit beside live participation', zh: '会议管理不脱离现场' },
    description: {
      en: 'Governance surfaces stay connected to the live room instead of reading like an admin product.',
      zh: '成员信息和安全控制都从当前会议进入。',
    },
  },
};

const copy = {
  en: {
    brand: 'Agora Meeting',
    stageLabel: 'Web + App shipped surface',
    replay: 'Replay',
    browserAddress: 'meeting.agora.io / live',
    browserAction: 'Open in browser',
    orientationTitle: 'One priority rule across both orientations',
    orientationSummary: 'Landscape expands the stage while portrait reorders information. Participants, shared content, and controls keep the same hierarchy.',
    whiteboardTitle: 'One whiteboard rule across desktop and portrait mobile',
    whiteboardSummary: 'Desktop lets the canvas take the room. Mobile keeps one participant channel alive without shrinking the board into a thumbnail.',
    languageTitle: 'Real-time language support lives inside the meeting, not outside it',
    languageSummary: 'Transcript, interpretation, and bilingual understanding behave like one information layer with different control scopes.',
    polishTitle: 'The shipped system also had to feel complete in the details',
    polishSummary: 'Beauty, member visibility, and safety controls matter because enterprise meeting products are judged on everyday fit, not only on big system ideas.',
  },
  zh: {
    brand: 'Agora Meeting',
    stageLabel: 'Web + App 已上线界面',
    replay: '重播',
    browserAddress: 'meeting.agora.io / live',
    browserAction: '在浏览器中查看',
    orientationTitle: '方向改变，信息优先级不变',
    orientationSummary: '横屏扩展舞台，竖屏重排信息；两种视窗沿用同一套参会者、共享内容与控制层级。',
    whiteboardTitle: '一套白板规则，适配桌面与手机横竖屏',
    whiteboardSummary: '桌面端释放白板空间；手机端保留必要的参会者画面。',
    languageTitle: '三类能力，同一处完成',
    languageSummary: '字幕、转写和同传都发生在会中，再按个人与会议两级权限控制。',
    polishTitle: '高频细节决定系统是否完整',
    polishSummary: '美颜、成员管理和安全控制沿用统一的角色、状态与交互规则。',
  },
} as const;

function MeetingViewportVideo({
  media,
  loop = true,
  videoRef,
  className,
}: {
  readonly media: MediaDefinition;
  readonly loop?: boolean;
  readonly videoRef?: React.RefObject<HTMLVideoElement | null>;
  readonly className?: string;
}) {
  const reduceMotion = useReducedMotionPreference();
  const [isLoaded, setIsLoaded] = useState(false);

  if (reduceMotion) {
    return (
      <img
        className={className}
        src={media.poster}
        alt=""
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div className={styles.videoFrame} data-loaded={isLoaded ? 'true' : 'false'}>
      <img
        className={styles.videoPoster}
        data-meeting-video-poster
        src={media.poster}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <video
        ref={videoRef}
        className={className}
        data-meeting-video
        aria-hidden="true"
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        playsInline
        loop={loop}
        preload="auto"
        onLoadedData={() => setIsLoaded(true)}
      />
    </div>
  );
}

function BrowserShell({
  mediaId,
  locale,
  chromeLabel,
  className,
  loop = true,
  videoRef,
}: {
  readonly mediaId: MeetingMediaId;
  readonly locale: Locale;
  readonly chromeLabel?: string;
  readonly className?: string;
  readonly loop?: boolean;
  readonly videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const media = mediaCatalog[mediaId];
  const text = copy[locale];

  return (
    <figure className={`${styles.surface} ${styles.browserFigure} ${className ?? ''}`}>
      <div className={styles.browserShell}>
        <div className={styles.browserBar}>
          <span className={styles.browserLights} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.browserAddress}>
            <img src="/images/meeting/meeting-logo-light.webp" alt="" />
            {text.browserAddress}
          </span>
          <span className={styles.browserMeta}>
            {chromeLabel ?? text.browserAction}
          </span>
        </div>
        <div className={styles.browserViewport} style={{ aspectRatio: `${media.width} / ${media.height}` }}>
          <MeetingViewportVideo media={media} loop={loop} videoRef={videoRef} className={styles.media} />
        </div>
      </div>
      <figcaption>
        <span>{media.label[locale]}</span>
        <strong>{media.title[locale]}</strong>
        <p>{media.description[locale]}</p>
      </figcaption>
    </figure>
  );
}

function PhoneShell({
  mediaId,
  locale,
  className,
  loop = true,
  videoRef,
}: {
  readonly mediaId: MeetingMediaId;
  readonly locale: Locale;
  readonly className?: string;
  readonly loop?: boolean;
  readonly videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const media = mediaCatalog[mediaId];

  return (
    <figure className={`${styles.surface} ${styles.phoneFigure} ${className ?? ''}`}>
      <div className={styles.phoneShell}>
        <div className={styles.phoneViewport} style={{ aspectRatio: `${media.width} / ${media.height}` }}>
          <MeetingViewportVideo media={media} loop={loop} videoRef={videoRef} className={styles.media} />
        </div>
      </div>
      <figcaption>
        <span>{media.label[locale]}</span>
        <strong>{media.title[locale]}</strong>
        <p>{media.description[locale]}</p>
      </figcaption>
    </figure>
  );
}

function LandscapeShell({
  mediaId,
  locale,
}: {
  readonly mediaId: MeetingMediaId;
  readonly locale: Locale;
}) {
  const media = mediaCatalog[mediaId];

  return (
    <figure className={`${styles.surface} ${styles.landscapeFigure}`}>
      <div className={styles.landscapeShell}>
        <div className={styles.landscapeViewport} style={{ aspectRatio: `${media.width} / ${media.height}` }}>
          <MeetingViewportVideo media={media} className={styles.media} />
        </div>
      </div>
      <figcaption>
        <span>{media.label[locale]}</span>
        <strong>{media.title[locale]}</strong>
        <p>{media.description[locale]}</p>
      </figcaption>
    </figure>
  );
}

export function MeetingHeroStage({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const appVideoRef = useRef<HTMLVideoElement>(null);

  const replay = useCallback(() => {
    for (const ref of [webVideoRef, appVideoRef]) {
      if (!ref.current) continue;
      ref.current.pause();
      ref.current.currentTime = 0;
      void ref.current.play().catch(() => undefined);
    }
  }, []);

  return (
    <div className={styles.heroStage}>
      <div className={styles.heroStageTop}>
        <div className={styles.heroBrand}>
          <img src="/images/meeting/meeting-logo-light.webp" alt="" />
          <div>
            <strong>{text.brand}</strong>
            <span>{text.stageLabel}</span>
          </div>
        </div>
        <button type="button" className={styles.replayButton} onClick={replay} aria-label={text.replay}>
          <RotateCcw aria-hidden="true" size={18} />
        </button>
      </div>

      <div className={styles.heroStageScene}>
        <BrowserShell
          mediaId="hero-web"
          locale={locale}
          chromeLabel="Live transcript"
          className={styles.heroBrowser}
          loop={false}
          videoRef={webVideoRef}
        />
        <PhoneShell
          mediaId="hero-app"
          locale={locale}
          className={styles.heroPhone}
          loop={false}
          videoRef={appVideoRef}
        />
      </div>
    </div>
  );
}

export function MeetingAdaptiveStageShowcase({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={styles.sectionStack}>
      <BrowserShell mediaId="stage-web" locale={locale} chromeLabel="Adaptive stage" />
      <div className={styles.orientationBlock}>
        <div className={styles.sectionIntro}>
          <h3>{text.orientationTitle}</h3>
          <p>{text.orientationSummary}</p>
        </div>
        <div className={styles.orientationCompare}>
          <LandscapeShell mediaId="stage-landscape-app" locale={locale} />
          <PhoneShell mediaId="stage-portrait-app" locale={locale} />
        </div>
      </div>
    </div>
  );
}

export function MeetingWhiteboardShowcase({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionIntro}>
        <h3>{text.whiteboardTitle}</h3>
        <p>{text.whiteboardSummary}</p>
      </div>
      <BrowserShell mediaId="whiteboard-web" locale={locale} chromeLabel="Whiteboard workspace" />
      <div className={`${styles.phoneGrid} ${styles.whiteboardDeck}`} data-columns="2">
        <PhoneShell mediaId="whiteboard-app-1" locale={locale} />
        <PhoneShell mediaId="whiteboard-app-2" locale={locale} />
      </div>
    </div>
  );
}

export function MeetingLanguageShowcase({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionIntro}>
        <h3>{text.languageTitle}</h3>
        <p>{text.languageSummary}</p>
      </div>
      <div className={styles.phoneGrid} data-columns="3">
        <PhoneShell mediaId="transcript-app" locale={locale} />
        <PhoneShell mediaId="interpretation-on-app" locale={locale} />
        <PhoneShell mediaId="interpretation-live-app" locale={locale} />
      </div>
    </div>
  );
}

export function MeetingPolishShowcase({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionIntro}>
        <h3>{text.polishTitle}</h3>
        <p>{text.polishSummary}</p>
      </div>
      <div className={styles.phoneGrid} data-columns="2">
        <PhoneShell mediaId="beauty-app" locale={locale} />
        <PhoneShell mediaId="safety-app" locale={locale} />
      </div>
    </div>
  );
}
