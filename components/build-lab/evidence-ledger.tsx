import type { Locale } from '@/content/types';

import styles from './build-lab.module.css';

interface EvidenceLedgerProps {
  readonly locale: Locale;
}

const copy = {
  en: {
    label: 'Evidence ledger',
    revision: 'Repository revision',
    boundary: 'Prototype boundary',
    boundaryBody:
      'Interaction-valid static prototype only. Backend, SSO, RTC, STT streaming, full plugin workflow, and the complete mobile subtitle detail flow remain outside this artifact.',
    library: 'Component library',
    libraryBody:
      'The pinned source includes STT UI tokens and component styles referenced by the root document.',
    audit: 'Design audit',
    auditBody:
      'A machine-readable design-audit report is present in the pinned repository; this ledger records its existence, not a new audit result.',
    regression: 'Visual regression',
    regressionBody:
      'Approved root-demo baselines cover homepage, pre-start, session, access layer, and subtitle language states.',
  },
  zh: {
    label: '证据台账',
    revision: '仓库版本',
    boundary: '原型边界',
    boundaryBody:
      '仅为交互有效的静态原型。后端、SSO、RTC、STT 实时流、完整插件流程及移动端字幕详情完整流程均不属于此产物。',
    library: '组件库',
    libraryBody: '固定版本源码包含根文档实际引用的 STT UI token 与组件样式。',
    audit: '设计审计',
    auditBody:
      '固定版本仓库中存在机器可读的设计审计报告；此处只记录证据存在，不宣称新的审计结果。',
    regression: '视觉回归',
    regressionBody:
      '已批准的根原型基线覆盖首页、会前、会中、访问层和字幕语言状态。',
  },
} as const;

export function EvidenceLedger({ locale }: EvidenceLedgerProps) {
  const text = copy[locale];

  return (
    <div className={styles.ledger} aria-label={text.label}>
      <div className={styles.revisionRow}>
        <span>{text.revision}</span>
        <code>e5e840a</code>
      </div>
      <div className={styles.ledgerGrid}>
        <section>
          <h3>{text.boundary}</h3>
          <p>{text.boundaryBody}</p>
        </section>
        <section>
          <h3>{text.library}</h3>
          <p>{text.libraryBody}</p>
        </section>
        <section>
          <h3>{text.audit}</h3>
          <p>{text.auditBody}</p>
        </section>
        <section>
          <h3>{text.regression}</h3>
          <p>{text.regressionBody}</p>
        </section>
      </div>
    </div>
  );
}
