'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/content/types';

import { CallAgentBrowserImage, CallAgentBrowserVideo } from './call-agent-browser-video';
import { resolveCallAgentMotionMode, type CallAgentMotionMode } from './call-agent-motion-mode';
import styles from './call-agent-system-stage.module.css';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface StageItem {
  readonly id: 'create' | 'orchestrate' | 'preview' | 'publish' | 'connect' | 'operate';
  readonly title: string;
  readonly summary: string;
  readonly media: { readonly kind: 'video' | 'image'; readonly src: string; readonly poster?: string; readonly playbackRate?: number; readonly alt: string };
}

const copy: Record<Locale, readonly StageItem[]> = {
  zh: [
    { id: 'create', title: '创建', summary: '从空白或客服模板开始，用有意义的默认值降低冷启动负担。', media: { kind: 'video', src: '/videos/call-agent/agent-create.mp4', poster: '/images/call-agent/agent-create-poster.webp', playbackRate: 1.45, alt: '创建智能体并应用预设项' } },
    { id: 'orchestrate', title: '编排', summary: '将基础、模型与声音、呼叫调优和高级设置分层组织。', media: { kind: 'video', src: '/videos/call-agent/agent-orchestrate.mp4', poster: '/images/call-agent/agent-orchestrate-poster.webp', playbackRate: 1.25, alt: '切换智能体编排层级' } },
    { id: 'preview', title: '预览', summary: '让配置与真实运行状态并置，在发布前观察 AI 行为。', media: { kind: 'video', src: '/videos/call-agent/agent-preview.mp4', poster: '/images/call-agent/agent-preview-poster.webp', playbackRate: 1.25, alt: '配置旁的实时 Preview' } },
    { id: 'publish', title: '发布', summary: '区分未发布草稿和已发布版本，并保留恢复入口。', media: { kind: 'video', src: '/videos/call-agent/agent-publish.mp4', poster: '/images/call-agent/agent-publish-poster.webp', playbackRate: 1.35, alt: '草稿、发布历史与版本恢复' } },
    { id: 'connect', title: '内呼连接', summary: '将已发布智能体与号码、录音、转写和挂断策略绑定。', media: { kind: 'video', src: '/videos/call-agent/agent-connect.mp4', poster: '/images/call-agent/agent-connect-poster.webp', playbackRate: 1.35, alt: '从号码列表绑定入呼智能体与通话策略' } },
    { id: 'operate', title: '外呼运营', summary: '把号码、智能体、客户文件、时间与呼叫规则组装为外呼任务。', media: { kind: 'video', src: '/videos/call-agent/agent-operate.mp4', poster: '/images/call-agent/agent-operate-poster.webp', playbackRate: 1.35, alt: '创建外呼任务并设置基础信息' } },
  ],
  en: [
    { id: 'create', title: 'Create', summary: 'Start blank or from a service template, with meaningful defaults that reduce cold-start ambiguity.', media: { kind: 'video', src: '/videos/call-agent/agent-create.mp4', poster: '/images/call-agent/agent-create-poster.webp', playbackRate: 1.45, alt: 'Create an agent with preset defaults' } },
    { id: 'orchestrate', title: 'Orchestrate', summary: 'Layer basic, model and voice, call tuning, and advanced settings.', media: { kind: 'video', src: '/videos/call-agent/agent-orchestrate.mp4', poster: '/images/call-agent/agent-orchestrate-poster.webp', playbackRate: 1.25, alt: 'Move through agent orchestration layers' } },
    { id: 'preview', title: 'Preview', summary: 'Keep configuration beside runtime feedback so AI behavior is observable before release.', media: { kind: 'video', src: '/videos/call-agent/agent-preview.mp4', poster: '/images/call-agent/agent-preview-poster.webp', playbackRate: 1.25, alt: 'Live Preview beside configuration' } },
    { id: 'publish', title: 'Publish', summary: 'Separate unpublished drafts from released versions and preserve recovery.', media: { kind: 'video', src: '/videos/call-agent/agent-publish.mp4', poster: '/images/call-agent/agent-publish-poster.webp', playbackRate: 1.35, alt: 'Draft and published version history' } },
    { id: 'connect', title: 'Inbound connection', summary: 'Bind a released agent to a number, recording, transcription, and call controls.', media: { kind: 'video', src: '/videos/call-agent/agent-connect.mp4', poster: '/images/call-agent/agent-connect-poster.webp', playbackRate: 1.35, alt: 'Bind an inbound agent and call controls from the number list' } },
    { id: 'operate', title: 'Outbound operations', summary: 'Assemble number, agent, audience, schedule, and rules into an outbound task.', media: { kind: 'video', src: '/videos/call-agent/agent-operate.mp4', poster: '/images/call-agent/agent-operate-poster.webp', playbackRate: 1.35, alt: 'Create an outbound task and enter its basic settings' } },
  ],
};

function StageMedia({ item, active }: { readonly item: StageItem; readonly active: boolean }) {
  return item.media.kind === 'video' ? (
    <CallAgentBrowserVideo src={item.media.src} poster={item.media.poster!} playbackRate={item.media.playbackRate!} title={item.title} description={item.media.alt} active={active} />
  ) : (
    <CallAgentBrowserImage src={item.media.src} title={item.title} description={item.media.alt} />
  );
}

export function CallAgentSystemStage({ locale }: { readonly locale: Locale }) {
  const items = copy[locale];
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<CallAgentMotionMode>('static');

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMode(resolveCallAgentMotionMode({ width: window.innerWidth, reducedMotion: media.matches }));
    update();
    media.addEventListener?.('change', update);
    window.addEventListener('resize', update);
    return () => { media.removeEventListener?.('change', update); window.removeEventListener('resize', update); };
  }, []);

  useGSAP(() => {
    if (mode !== 'cinematic' || !rootRef.current) return;
    const triggers = items.map((item, index) => ScrollTrigger.create({
      trigger: `[data-stage-id="${item.id}"]`,
      start: 'top 52%',
      end: 'bottom 48%',
      onEnter: () => setActiveIndex(index),
      onEnterBack: () => setActiveIndex(index),
    }));
    return () => triggers.forEach((trigger) => trigger.kill());
  }, { scope: rootRef, dependencies: [mode] });

  return (
    <div ref={rootRef} className={styles.root} data-system-mode={mode}>
      <div className={styles.desktopStage}>
        <ol className={styles.steps}>
          {items.map((item, index) => (
            <li key={item.id} data-stage-id={item.id} data-active={index === activeIndex}>
              <button type="button" onClick={() => setActiveIndex(index)} aria-pressed={index === activeIndex}>
                <span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><p>{item.summary}</p>
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.mediaStage} data-call-agent-media-stage>
          {items.map((item, index) => (
            <div key={item.id} className={styles.mediaLayer} data-active={index === activeIndex} aria-hidden={index !== activeIndex}>
              <StageMedia item={item} active={index === activeIndex} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.staticSequence}>
        {items.map((item, index) => (
          <article key={item.id} data-static-stage data-stage-id={item.id}>
            <span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.summary}</p><StageMedia item={item} active={false} />
          </article>
        ))}
      </div>
    </div>
  );
}
