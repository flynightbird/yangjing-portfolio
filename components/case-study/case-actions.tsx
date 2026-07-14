'use client';

import { Download, ExternalLink } from 'lucide-react';

import { ActionLink } from '@/components/ui/action-link';
import type { Locale } from '@/content/types';

import styles from './case-layout.module.css';

interface CaseActionsProps {
  readonly locale: Locale;
}

export function CaseActions({ locale }: CaseActionsProps) {
  const text =
    locale === 'zh'
      ? {
          view: '查看中文案例 PDF',
          download: '下载中文案例 PDF',
          external: '在新标签页打开',
        }
      : {
          view: 'View Chinese case-study PDF',
          download: 'Download Chinese case-study PDF',
          external: 'opens in a new tab',
        };

  return (
    <div className={styles.actions} data-case-web-control>
      <ActionLink
        href="/files/call-agent-case-study-zh.pdf"
        variant="secondary"
        icon={ExternalLink}
        external
        externalLabel={text.external}
      >
        {text.view}
      </ActionLink>
      <ActionLink
        href="/files/call-agent-case-study-zh.pdf"
        variant="text"
        icon={Download}
        download
      >
        {text.download}
      </ActionLink>
    </div>
  );
}
