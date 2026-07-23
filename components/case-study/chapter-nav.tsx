'use client';

import { List, X } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

import type { ChapterMeta } from '@/content/schema';
import type { Locale } from '@/content/types';

import styles from './chapter-nav.module.css';

interface ChapterNavProps {
  readonly chapters: readonly ChapterMeta[];
  readonly locale: Locale;
  readonly compactAt?: 'default' | 'wide';
  readonly indexStart?: number;
  readonly variant?: 'default' | 'xuelang';
  readonly surface?: 'light' | 'dark';
}

const subscribeToHydration = () => () => {};

export function ChapterNav({
  chapters,
  locale,
  compactAt = 'default',
  indexStart = 1,
  variant = 'default',
  surface = 'dark',
}: ChapterNavProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(chapters[0]?.id);
  const [sectionSurface, setSectionSurface] = useState(surface);
  const currentActiveId = chapters.some(({ id }) => id === activeId)
    ? activeId
    : chapters[0]?.id;
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

  useEffect(() => {
    const updateTone = (event: Event) => {
      const tone = (event as CustomEvent<'light' | 'dark'>).detail;
      if (tone === 'light' || tone === 'dark') setSectionSurface(tone);
    };
    window.addEventListener('portfolio-nav-tone', updateTone);
    return () => window.removeEventListener('portfolio-nav-tone', updateTone);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const targets = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((target): target is HTMLElement => target !== null);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (current?.target.id) setActiveId(current.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <div
      className={styles.root}
      data-case-web-control
      data-chapter-variant={variant}
      data-compact-at={compactAt}
      data-surface={sectionSurface}
    >
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
              <a
                href={`#${chapter.id}`}
                aria-current={currentActiveId === chapter.id ? 'location' : undefined}
                onClick={() => {
                  setActiveId(chapter.id);
                  setOpen(false);
                }}
              >
                <span
                  aria-hidden="true"
                  data-chapter-index={String(index + indexStart).padStart(2, '0')}
                >
                  {String(index + indexStart).padStart(2, '0')}
                </span>
                {chapter.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
