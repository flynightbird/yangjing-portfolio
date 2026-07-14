import { Menu } from 'lucide-react';

import { LocaleSwitcher } from '@/components/shell/locale-switcher';
import { ResumeMenu } from '@/components/shell/resume-menu';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './site-header.module.css';

interface SiteHeaderProps {
  readonly locale: Locale;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;
  const localeRoot = `/${locale}/`;

  return (
    <header className={styles.root}>
      <a
        className={styles.home}
        href={localeRoot}
        aria-label={dictionary.site.homeLabel}
      >
        {dictionary.site.name}
      </a>
      <details>
        <summary>
          <Menu aria-hidden="true" size={20} />
          <span>{dictionary.menu.label}</span>
        </summary>
        <nav>
          <ul>
            <li>
              <a href={`${localeRoot}#work`}>{dictionary.navigation.work}</a>
            </li>
            <li>
              <a href={`${localeRoot}about/`}>{dictionary.navigation.about}</a>
            </li>
            <li>
              <ResumeMenu locale={locale} />
            </li>
            <li>
              <a href={`${localeRoot}about/#contact`}>
                {dictionary.navigation.contact}
              </a>
            </li>
          </ul>
        </nav>
      </details>
      <LocaleSwitcher locale={locale} />
    </header>
  );
}
