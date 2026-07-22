'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';

import { LocaleSwitcher } from '@/components/shell/locale-switcher';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './site-header.module.css';

function resolveHeaderSurface(pathname: string): 'light' | 'dark' {
  return /^\/(?:en|zh)\/work\/(?:call-agent|convo-ai|meeting|xuelang)\/?$/.test(pathname)
    ? 'light'
    : 'dark';
}

export function SiteHeader({ locale }: { readonly locale: Locale }) {
  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;
  const localeRoot = `/${locale}/`;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const topSentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!(entry?.isIntersecting ?? true)),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const links = (
    <>
      <a href={`${localeRoot}#work`}>{dictionary.navigation.work}</a>
      <a href={`${localeRoot}#archive`}>{dictionary.navigation.archive}</a>
      <a href={`${localeRoot}about/`}>{dictionary.navigation.about}</a>
    </>
  );

  return (
    <Fragment>
      <span
        ref={topSentinelRef}
        className={styles.topSentinel}
        data-header-top-sentinel
        aria-hidden="true"
      />
      <header
        className={styles.root}
        data-scrolled={scrolled ? 'true' : 'false'}
        data-surface={resolveHeaderSurface(pathname)}
      >
        <div className={styles.capsule}>
          <a
            className={styles.home}
            href={localeRoot}
            aria-label={dictionary.site.homeLabel}
          >
            Yang Jing
          </a>
          <nav className={styles.desktopNav} aria-label={dictionary.menu.label}>
            {links}
          </nav>
          <div className={styles.actions}>
            <details className={styles.mobileMenu}>
              <summary aria-label={dictionary.menu.open}>
                <Menu aria-hidden="true" size={20} />
              </summary>
              <nav aria-label={dictionary.menu.label}>{links}</nav>
            </details>
            <span className={styles.separator} aria-hidden="true" />
            <LocaleSwitcher locale={locale} />
          </div>
        </div>
      </header>
    </Fragment>
  );
}
