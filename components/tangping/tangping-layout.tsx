import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import styles from './tangping-layout.module.css';

const copy = {
  en: {
    coverAlt: 'Tangping Designer project cover',
    projectType: 'APP & Main website',
  },
  zh: {
    coverAlt: '躺平设计家项目封面',
    projectType: 'APP & 官网主站',
  },
} as const;

export function TangpingLayout({ children, locale, meta }: ContentLayoutProps) {
  const text = copy[locale];

  return (
    <main className={styles.root} data-tangping-case>
      <header className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.heroImage}
          src={meta.heroMedia}
          width="2880"
          height="1620"
          alt={text.coverAlt}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroMeta}>Alibaba / 2019–2020.12</p>
          <h1>{meta.title}</h1>
          <p className={styles.heroType}>{text.projectType}</p>
        </div>
      </header>
      {children}
    </main>
  );
}
