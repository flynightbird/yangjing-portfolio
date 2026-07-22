'use client';

import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/content/types';

import styles from './site-footer.module.css';

const EMAIL = 'amanda.yangj@gmail.com';
const RESET_DELAY = 1800;

type CopyState = 'idle' | 'copied' | 'failed';

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
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const text = labels[locale];
  const feedback = copyState === 'idle' ? '' : text[copyState];
  const buttonLabel = feedback || text.copy;

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(EMAIL);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), RESET_DELAY);
  }

  return (
    <div className={styles.emailActions} data-footer-email-actions>
      <a
        className={styles.email}
        href={`mailto:${EMAIL}`}
        data-footer-email-control="address"
      >
        {EMAIL}
      </a>
      <button
        className={styles.copyButton}
        type="button"
        onClick={copyEmail}
        aria-label={buttonLabel}
        data-copy-state={copyState}
        data-footer-email-control="copy"
      >
        {copyState === 'copied' ? (
          <Check
            aria-hidden="true"
            size={16}
            strokeWidth={1.7}
            data-footer-email-icon="check"
          />
        ) : (
          <Copy
            aria-hidden="true"
            size={16}
            strokeWidth={1.7}
            data-footer-email-icon="copy"
          />
        )}
      </button>
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
      <span className={styles.emailFeedback} role="status" aria-live="polite">
        {feedback}
      </span>
    </div>
  );
}
