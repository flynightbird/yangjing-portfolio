'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

import { LocaleSwitcher } from '@/components/shell/locale-switcher';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './site-header.module.css';

export function SiteHeader({ locale }: { readonly locale: Locale }) {
  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;
  const localeRoot = `/${locale}/`;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const links = (
    <>
      <a href={`${localeRoot}#work`}>{dictionary.navigation.work}</a>
      <a href={`${localeRoot}#archive`}>{dictionary.navigation.archive}</a>
      <a href={`${localeRoot}about/`}>{dictionary.navigation.about}</a>
    </>
  );

  return (
    <header className={styles.root} data-scrolled={scrolled ? 'true' : 'false'}>
      <div className={styles.capsule}>
        <a
          className={styles.home}
          href={localeRoot}
          aria-label={dictionary.site.homeLabel}
        >
          YJ
        </a>
        <nav className={styles.desktopNav} aria-label={dictionary.menu.label}>
          {links}
        </nav>
        <details className={styles.mobileMenu}>
          <summary aria-label={dictionary.menu.open}>
            <Menu aria-hidden="true" size={20} />
          </summary>
          <nav aria-label={dictionary.menu.label}>{links}</nav>
        </details>
        <span className={styles.separator} aria-hidden="true" />
        <LocaleSwitcher locale={locale} />
      </div>
    </header>
  );
}
