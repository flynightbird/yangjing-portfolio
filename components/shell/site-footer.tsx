import type { Locale } from '@/content/types';

import { FooterContacts } from './footer-contacts';
import styles from './site-footer.module.css';

interface SiteFooterProps {
  readonly locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = locale === 'zh'
    ? {
        eyebrow: '保持联系',
        title: '聊聊产品、AI，或一个还没被讲清的问题。',
      }
    : {
        eyebrow: 'Stay in touch',
        title: "Let's talk about products, AI, or a problem that still needs clarity.",
      };

  return (
    <footer className={styles.root} data-site-footer>
      <div className={styles.surface} data-footer-surface>
        <div
          className={`${styles.liquidRibbon} ${styles.ribbonOne}`}
          aria-hidden="true"
          data-footer-liquid="ribbon-one"
        />
        <div
          className={`${styles.liquidRibbon} ${styles.ribbonTwo}`}
          aria-hidden="true"
          data-footer-liquid="ribbon-two"
        />
        <div
          className={styles.liquidSheen}
          aria-hidden="true"
          data-footer-liquid="sheen"
        />
        <div className={styles.inner}>
          <div className={styles.cta} data-footer-cta>
            <p>{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <FooterContacts locale={locale} />
          </div>
          <div className={styles.meta} data-footer-meta>
            <p>© 2026 Yang Jing</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
