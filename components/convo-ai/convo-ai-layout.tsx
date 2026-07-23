import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import { ConvoAiStage } from './convo-ai-media';
import { ConvoAiMotion } from './convo-ai-motion';
import { ConvoAiToneController } from './convo-ai-tone-controller';
import styles from './convo-ai-layout.module.css';
import './convo-ai-print.css';

export function ConvoAiLayout({ meta, locale, children }: ContentLayoutProps) {
  const text = locale === 'zh'
    ? { facts: '项目概况', role: '角色', scope: '终端', product: '产品', status: '状态', hint: '实时 AI 不是一个普通聊天页。' }
    : { facts: 'Project facts', role: 'Role', scope: 'Scope', product: 'Product', status: 'Status', hint: 'Real-time AI is not a normal chat page.' };

  return <ConvoAiMotion><div className={styles.root} data-convo-ai-case>
    <ConvoAiToneController />
    <div className={styles.frame}>
      <aside className={styles.rail}><ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" surface="dark" /></aside>
      <article className={styles.case} data-case-study>
        <header className={styles.hero} data-convo-nav-tone="dark">
          <ConvoAiStage locale={locale} eyebrow="AGORA / SHIPPED PRODUCT / APP + WEB" title="ConvoAI" description={meta.proposition} webId="web-join-exit" appId="app-conversation-start" hero />
          <dl className={styles.facts} aria-label={text.facts}>
            <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
            <div><dt>{text.scope}</dt><dd>App + Web</dd></div>
            <div><dt>{text.product}</dt><dd>{locale === 'zh' ? '1 对 1 实时 AI 对话' : '1:1 real-time AI conversation'}</dd></div>
            <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
          </dl>
          <div className={styles.nextHint} data-convo-next-section-hint>{text.hint}</div>
        </header>
        <div className={styles.content}>{children}</div>
      </article>
    </div>
  </div></ConvoAiMotion>;
}
