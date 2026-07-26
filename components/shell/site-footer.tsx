import type { Locale } from '@/content/types';

import { FooterEmailActions } from './footer-email-actions';
import { HomeFooterContacts } from './home-footer-contacts';
import styles from './site-footer.module.css';

interface SiteFooterProps {
  readonly locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = locale === 'zh'
    ? {
        eyebrow: '有一个值得实现的想法？',
        title: '让我们一起把它变成真实体验。',
      }
    : {
        eyebrow: 'Have an idea worth making real?',
        title: "Let's turn it into an experience.",
      };

  return (
    <footer className={styles.root} data-site-footer>
      <div className={styles.revealLayer} data-footer-surface data-footer-reveal-layer>
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
            <FooterEmailActions locale={locale} />
            <HomeFooterContacts locale={locale} />
          </div>
          <div className={styles.meta} data-footer-meta>
            <p>© 2026 Yang Jing</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
