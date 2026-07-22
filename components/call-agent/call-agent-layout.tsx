import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';
import { withBasePath } from '@/lib/i18n/locales';

import { CallAgentHeroSequence } from './call-agent-hero-sequence';
import styles from './call-agent-layout.module.css';
import { CallAgentMotion } from './call-agent-motion';
import './call-agent-print.css';

const copy = {
  zh: { eyebrow: '声网 · CALL AGENT', audience: '为企业呼叫运营人员打造', facts: '项目概况', role: '角色', duration: '周期', status: '状态', previous: '上一个项目', next: '下一个项目', navigation: '项目导航' },
  en: { eyebrow: 'AGORA · CALL AGENT', audience: 'Built for enterprise call operators', facts: 'Project facts', role: 'Role', duration: 'Duration', status: 'Status', previous: 'Previous project', next: 'Next project', navigation: 'Project navigation' },
} as const;

export function CallAgentLayout({ meta, locale, children, actions, previous, next }: ContentLayoutProps) {
  const text = copy[locale];
  return (
    <CallAgentMotion>
      <main className={styles.root} data-call-agent-case>
        <div className={styles.frame}>
          <aside className={styles.rail}><ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" surface="light" /></aside>
          <article className={styles.case} data-case-study>
            <header className={styles.hero} data-call-agent-hero>
              <div className={styles.heroCopy} data-hero-copy>
                <p className={styles.eyebrow}>{text.eyebrow}</p>
                <p className={styles.audience}>{text.audience}</p>
                <h1>{meta.title}</h1>
                <p className={styles.proposition}>{meta.proposition}</p>
                <dl className={styles.facts} aria-label={text.facts}>
                  <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
                  <div><dt>{text.duration}</dt><dd>{meta.duration}</dd></div>
                  <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
                </dl>
                {actions}
              </div>
              <div className={styles.heroMedia}>
                <CallAgentHeroSequence locale={locale} />
              </div>
            </header>
            {children}
            {previous || next ? (
              <nav className={styles.projectNavigation} aria-label={text.navigation}>
                {previous ? <a href={withBasePath(previous.href)} data-project-previous><span>{text.previous}</span><strong>{previous.title}</strong></a> : <span />}
                {next ? <a href={withBasePath(next.href)} data-project-next><span>{text.next}</span><strong>{next.title}</strong></a> : null}
              </nav>
            ) : null}
          </article>
        </div>
      </main>
    </CallAgentMotion>
  );
}
