import { ArrowUpRight } from 'lucide-react';

import type { Locale } from '@/content/types';

import { FooterCopyButton } from './footer-copy-button';
import styles from './site-footer.module.css';

const EMAIL = 'amanda.yangj@gmail.com';

const labels = {
  en: {
    copy: 'Copy email address',
    copied: 'Email copied',
    failed: 'Copy failed. Please copy the email manually.',
    send: `Send email to ${EMAIL}`,
  },
  zh: {
    copy: '复制邮箱',
    copied: '邮箱已复制',
    failed: '复制失败，请手动复制',
    send: `发送邮件至 ${EMAIL}`,
  },
} as const;

export function FooterEmailActions({ locale }: { readonly locale: Locale }) {
  const text = labels[locale];

  return (
    <div className={styles.emailActions} data-footer-email-actions>
      <a
        className={styles.email}
        href={`mailto:${EMAIL}`}
        data-footer-email-control="address"
      >
        {EMAIL}
      </a>
      <FooterCopyButton
        value={EMAIL}
        channel="email"
        labels={{ copy: text.copy, copied: text.copied, failed: text.failed }}
        buttonClassName={styles.copyButton}
        feedbackClassName={styles.emailFeedback}
        legacyControl
      />
      <a
        className={styles.emailArrow}
        href={`mailto:${EMAIL}`}
        aria-label={text.send}
        data-footer-email-control="arrow"
      >
        <ArrowUpRight
          className={styles.emailIcon}
          aria-hidden="true"
          size={16}
          strokeWidth={1.7}
          data-footer-email-icon="arrow"
        />
      </a>
    </div>
  );
}
