import { ArrowUpRight } from 'lucide-react';

import type { Locale } from '@/content/types';

import { FooterCopyButton } from './footer-copy-button';
import styles from './site-footer.module.css';

const EMAIL = 'amanda.yangj@gmail.com';
const WECHAT = 'flydesigner_yangj';

const labels = {
  en: {
    email: 'Email',
    wechat: 'WeChat',
    send: `Send email to ${EMAIL}`,
    emailCopy: {
      copy: 'Copy email address',
      copied: 'Email copied',
      failed: 'Email copy failed. Please copy it manually.',
    },
    wechatCopy: {
      copy: 'Copy WeChat ID',
      copied: 'WeChat ID copied',
      failed: 'WeChat ID copy failed. Please copy it manually.',
    },
  },
  zh: {
    email: '邮箱',
    wechat: '微信',
    send: `发送邮件至 ${EMAIL}`,
    emailCopy: {
      copy: '复制邮箱',
      copied: '邮箱已复制',
      failed: '邮箱复制失败，请手动复制',
    },
    wechatCopy: {
      copy: '复制微信',
      copied: '微信已复制',
      failed: '微信复制失败，请手动复制',
    },
  },
} as const;

export function HomeFooterContacts({ locale }: { readonly locale: Locale }) {
  const text = labels[locale];

  return (
    <div className={styles.homeContacts} data-home-footer-contacts>
      <div className={styles.contactCapsule} data-contact-capsule="email">
        <a
          className={styles.contactValue}
          href={`mailto:${EMAIL}`}
          aria-label={EMAIL}
        >
          <small>{text.email}</small>
          <strong>{EMAIL}</strong>
        </a>
        <div className={styles.contactActions}>
          <FooterCopyButton
            value={EMAIL}
            channel="email"
            labels={text.emailCopy}
            buttonClassName={styles.homeCopyButton}
            feedbackClassName={styles.emailFeedback}
          />
          <a
            className={styles.homeMailAction}
            href={`mailto:${EMAIL}`}
            aria-label={text.send}
          >
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
          </a>
        </div>
      </div>
      <div className={styles.contactCapsule} data-contact-capsule="wechat">
        <div className={styles.contactValue}>
          <small>{text.wechat}</small>
          <strong>{WECHAT}</strong>
        </div>
        <div className={styles.contactActions}>
          <FooterCopyButton
            value={WECHAT}
            channel="wechat"
            labels={text.wechatCopy}
            buttonClassName={styles.homeCopyButton}
            feedbackClassName={styles.emailFeedback}
          />
        </div>
      </div>
    </div>
  );
}
