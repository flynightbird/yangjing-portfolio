import { LiquidField } from '@/components/ui/liquid-field';
import type { Locale } from '@/content/types';

import { FooterRevealMotion } from './footer-reveal-motion';
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
      <div className={styles.revealLayer} data-footer-reveal-layer>
        <LiquidField variant="footer" interactive className={styles.liquid} />
        <div className={styles.inner}>
          <div className={styles.cta}>
            <p>{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <a className={styles.email} href="mailto:yangux@qq.com">
              <span>yangux@qq.com</span>
              <span
                className={styles.emailIcon}
                data-remix-icon="arrow-right-up-line"
                aria-hidden="true"
              />
            </a>
          </div>
          <div className={styles.meta}>
            <p>© 2026 Yang Jing</p>
          </div>
        </div>
      </div>
      <FooterRevealMotion />
    </footer>
  );
}
