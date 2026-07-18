'use client';

import { ExternalLink } from 'lucide-react';

import type { Locale } from '@/content/types';

import styles from './meeting-evidence.module.css';

interface MeetingVideoProps {
  readonly src: string;
  readonly poster: string;
  readonly captions: string;
  readonly title: string;
  readonly description: string;
  readonly fallback: { readonly src: string; readonly alt: string };
  readonly locale: Locale;
}

const breakoutEvidence = {
  en: {
    label: 'Decision artifact',
    title: 'Breakout Room decision evidence',
    intro: 'The working artifact turns a broad capability request into rules that engineering and QA can evaluate.',
    rules: [
      ['Capacity', 'Up to 50 groups'],
      ['Naming', 'Group names are limited to 24 characters'],
      ['Feedback', 'Disabled states and hover feedback are specified'],
      ['Deletion', 'An empty group deletes immediately; an occupied group requires a member-destination confirmation'],
    ],
    note: 'Designer-reported use: alignment with product, engineering, and QA. The artifact itself verifies the documented rules and edge states.',
    link: 'Open decision artifact in Figma',
  },
  zh: {
    label: '决策证据',
    title: '分组讨论决策证据',
    intro: '这份工作稿把宽泛的能力需求转化为工程与测试可以核对的具体规则。',
    rules: [
      ['容量', '最多创建 50 个小组'],
      ['命名', '小组名称最多 24 个字符'],
      ['反馈', '明确禁用状态与悬停反馈'],
      ['删除', '空小组直接删除；有成员的小组需先确认成员去向'],
    ],
    note: '设计师陈述：该稿用于与产品、工程和测试对齐。稿件本身可以证明其中记录的规则与边界状态。',
    link: '在 Figma 中打开决策稿',
  },
} as const;

const breakoutArtifactUrl =
  'https://www.figma.com/design/LbagoAHs57vyPH7z0mZH1w/Untitled?node-id=1-15037';

export function MeetingVideo({
  src,
  poster,
  captions,
  title,
  description,
  fallback,
  locale,
}: MeetingVideoProps) {
  const descriptionId = `meeting-video-${src.replace(/[^a-z0-9]/gi, '-')}`;

  return (
    <figure className={styles.root} data-meeting-video>
      <div className={styles.frame}>
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          aria-label={title}
          aria-describedby={descriptionId}
        >
          <track
            kind="captions"
            src={captions}
            srcLang={locale === 'zh' ? 'zh-CN' : 'en'}
            label={locale === 'zh' ? '中文字幕' : 'English captions'}
            default
          />
        </video>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.fallback}
          src={fallback.src}
          alt={fallback.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption id={descriptionId}>{description}</figcaption>
    </figure>
  );
}

export function BreakoutDecisionEvidence({ locale }: { readonly locale: Locale }) {
  const text = breakoutEvidence[locale];

  return (
    <aside className={styles.decisionEvidence} aria-labelledby={`breakout-evidence-${locale}`}>
      <div className={styles.decisionHeader}>
        <div>
          <span>{text.label}</span>
          <h3 id={`breakout-evidence-${locale}`}>{text.title}</h3>
          <p>{text.intro}</p>
        </div>
        <a href={breakoutArtifactUrl} target="_blank" rel="noreferrer">
          {text.link}
          <ExternalLink aria-hidden="true" size={16} />
        </a>
      </div>
      <dl className={styles.decisionRules}>
        {text.rules.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.decisionNote}>{text.note}</p>
    </aside>
  );
}
