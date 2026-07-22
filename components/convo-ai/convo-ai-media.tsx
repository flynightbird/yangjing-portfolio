'use client';
/* eslint-disable @next/next/no-img-element */

import { AlertCircle, Monitor, RotateCcw, Smartphone } from 'lucide-react';
import { type Ref, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import type { Locale } from '@/content/types';
import { getConvoAiMedia, type ConvoAiMediaId } from './convo-ai-media-catalog';
import styles from './convo-ai-media.module.css';

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

function useAutoplayAllowed() {
  const query = '(prefers-reduced-motion: reduce)';
  const subscribe = useCallback((onChange: () => void) => subscribeToMediaQuery(query, onChange), []);
  const getSnapshot = useCallback(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && !window.matchMedia(query).matches, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function pauseOtherMedia(current: HTMLVideoElement) {
  document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')
    .forEach((video) => { if (video !== current) video.pause(); });
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${String(minutes).padStart(2, '0')}:${remaining}`;
}

export function CompleteConvoAiVideo({ id, locale, describedBy, autoPlay = false, loop = false, muted = false, exclusive = true, videoRef }: { readonly id: ConvoAiMediaId; readonly locale: Locale; readonly describedBy?: string; readonly autoPlay?: boolean; readonly loop?: boolean; readonly muted?: boolean; readonly exclusive?: boolean; readonly videoRef?: Ref<HTMLVideoElement> }) {
  const media = getConvoAiMedia(id);
  return <video ref={videoRef} data-convo-ai-video="true" src={media.src} poster={media.poster} controls playsInline preload="metadata" autoPlay={autoPlay} loop={loop} muted={muted} aria-label={media.copy[locale].title} aria-describedby={describedBy} onPlay={(event) => { if (exclusive) pauseOtherMedia(event.currentTarget); }} onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }} />;
}

const cpdiLabels: Record<Locale, Record<'context' | 'problem' | 'decision' | 'impact', string>> = {
  en: { context: 'Context', problem: 'Problem', decision: 'Decision', impact: 'Impact' },
  zh: { context: '场景', problem: '问题', decision: '设计', impact: '作用' },
};

export function ConvoAiPlaylist({ ids, locale }: { readonly ids: readonly ConvoAiMediaId[]; readonly locale: Locale }) {
  const [activeId, setActiveId] = useState(ids[0]);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const descriptionId = useId();
  const active = getConvoAiMedia(activeId);
  const copy = active.copy[locale];

  return <div className={styles.playlist} data-convo-ai-playlist>
    <div className={styles.queue} aria-label={locale === 'zh' ? '完整录屏列表' : 'Complete recording list'}>
      {ids.map((id, index) => { const media = getConvoAiMedia(id); return <button key={id} type="button" aria-pressed={id === activeId} onClick={() => { videoRef.current?.pause(); setFailed(false); setActiveId(id); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{media.copy[locale].title}</strong><small>{formatDuration(media.duration)}</small></button>; })}
    </div>
    <figure className={styles.evidence} data-platform={active.platform}>
      <div className={styles.videoFrame} style={{ aspectRatio: `${active.width} / ${active.height}` }}>
        <video key={active.id} ref={videoRef} data-convo-ai-video="true" src={active.src} poster={active.poster} controls playsInline preload="metadata" aria-label={copy.title} aria-describedby={descriptionId} onPlay={(event) => pauseOtherMedia(event.currentTarget)} onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }} onError={() => setFailed(true)} onLoadedData={() => setFailed(false)} />
        {failed ? <div className={styles.mediaError} role="status" aria-live="polite"><AlertCircle aria-hidden="true" size={18} /><span>{locale === 'zh' ? '媒体暂时无法加载' : 'Media unavailable'}</span><button type="button" onClick={() => { setFailed(false); videoRef.current?.load(); }}><RotateCcw aria-hidden="true" size={16} />{locale === 'zh' ? '重新加载' : 'Reload'}</button></div> : null}
      </div>
      <figcaption id={descriptionId}><span>{active.platform.toUpperCase()} / {formatDuration(active.duration)}</span><p>{copy.description}</p></figcaption>
    </figure>
    <dl className={styles.cpdi}>{(['context', 'problem', 'decision', 'impact'] as const).map((key) => <div key={key}><dt>{cpdiLabels[locale][key]}</dt><dd>{copy[key]}</dd></div>)}</dl>
  </div>;
}

export function ConvoAiStage({ locale, eyebrow, title, description, webId, appId, hero = false }: { readonly locale: Locale; readonly eyebrow: string; readonly title: string; readonly description: string; readonly webId: ConvoAiMediaId; readonly appId: ConvoAiMediaId; readonly hero?: boolean }) {
  const [activePlatform, setActivePlatform] = useState<'web' | 'app' | null>(null);
  const web = getConvoAiMedia(webId);
  const app = getConvoAiMedia(appId);
  const stageRef = useRef<HTMLDivElement>(null);
  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
    stageRef.current?.style.setProperty('--stage-x', `${Math.max(-4, Math.min(4, y))}deg`);
    stageRef.current?.style.setProperty('--stage-y', `${Math.max(-4, Math.min(4, x))}deg`);
  };
  const resetTilt = () => { stageRef.current?.style.setProperty('--stage-x', '0deg'); stageRef.current?.style.setProperty('--stage-y', '0deg'); };

  return <div ref={stageRef} className={styles.stage} data-convo-ai-stage data-active-platform={activePlatform ?? 'posters'} data-hero={hero ? 'true' : 'false'} onPointerMove={updateTilt} onPointerLeave={resetTilt}>
    <div className={styles.stageCopy}><p>{eyebrow}</p><h1>{title}</h1><div>{description}</div></div>
    <div className={styles.terrain} aria-hidden="true"><i /><i /><i /></div>
    <div className={styles.webPlane} data-convo-web-plane>{activePlatform === 'web' ? <CompleteConvoAiVideo id={webId} locale={locale} /> : <img src={web.poster} alt="" />}</div>
    <div className={styles.appDevice} data-convo-app-device><div>{activePlatform === 'app' ? <CompleteConvoAiVideo id={appId} locale={locale} /> : <img src={app.poster} alt="" />}</div></div>
    <div className={styles.stageControls}><button type="button" onClick={() => setActivePlatform('web')}><Monitor aria-hidden="true" size={17} />{locale === 'zh' ? '聚焦 Web 录屏' : 'Focus Web recording'}</button><button type="button" onClick={() => setActivePlatform('app')}><Smartphone aria-hidden="true" size={17} />{locale === 'zh' ? '聚焦 App 录屏' : 'Focus App recording'}</button></div>
  </div>;
}

const avatarPairItems = [
  { id: 'app-avatar-select', index: '01' },
  { id: 'app-avatar-interaction', index: '02' },
] as const satisfies readonly { readonly id: ConvoAiMediaId; readonly index: string }[];

export function ConvoAiAvatarPair({ locale }: { readonly locale: Locale }) {
  const autoplayAllowed = useAutoplayAllowed();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (!autoplayAllowed) {
      videoRefs.current.forEach((video) => video?.pause());
      return;
    }
    videoRefs.current.forEach((video) => {
      const playback = video?.play();
      void playback?.catch(() => undefined);
    });
  }, [autoplayAllowed]);

  return <div className={styles.avatarPair} data-convo-ai-avatar-pair>
    {avatarPairItems.map(({ id, index }, position) => {
      const media = getConvoAiMedia(id);
      const copy = media.copy[locale];
      const captionId = `convo-ai-avatar-${id}`;
      return <figure key={id} className={styles.avatarFigure} data-convo-ai-avatar={id}>
        <div className={styles.avatarPhone}>
          <CompleteConvoAiVideo id={id} locale={locale} describedBy={captionId} autoPlay={autoplayAllowed} loop muted exclusive={false} videoRef={(element) => { videoRefs.current[position] = element; }} />
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
  const autoplayAllowed = useAutoplayAllowed();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stepRefs = useRef(new Map<AppShowcaseId, HTMLElement>());
  const observerAvailable = useRef(false);
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

  useEffect(() => {
    if (!autoplayAllowed) return;
    const playback = videoRef.current?.play();
    void playback?.catch(() => undefined);
  }, [activeId, autoplayAllowed]);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const candidate = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => Math.abs(first.boundingClientRect.top) - Math.abs(second.boundingClientRect.top))[0];
    const id = candidate?.target.getAttribute('data-app-showcase-step') as AppShowcaseId | null;
    if (id) activate(id);
  }, [activate]);

  useEffect(() => {
    observerAvailable.current = false;
    if (!isDesktop || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(observerCallback, { rootMargin: '-42% 0px -57% 0px', threshold: 0 });
    observerAvailable.current = true;
    stepRefs.current.forEach((step) => observer.observe(step));
    return () => {
      observerAvailable.current = false;
      observer.disconnect();
    };
  }, [isDesktop, observerCallback]);

  const registerStep = useCallback((id: AppShowcaseId, element: HTMLElement | null) => {
    if (element) stepRefs.current.set(id, element);
    else stepRefs.current.delete(id);
  }, []);

  const navigateToStep = useCallback((id: AppShowcaseId) => {
    const step = stepRefs.current.get(id);
    if (typeof step?.scrollIntoView === 'function') {
      step.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    if (!isDesktop || !observerAvailable.current) activate(id);
  }, [activate, isDesktop, reducedMotion]);

  const renderMediaCard = (placement: 'desktop' | 'mobile', includeVideo: boolean) => <figure className={styles.appShowcaseMedia} data-app-showcase-placement={placement} data-media-card={activeId}>
    <div className={styles.appShowcaseVideo}>
      {includeVideo
        ? <CompleteConvoAiVideo key={activeId} id={activeId} locale={locale} describedBy={`${descriptionId}-${placement}`} autoPlay={autoplayAllowed} loop muted videoRef={videoRef} />
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
