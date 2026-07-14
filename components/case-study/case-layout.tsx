import type { ReactNode } from 'react';

import type { ContentMeta } from '@/content/schema';
import type { Locale } from '@/content/types';

import { ChapterNav } from './chapter-nav';
import styles from './case-layout.module.css';
import './print.css';

interface CaseLayoutProps {
  readonly meta: ContentMeta;
  readonly locale: Locale;
  readonly children: ReactNode;
  readonly actions?: ReactNode;
  readonly previous?: CaseNeighbor;
  readonly next?: CaseNeighbor;
}

export interface CaseNeighbor {
  readonly href: string;
  readonly title: string;
}

const copy = {
  en: {
    projectFacts: 'Project facts',
    role: 'Role',
    duration: 'Duration',
    status: 'Status',
    evidence: 'Evidence',
    disclosure: 'Disclosure',
    previous: 'Previous project',
    next: 'Next project',
    projectNavigation: 'Project navigation',
  },
  zh: {
    projectFacts: '项目概况',
    role: '角色',
    duration: '周期',
    status: '状态',
    evidence: '证据',
    disclosure: '公开说明',
    previous: '上一个项目',
    next: '下一个项目',
    projectNavigation: '项目导航',
  },
} as const;

export function CaseLayout({
  meta,
  locale,
  children,
  actions,
  previous,
  next,
}: CaseLayoutProps) {
  const text = copy[locale];

  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={styles.hero}>
            <div className={styles.heroSignal}>
              {meta.caseLabel ? <span>{meta.caseLabel}</span> : null}
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
              {meta.facts?.map((fact) => (
                <div key={`${fact.label}:${fact.value}`}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
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
            {actions}
          </header>
          {children}
          {previous || next ? (
            <nav
              className={styles.projectNavigation}
              aria-label={text.projectNavigation}
            >
              {previous ? (
                <a href={previous.href} data-project-previous>
                  <span>{text.previous}</span>
                  <strong>{previous.title}</strong>
                </a>
              ) : null}
              {next ? (
                <a href={next.href} data-project-next>
                  <span>{text.next}</span>
                  <strong>{next.title}</strong>
                </a>
              ) : null}
            </nav>
          ) : null}
        </article>
      </div>
    </div>
  );
}
