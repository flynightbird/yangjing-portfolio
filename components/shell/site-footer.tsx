import { ArrowUpRight } from 'lucide-react';

import { LiquidField } from '@/components/ui/liquid-field';
import type { Locale } from '@/content/types';

import styles from './site-footer.module.css';

interface SiteFooterProps {
  readonly locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = locale === 'zh'
    ? {
        eyebrow: '有一个值得实现的想法？',
        title: '让我们一起把它变成真实体验。',
        about: '关于我',
        privacy: '本静态网站使用 Cloudflare Web Analytics，不设联系表单。',
      }
    : {
        eyebrow: 'Have an idea worth making real?',
        title: "Let's turn it into an experience.",
        about: 'About',
        privacy: 'This static site uses Cloudflare Web Analytics and no contact form.',
      };

  return (
    <footer className={styles.root}>
      <LiquidField variant="footer" interactive className={styles.liquid} />
      <div className={styles.inner}>
        <div className={styles.cta}>
          <p>{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <a className={styles.email} href="mailto:yangux@qq.com">
            <span>yangux@qq.com</span>
            <ArrowUpRight aria-hidden="true" size={28} strokeWidth={1.5} />
          </a>
        </div>
        <div className={styles.meta}>
          <a href={`/${locale}/about/`}>{copy.about}</a>
          <p>© {new Date().getFullYear()} Yang Jing</p>
          <p>{copy.privacy}</p>
        </div>
      </div>
    </footer>
  );
}
