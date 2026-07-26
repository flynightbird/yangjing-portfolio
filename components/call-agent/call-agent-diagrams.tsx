import type { Locale } from '@/content/types';

import styles from './call-agent-diagrams.module.css';

const copy = {
  zh: {
    convo: ['CONVO AI', '用户端对话体验', '最终用户与 AI 交互'],
    runtime: ['CONVERSATION RUNTIME', '对话能力', '模型 · 声音 · 实时通信'],
    call: ['CALL AGENT', '企业配置与运营产品', '客户创建、验证、发布与运营'],
    statement: '把分散的对话式 AI 能力，组织成企业客户可自主运营的完整产品。',
    boundary: ['产品边界', '不是 Convo AI 的配置页，而是服务企业客户的独立工作台。'],
    decisions: [['有意义的默认值', '先给出可继续的起点'], ['渐进式控制', '专业能力保留，复杂度分层出现'], ['可观测、可恢复', '预览行为，控制发布状态']],
  },
  en: {
    convo: ['CONVO AI', 'End-user conversation experience', 'People interact directly with AI'],
    runtime: ['CONVERSATION RUNTIME', 'Conversational capability', 'Model · voice · realtime communication'],
    call: ['CALL AGENT', 'Enterprise configuration and operations', 'Customers create, validate, publish, and operate'],
    statement: 'Turn fragmented conversational-AI capabilities into a complete product enterprise customers can operate themselves.',
    boundary: ['Product boundary', 'Not a settings page for Convo AI, but an independent workspace for enterprise customers.'],
    decisions: [['Meaningful defaults', 'Provide a concrete starting point'], ['Progressive control', 'Preserve expert control while layering complexity'], ['Observable and reversible', 'Preview behavior and control release state']],
  },
} as const;

export function ProductBoundaryDiagram({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return <div className={styles.boundary} data-product-boundary-diagram aria-label={locale === 'zh' ? '产品边界图' : 'Product boundary diagram'}>
    {[text.convo, text.runtime, text.call].map(([label, title, body], index) => <div key={label} data-core={index === 1}><span>{label}</span><strong>{title}</strong><p>{body}</p></div>)}
  </div>;
}

export function ProductizationGrid({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return <div className={styles.grid} data-productization-grid>
    <p className={styles.statement}>{text.statement.split(locale === 'zh' ? '' : ' ').map((word, index) => <span key={`${word}-${index}`} data-productization-word>{word}{locale === 'en' ? ' ' : ''}</span>)}</p>
    <div className={styles.boundaryCell}><span>{text.boundary[0]}</span><p>{text.boundary[1]}</p></div>
    {text.decisions.map(([title, body], index) => <div className={styles.decision} key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{body}</p></div>)}
  </div>;
}
