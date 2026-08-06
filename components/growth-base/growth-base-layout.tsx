import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import styles from './growth-base-layout.module.css';

const copy = {
  zh: {
    eyebrow: 'PERSONAL CONCEPT / 微信小程序',
    role: '角色',
    status: '状态',
  },
  en: {
    eyebrow: 'PERSONAL CONCEPT / WECHAT MINI PROGRAM',
    role: 'Role',
    status: 'Status',
  },
} as const;

export function GrowthBaseLayout({ meta, locale, children }: ContentLayoutProps) {
  const text = copy[locale];

  return (
    <div
      className={styles.root}
      data-growth-base-case
      data-layout="editorial-full-width"
    >
      <article className={styles.case} data-case-study>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{text.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p className={styles.proposition}>{meta.proposition}</p>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>{text.role}</dt>
              <dd>{meta.role}</dd>
            </div>
            <div>
              <dt>{text.status}</dt>
              <dd>{meta.status}</dd>
            </div>
          </dl>
        </header>
        <div className={styles.content}>{children}</div>
      </article>
    </div>
  );
}
