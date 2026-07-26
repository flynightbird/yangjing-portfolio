'use client';

import { useState } from 'react';

import type { Locale } from '@/content/types';

import { CallAgentBrowserVideo } from './call-agent-browser-video';
import styles from './call-agent-hero-sequence.module.css';

const clips = {
  zh: [
    { id: 'create', src: '/videos/call-agent/agent-create.mp4', poster: '/images/call-agent/agent-create-poster.webp', playbackRate: 1.45, title: '创建智能体', description: '从模板和默认项开始建立智能体。' },
    { id: 'preview', src: '/videos/call-agent/agent-preview.mp4', poster: '/images/call-agent/agent-preview-poster.webp', playbackRate: 1.25, title: '验证 AI 行为', description: '在配置旁完整观察连接、通话控制和智能体输出。' },
    { id: 'operate', src: '/videos/call-agent/agent-operate.mp4', poster: '/images/call-agent/agent-operate-poster.webp', playbackRate: 1.35, title: '进入外呼运营', description: '把智能体、号码和执行规则组装为外呼任务。' },
  ],
  en: [
    { id: 'create', src: '/videos/call-agent/agent-create.mp4', poster: '/images/call-agent/agent-create-poster.webp', playbackRate: 1.45, title: 'Create an agent', description: 'Begin with a template and meaningful defaults.' },
    { id: 'preview', src: '/videos/call-agent/agent-preview.mp4', poster: '/images/call-agent/agent-preview-poster.webp', playbackRate: 1.25, title: 'Validate AI behavior', description: 'Observe connection, call controls, and agent output beside configuration.' },
    { id: 'operate', src: '/videos/call-agent/agent-operate.mp4', poster: '/images/call-agent/agent-operate-poster.webp', playbackRate: 1.35, title: 'Move into outbound operations', description: 'Assemble the agent, number, and execution rules into an outbound task.' },
  ],
} as const;

export function CallAgentHeroSequence({ locale }: { readonly locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = clips[locale];

  return (
    <div className={styles.root} data-call-agent-hero-sequence>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={styles.clip}
          data-hero-clip={item.id}
          data-active={index === activeIndex}
          aria-hidden={index !== activeIndex}
        >
          <CallAgentBrowserVideo
            src={item.src}
            poster={item.poster}
            playbackRate={item.playbackRate}
            title={item.title}
            description={item.description}
            active={index === activeIndex}
            priority={index === 0}
            loop={false}
            onEnded={() => setActiveIndex((index + 1) % items.length)}
          />
        </div>
      ))}
    </div>
  );
}
