'use client';
/* eslint-disable @next/next/no-img-element */

import { AlertCircle, ArrowLeft, ArrowRight, Monitor, RotateCcw, Smartphone } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import type { Locale } from '@/content/types';
import { getConvoAiMedia, type ConvoAiMediaId } from './convo-ai-media-catalog';
import styles from './convo-ai-media.module.css';
import { ConvoAiViewportVideo } from './convo-ai-video';

const appShowcaseSteps = [
  { id: 'app-login', index: '01', label: '登录与进入', summary: '用短入口建立产品身份和移动端旅程起点。', enLabel: 'App entry and sign in', enSummary: 'A short entry establishes product identity and the start of the mobile journey.' },
  { id: 'app-structure', index: '02', label: '产品结构', summary: '组织 Agent、个人入口与设备入口的主次关系。', enLabel: 'Product structure', enSummary: 'Organize the hierarchy between agents, profile entry, and device entry.' },
  { id: 'app-profile-settings', index: '03', label: '个人设置', summary: '让修改、确认与返回形成连续反馈。', enLabel: 'Personal settings', enSummary: 'Make modification, confirmation, and return one continuous feedback loop.' },
  { id: 'app-hardware-device', index: '04', label: '硬件设备', summary: '把环境准备与设备扫描组织成一条任务。', enLabel: 'Hardware device', enSummary: 'Organize environment preparation and device scanning as one task.' },
] as const satisfies readonly { readonly id: ConvoAiMediaId; readonly index: string; readonly label: string; readonly summary: string; readonly enLabel: string; readonly enSummary: string }[];

type AppShowcaseId = (typeof appShowcaseSteps)[number]['id'];

function subscribeToMediaQuery(query: string, onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => undefined;
  const media = window.matchMedia(query);
  if (media.addEventListener) {
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }
  media.addListener?.(onChange);
  return () => media.removeListener?.(onChange);
}

