'use client';
/* eslint-disable @next/next/no-img-element */

import { AlertCircle, Monitor, RotateCcw, Smartphone } from 'lucide-react';
import { type Ref, useId, useRef, useState } from 'react';

import type { Locale } from '@/content/types';
import { getConvoAiMedia, type ConvoAiMediaId } from './convo-ai-media-catalog';
import styles from './convo-ai-media.module.css';

function pauseOtherMedia(current: HTMLVideoElement) {
  document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')
    .forEach((video) => { if (video !== current) video.pause(); });
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${String(minutes).padStart(2, '0')}:${remaining}`;
}

export function CompleteConvoAiVideo({ id, locale, describedBy, autoPlay = false, loop = false, muted = false, videoRef }: { readonly id: ConvoAiMediaId; readonly locale: Locale; readonly describedBy?: string; readonly autoPlay?: boolean; readonly loop?: boolean; readonly muted?: boolean; readonly videoRef?: Ref<HTMLVideoElement> }) {
  const media = getConvoAiMedia(id);
  return <video ref={videoRef} data-convo-ai-video="true" src={media.src} poster={media.poster} controls playsInline preload="metadata" autoPlay={autoPlay} loop={loop} muted={muted} aria-label={media.copy[locale].title} aria-describedby={describedBy} onPlay={(event) => pauseOtherMedia(event.currentTarget)} onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }} />;
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
        <video key={active.id} ref={videoRef} data-convo-ai-video="true" src={active.src} poster={active.poster} controls playsInline preload="metadata" aria-label={copy.title} aria-describedby={descriptionId} onPlay={(event) => pauseOtherMedia(event.currentTarget)} onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }} onError={() => setFailed(true)} />
        {failed ? <div className={styles.mediaError} role="status" aria-live="polite"><AlertCircle aria-hidden="true" size={18} /><span>{locale === 'zh' ? '媒体暂时无法加载' : 'Media unavailable'}</span><button type="button" onClick={() => videoRef.current?.load()}><RotateCcw aria-hidden="true" size={16} />{locale === 'zh' ? '重新加载' : 'Reload'}</button></div> : null}
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
