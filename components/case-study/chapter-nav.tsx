'use client';

import { List, X } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

import type { ChapterMeta } from '@/content/schema';
import type { Locale } from '@/content/types';

import styles from './chapter-nav.module.css';

interface ChapterNavProps {
  readonly chapters: readonly ChapterMeta[];
  readonly locale: Locale;
}

const subscribeToHydration = () => () => {};

export function ChapterNav({ chapters, locale }: ChapterNavProps) {
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const copy =
    locale === 'zh'
      ? {
          label: '案例章节',
          open: '打开章节目录',
          close: '关闭章节目录',
        }
      : {
          label: 'Case study chapters',
          open: 'Open chapter index',
          close: 'Close chapter index',
        };

  return (
    <div className={styles.root} data-case-web-control>
      <button
        className={styles.toggle}
        type="button"
        aria-expanded={open}
        aria-controls="case-chapter-nav"
        aria-label={open ? copy.close : copy.open}
        data-hydrated={hydrated ? 'true' : 'false'}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" size={20} /> : <List aria-hidden="true" size={20} />}
        <span>{locale === 'zh' ? '章节' : 'Index'}</span>
      </button>
      <nav
        id="case-chapter-nav"
        className={styles.navigation}
        data-open={open ? 'true' : 'false'}
        aria-label={copy.label}
      >
        <ol>
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} onClick={() => setOpen(false)}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {chapter.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
