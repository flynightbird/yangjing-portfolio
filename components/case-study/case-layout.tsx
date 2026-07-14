import type { ReactNode } from 'react';

import type { ContentMeta } from '@/content/schema';
import type { Locale } from '@/content/types';

import { CaseActions } from './case-actions';
import { ChapterNav } from './chapter-nav';
import styles from './case-layout.module.css';
import './print.css';

interface CaseLayoutProps {
  readonly meta: ContentMeta;
  readonly locale: Locale;
  readonly children: ReactNode;
}

const copy = {
  en: {
    projectFacts: 'Project facts',
    role: 'Role',
    duration: 'Duration',
    iterations: 'Iterations',
    iterationValue: 'Approximately 8 iterations',
    status: 'Status',
    evidence: 'Evidence',
    disclosure: 'Disclosure',
    previous: 'Previous project',
    next: 'Next project',
    bytedance: 'ByteDance consumer product work',
    meeting: 'Meeting real-time collaboration',
  },
  zh: {
    projectFacts: '项目概况',
    role: '角色',
    duration: '周期',
    iterations: '迭代',
    iterationValue: '约 8 次迭代',
    status: '状态',
    evidence: '证据',
    disclosure: '公开说明',
    previous: '上一个项目',
    next: '下一个项目',
    bytedance: '字节跳动 C 端产品经历',
    meeting: 'Meeting 实时协作',
  },
} as const;

export function CaseLayout({ meta, locale, children }: CaseLayoutProps) {
  const text = copy[locale];
  const localeRoot = `/${locale}`;

  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={styles.hero}>
            <div className={styles.heroSignal}>
              <span>CALL AGENT / 0→1 AI PRODUCT</span>
              <span>{meta.status}</span>
            </div>
            <h1>{meta.title}</h1>
            <p className={styles.proposition}>{meta.proposition}</p>
            <dl className={styles.facts} aria-label={text.projectFacts}>
              <div>
                <dt>{text.role}</dt>
                <dd>{meta.role}</dd>
              </div>
              <div>
                <dt>{text.duration}</dt>
                <dd>{meta.duration}</dd>
              </div>
              <div>
                <dt>{text.iterations}</dt>
                <dd>{text.iterationValue}</dd>
              </div>
              <div>
                <dt>{text.status}</dt>
                <dd>{meta.status}</dd>
              </div>
              <div>
                <dt>{text.evidence}</dt>
                <dd>{meta.evidenceLevel}</dd>
              </div>
            </dl>
            <div className={styles.disclosure}>
              <span>{text.disclosure}</span>
              <p>{meta.disclosure}</p>
            </div>
            <CaseActions locale={locale} />
          </header>
          {children}
          <nav className={styles.projectNavigation} aria-label={text.projectFacts}>
            <a
              href={`${localeRoot}/work/bytedance/`}
              data-project-previous
            >
              <span>{text.previous}</span>
              <strong>{text.bytedance}</strong>
            </a>
            <a href={`${localeRoot}/work/meeting/`} data-project-next>
              <span>{text.next}</span>
              <strong>{text.meeting}</strong>
            </a>
          </nav>
        </article>
      </div>
    </div>
  );
}
