'use client';

import { Check, Copy, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/content/types';

import styles from './xuelang-contact.module.css';

const wechat = 'flydesigner_yangj';

export function XuelangContact({ locale }: { readonly locale: Locale }) {
  const [message, setMessage] = useState('');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const email = locale === 'zh' ? 'yangux@qq.com' : 'amanda.yangj@gmail.com';
  const text = locale === 'zh'
    ? {
        role: '学浪商业化体验升级 · 项目主负责设计师',
        email: '邮箱',
        wechat: '微信',
        copy: '复制微信号',
        copied: '已复制微信号',
        failed: '复制失败，请手动复制',
      }
    : {
        role: 'Xuelang Commercial Experience Upgrade · Lead UX Designer',
        email: 'Email',
      };

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(wechat);
      setMessage(locale === 'zh' ? '已复制微信号' : 'Copied');
    } catch {
      setMessage(locale === 'zh' ? '复制失败，请手动复制' : 'Copy failed. Please copy manually.');
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setMessage(''), 1800);
  }

  return (
    <footer className={styles.root}>
      <div className={styles.signature}>
        <strong>Yang Jing</strong>
        <span>Product Designer / UX Designer</span>
        <span>{text.role}</span>
      </div>
      <div className={styles.contactRows}>
        <div>
          <span><Mail aria-hidden="true" size={16} /> {text.email}</span>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
        {locale === 'zh' ? (
          <div>
            <span>{text.wechat}</span>
            <p>{wechat}</p>
            <button type="button" onClick={copyWechat} aria-label={text.copy}>
              {message === '已复制微信号' ? (
                <Check aria-hidden="true" size={16} />
              ) : (
                <Copy aria-hidden="true" size={16} />
              )}
            </button>
          </div>
        ) : null}
      </div>
      <p className={styles.live} aria-live="polite">{message}</p>
    </footer>
  );
}