function useMediaQuery(query: string) {
  const subscribe = useCallback((onChange: () => void) => subscribeToMediaQuery(query, onChange), [query]);
  const getSnapshot = useCallback(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${String(minutes).padStart(2, '0')}:${remaining}`;
}

const cpdiLabels: Record<Locale, Record<'context' | 'problem' | 'decision' | 'impact', string>> = {
  en: { context: 'Context', problem: 'Problem', decision: 'Decision', impact: 'Impact' },
  zh: { context: '场景', problem: '问题', decision: '设计', impact: '作用' },
};

function MediaError({ locale, onReload }: { readonly locale: Locale; readonly onReload: () => void }) {
  return <div className={styles.mediaError} role="status" aria-live="polite"><AlertCircle aria-hidden="true" size={18} /><span>{locale === 'zh' ? '媒体暂时无法加载' : 'Media unavailable'}</span><button type="button" onClick={onReload}><RotateCcw aria-hidden="true" size={16} />{locale === 'zh' ? '重新加载' : 'Reload'}</button></div>;
}

export function ConvoAiPlaylist({ ids, locale }: { readonly ids: readonly ConvoAiMediaId[]; readonly locale: Locale }) {
  const [activeId, setActiveId] = useState(ids[0]);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const descriptionId = useId();
  const active = getConvoAiMedia(activeId);
  const copy = active.copy[locale];
  const activeIndex = ids.indexOf(activeId);
  const hasMultipleItems = ids.length > 1;
  const move = (offset: number) => {
    setFailed(false);
    setActiveId(ids[(activeIndex + offset + ids.length) % ids.length]);
  };

  return <div className={styles.playlist} data-convo-ai-playlist>
    <div className={styles.playlistSurface} data-playlist-surface data-tone={activeIndex % 4}>
      {hasMultipleItems ? <div className={styles.carouselHeader}>
        <div aria-live="polite" data-carousel-position><strong>{String(activeIndex + 1).padStart(2, '0')}</strong><span> / {String(ids.length).padStart(2, '0')}</span></div>
        <div className={styles.carouselControls}>
          <button type="button" aria-label={locale === 'zh' ? '上一段录屏' : 'Previous recording'} onClick={() => move(-1)}><ArrowLeft aria-hidden="true" size={20} /></button>
          <button type="button" aria-label={locale === 'zh' ? '下一段录屏' : 'Next recording'} onClick={() => move(1)}><ArrowRight aria-hidden="true" size={20} /></button>
        </div>
      </div> : null}
      <figure className={styles.evidence} data-platform={active.platform} data-media-card={active.id}>
        <div className={styles.videoFrame} style={{ aspectRatio: `${active.width} / ${active.height}` }}>
          <ConvoAiViewportVideo key={active.id} id={active.id} locale={locale} describedBy={descriptionId} videoRef={videoRef} onError={() => setFailed(true)} onLoadedData={() => setFailed(false)} />
          {failed ? <MediaError locale={locale} onReload={() => { setFailed(false); videoRef.current?.load(); }} /> : null}
        </div>
        <figcaption id={descriptionId}><span>{active.platform.toUpperCase()} / {formatDuration(active.duration)}</span><p>{copy.description}</p></figcaption>
      </figure>
      <dl className={styles.cpdi}>{(['context', 'problem', 'decision', 'impact'] as const).map((key) => <div key={key}><dt>{cpdiLabels[locale][key]}</dt><dd>{copy[key]}</dd></div>)}</dl>
    </div>
    {hasMultipleItems ? <div className={styles.playlistNavigation}>
      <p>{locale === 'zh' ? '场景列表' : 'Scene list'}</p>
      <div className={styles.queue} data-playlist-navigation aria-label={locale === 'zh' ? '场景列表' : 'Scene list'}>
        {ids.map((id, index) => { const media = getConvoAiMedia(id); return <button key={id} type="button" aria-pressed={id === activeId} onClick={() => { setFailed(false); setActiveId(id); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{media.copy[locale].title}</strong><small>{formatDuration(media.duration)}</small></button>; })}
      </div>
    </div> : null}
  </div>;
}

const startConversationAppId = 'app-conversation-start' as const;
const startConversationWebIds = ['web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'] as const;

export function ConvoAiConversationStart({ locale }: { readonly locale: Locale }) {
  const [activeWebId, setActiveWebId] = useState<(typeof startConversationWebIds)[number]>('web-login');
  const [failed, setFailed] = useState({ app: false, web: false });
  const appVideoRef = useRef<HTMLVideoElement>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const appDescriptionId = useId();
  const webDescriptionId = useId();
  const app = getConvoAiMedia(startConversationAppId);
  const web = getConvoAiMedia(activeWebId);
  const webCopy = web.copy[locale];

  return <div className={styles.conversationStart} data-convo-start>
    <div className={styles.conversationStage} data-convo-start-stage>
      <figure className={styles.conversationWeb} data-convo-start-web data-media-card={activeWebId}>
        <div className={styles.conversationPlatformLabel}><span>WEB</span><strong>{locale === 'zh' ? '完整准备' : 'Complete setup'}</strong></div>
        <div className={styles.conversationWebMedia}>
          <ConvoAiViewportVideo key={activeWebId} id={activeWebId} locale={locale} describedBy={webDescriptionId} videoRef={webVideoRef} onError={() => setFailed((current) => ({ ...current, web: true }))} onLoadedData={() => setFailed((current) => ({ ...current, web: false }))} />
          {failed.web ? <MediaError locale={locale} onReload={() => { setFailed((current) => ({ ...current, web: false })); webVideoRef.current?.load(); }} /> : null}
        </div>
        <figcaption id={webDescriptionId} aria-live="polite">{webCopy.description}</figcaption>
      </figure>

      <figure className={styles.conversationApp} data-convo-start-app data-media-card={startConversationAppId}>
        <div className={styles.conversationPlatformLabel}><span>APP</span><strong>{locale === 'zh' ? '快速开始' : 'Quick start'}</strong></div>
        <div className={styles.conversationPhone}>
          <ConvoAiViewportVideo id={startConversationAppId} locale={locale} describedBy={appDescriptionId} videoRef={appVideoRef} onError={() => setFailed((current) => ({ ...current, app: true }))} onLoadedData={() => setFailed((current) => ({ ...current, app: false }))} />
          {failed.app ? <MediaError locale={locale} onReload={() => { setFailed((current) => ({ ...current, app: false })); appVideoRef.current?.load(); }} /> : null}
        </div>
        <figcaption id={appDescriptionId}>{app.copy[locale].description}</figcaption>
      </figure>
    </div>

    <dl className={styles.cpdi} data-convo-start-detail>
      {(['context', 'problem', 'decision', 'impact'] as const).map((key) => <div key={key}><dt>{cpdiLabels[locale][key]}</dt><dd>{webCopy[key]}</dd></div>)}
    </dl>

    <nav className={styles.conversationNavigation} aria-label={locale === 'zh' ? 'Web 启动路径' : 'Web launch path'} data-convo-start-navigation>
      <p>{locale === 'zh' ? 'Web 启动路径' : 'Web launch path'}</p>
      <div className={styles.conversationSteps}>
        {startConversationWebIds.map((id, index) => {
          const media = getConvoAiMedia(id);
          return <button key={id} type="button" aria-pressed={id === activeWebId} onClick={() => { setFailed((current) => ({ ...current, web: false })); setActiveWebId(id); }}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{media.copy[locale].title}</strong>
            <small>{formatDuration(media.duration)}</small>
          </button>;
        })}
      </div>
    </nav>
  </div>;
}

const voiceprintModes = {
  en: [
    { id: 'off', title: 'Off', copy: 'No voice restriction and no enrollment step. This keeps setup short when identity control is not required.' },
    { id: 'seamless', title: 'Seamless', copy: 'Speaker learning happens with less interruption, balancing continuity with a clearer participant boundary.' },
    { id: 'personalized', title: 'Personalized', copy: 'Explicit reading and recording create the strongest identity control, with a deliberate enrollment cost.' },
  ],
  zh: [
    { id: 'off', title: 'Off', copy: '关闭声纹限制，也不增加录入步骤，适合无需身份控制、需要快速进入的场景。' },
    { id: 'seamless', title: 'Seamless', copy: '在较少打断对话的前提下学习说话人，在连续体验与参与边界之间取得平衡。' },
    { id: 'personalized', title: 'Personalized', copy: '通过明确朗读与录音获得更强身份控制，同时接受更完整的录入成本。' },
  ],
} as const;

export function ConvoAiVoiceprintModes({ locale }: { readonly locale: Locale }) {
  const [activeMode, setActiveMode] = useState<(typeof voiceprintModes.en)[number]['id']>('seamless');
  return <div className={styles.voiceprintModes} data-convo-voiceprint-modes data-active-mode={activeMode}>
    {voiceprintModes[locale].map((mode, index) => {
      const active = mode.id === activeMode;
      return <article key={mode.id} data-active={active ? 'true' : 'false'}>
        <button type="button" aria-expanded={active} onClick={() => setActiveMode(mode.id)}>
          <span>{String(index + 1).padStart(2, '0')}</span><strong>{mode.title}</strong>
        </button>
        <p>{mode.copy}</p>
      </article>;
    })}
  </div>;
}

const inlineMedia = {
  orb: { src: '/images/convo-ai/posters/app-conversation-start.webp', alt: 'ConvoAI animated conversation orb' },
  avatar: { src: '/images/convo-ai/posters/app-avatar-interaction.webp', alt: 'ConvoAI digital human interaction' },
} as const;

export function ConvoAiInlineHeading({ kind, children }: { readonly kind: keyof typeof inlineMedia; readonly children: ReactNode }) {
  const media = inlineMedia[kind];
  return <h2 className={styles.inlineHeading} data-inline-product-heading={kind}>
    <span>{children}</span><span className={styles.inlineImage}><img src={media.src} alt={media.alt} /></span>
  </h2>;
}

export function ConvoAiStage({ locale, eyebrow, title, description, webId, appId, hero = false }: { readonly locale: Locale; readonly eyebrow: string; readonly title: string; readonly description: string; readonly webId: ConvoAiMediaId; readonly appId: ConvoAiMediaId; readonly hero?: boolean }) {
  const [activePlatform, setActivePlatform] = useState<'web' | 'app' | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const SemanticHeading = hero ? 'h1' : 'h3';
  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
    stageRef.current?.style.setProperty('--stage-x', `${Math.max(-4, Math.min(4, y))}deg`);
    stageRef.current?.style.setProperty('--stage-y', `${Math.max(-4, Math.min(4, x))}deg`);
  };
  const resetTilt = () => { stageRef.current?.style.setProperty('--stage-x', '0deg'); stageRef.current?.style.setProperty('--stage-y', '0deg'); };

  return <div ref={stageRef} className={styles.stage} data-convo-ai-stage data-active-platform={activePlatform ?? 'posters'} data-hero={hero ? 'true' : 'false'} onPointerMove={updateTilt} onPointerLeave={resetTilt}>
    <div className={styles.stageCopy}>
      <p>{eyebrow}</p>
      <span className={styles.stageDisplayTitle} data-stage-display-title aria-hidden="true">{title}</span>
      <SemanticHeading className={styles.stageSemanticTitle} data-stage-semantic-title>{title}</SemanticHeading>
      <div>{description}</div>
    </div>
    <div className={styles.terrain} aria-hidden="true"><i /><i /><i /></div>
    <div className={styles.webPlane} data-convo-web-plane><ConvoAiViewportVideo id={webId} locale={locale} /></div>
    <div className={styles.appDevice} data-convo-app-device><div><ConvoAiViewportVideo id={appId} locale={locale} /></div></div>
    <div className={styles.stageControls}><button type="button" onClick={() => setActivePlatform('web')}><Monitor aria-hidden="true" size={17} />{locale === 'zh' ? '聚焦 Web 录屏' : 'Focus Web recording'}</button><button type="button" onClick={() => setActivePlatform('app')}><Smartphone aria-hidden="true" size={17} />{locale === 'zh' ? '聚焦 App 录屏' : 'Focus App recording'}</button></div>
  </div>;
}

const avatarPairItems = [
  { id: 'app-avatar-select', index: '01' },
  { id: 'app-avatar-interaction', index: '02' },
] as const satisfies readonly { readonly id: ConvoAiMediaId; readonly index: string }[];

export function ConvoAiAvatarPair({ locale }: { readonly locale: Locale }) {
  return <div className={styles.avatarPair} data-convo-ai-avatar-pair>
    {avatarPairItems.map(({ id, index }) => {
      const media = getConvoAiMedia(id);
      const copy = media.copy[locale];
      const captionId = `convo-ai-avatar-${id}`;
      return <figure key={id} className={styles.avatarFigure} data-convo-ai-avatar={id}>
        <div className={styles.avatarPhone}>
          <ConvoAiViewportVideo id={id} locale={locale} describedBy={captionId} />
        </div>
        <figcaption id={captionId}><span>{index}</span><strong>{copy.title}</strong><p>{copy.description}</p></figcaption>
      </figure>;
    })}
  </div>;
}

export function ConvoAiAppShowcase({ locale }: { readonly locale: Locale }) {
  const [activeId, setActiveId] = useState<AppShowcaseId>('app-login');
  const isDesktop = useMediaQuery('(min-width: 801px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const videoRef = useRef<HTMLVideoElement>(null);
  const stepRefs = useRef(new Map<AppShowcaseId, HTMLElement>());
  const intersectingEntriesRef = useRef(new Map<Element, IntersectionObserverEntry>());
  const activeIdRef = useRef<AppShowcaseId>('app-login');
  const descriptionId = useId();
  const summaryId = useId();
  const activeMedia = getConvoAiMedia(activeId);

  const activate = useCallback((id: AppShowcaseId) => {
    if (activeIdRef.current === id) return;
    const currentVideo = videoRef.current;
    currentVideo?.pause();
    if (currentVideo) {
      try { currentVideo.currentTime = 0; } catch { /* Some streams cannot seek until metadata loads. */ }
    }
    activeIdRef.current = id;
    setActiveId(id);
  }, []);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) intersectingEntriesRef.current.set(entry.target, entry);
      else intersectingEntriesRef.current.delete(entry.target);
    });
    const intersectingEntries = Array.from(intersectingEntriesRef.current.values());
    const rootBounds = intersectingEntries.find((entry) => entry.rootBounds)?.rootBounds;
    const activationLine = rootBounds
      ? (rootBounds.top + rootBounds.bottom) / 2
      : window.innerHeight * 0.425;
    const candidate = intersectingEntries
      .sort((first, second) => (
        Math.abs(first.target.getBoundingClientRect().top - activationLine)
        - Math.abs(second.target.getBoundingClientRect().top - activationLine)
      ))[0];
    const id = candidate?.target.getAttribute('data-app-showcase-step') as AppShowcaseId | null;
    if (id) activate(id);
  }, [activate]);

  useEffect(() => {
    const intersectingEntries = intersectingEntriesRef.current;
    intersectingEntries.clear();
    if (!isDesktop || typeof IntersectionObserver === 'undefined') return;
    let observer: IntersectionObserver | undefined;
    const observeAtViewportHeight = () => {
      observer?.disconnect();
      intersectingEntries.clear();
      const viewportHeight = window.innerHeight;
      const rootMargin = `-${Math.round(viewportHeight * 0.42)}px 0px -${Math.round(viewportHeight * 0.57)}px 0px`;
      observer = new IntersectionObserver(observerCallback, { rootMargin, threshold: 0 });
      stepRefs.current.forEach((step) => observer?.observe(step));
    };
    observeAtViewportHeight();
    window.addEventListener('resize', observeAtViewportHeight);
    return () => {
      intersectingEntries.clear();
      window.removeEventListener('resize', observeAtViewportHeight);
      observer?.disconnect();
    };
  }, [isDesktop, observerCallback]);

  const registerStep = useCallback((id: AppShowcaseId, element: HTMLElement | null) => {
    if (element) stepRefs.current.set(id, element);
    else stepRefs.current.delete(id);
  }, []);

  const navigateToStep = useCallback((id: AppShowcaseId) => {
    activate(id);
    const step = stepRefs.current.get(id);
    if (isDesktop && step && typeof window.scrollTo === 'function') {
      const targetTop = window.scrollY + step.getBoundingClientRect().top - window.innerHeight * 0.425;
      window.scrollTo({
        behavior: reducedMotion ? 'auto' : 'smooth',
        top: Math.max(0, targetTop),
      });
    }
  }, [activate, isDesktop, reducedMotion]);

  const renderMediaCard = (placement: 'desktop' | 'mobile', includeVideo: boolean) => <figure className={styles.appShowcaseMedia} data-app-showcase-placement={placement} data-media-card={activeId}>
    <div className={styles.appShowcaseVideo}>
      {includeVideo
        ? <ConvoAiViewportVideo key={activeId} id={activeId} locale={locale} describedBy={`${descriptionId}-${placement}`} videoRef={videoRef} />
        : <img src={activeMedia.poster} alt="" />}
    </div>
    <figcaption id={`${descriptionId}-${placement}`} aria-live="polite">{activeMedia.copy[locale].title}</figcaption>
  </figure>;

  return <section className={styles.appShowcase} data-convo-app-showcase data-active-id={activeId}>
    <div className={styles.appShowcaseScenes} role="list" aria-label={locale === 'zh' ? 'App 产品场景' : 'App product scenes'}>
      {appShowcaseSteps.map((step) => {
        const isActive = step.id === activeId;
        const label = locale === 'zh' ? step.label : step.enLabel;
        const summary = locale === 'zh' ? step.summary : step.enSummary;
        const stepSummaryId = `${summaryId}-${step.id}`;
        return <article key={step.id} ref={(element) => registerStep(step.id, element)} className={styles.appShowcaseStep} role="listitem" data-app-showcase-step={step.id} data-active={isActive ? 'true' : 'false'}>
          <button type="button" aria-label={label} aria-pressed={isActive} aria-describedby={stepSummaryId} onClick={() => navigateToStep(step.id)}>
            <span>{step.index}</span><strong>{label}</strong>
          </button>
          <p id={stepSummaryId}>{summary}</p>
          {isActive ? <div className={styles.appShowcaseMobileMedia}>{renderMediaCard('mobile', !isDesktop)}</div> : null}
        </article>;
      })}
    </div>
    <div className={styles.appShowcaseSticky}>{renderMediaCard('desktop', isDesktop)}</div>
  </section>;
}
