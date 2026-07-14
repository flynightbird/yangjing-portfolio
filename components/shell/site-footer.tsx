import { ResumeMenu } from '@/components/shell/resume-menu';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './site-footer.module.css';

interface SiteFooterProps {
  readonly locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;
  const localeRoot = `/${locale}/`;

  return (
    <footer className={styles.root}>
      <nav>
        <ul>
          <li>
            <a href={`${localeRoot}about/`}>{dictionary.navigation.about}</a>
          </li>
          <li>
            <a href={`${localeRoot}about/#contact`}>
              {dictionary.navigation.contact}
            </a>
          </li>
          <li>
            <ResumeMenu locale={locale} />
          </li>
        </ul>
      </nav>
      <p>© {new Date().getFullYear()} Yang Jing.</p>
      <p>{dictionary.footer.privacy}</p>
    </footer>
  );
}
