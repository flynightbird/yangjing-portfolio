import { ActionLink } from '@/components/ui/action-link';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './home.module.css';

interface AboutPreviewProps {
  readonly locale: Locale;
}

export function AboutPreview({ locale }: AboutPreviewProps) {
  const copy = locale === 'zh' ? zhDictionary.home.about : enDictionary.home.about;

  return (
    <section
      id="about"
      className={styles.aboutPreview}
      aria-labelledby="about-preview-title"
      data-about-preview
    >
      <div className={styles.aboutInner}>
        <h2 id="about-preview-title">{copy.title}</h2>
        <p className={styles.aboutCareer}>{copy.career}</p>
        <p className={styles.aboutOpportunity}>{copy.opportunity}</p>
        <ActionLink href={`/${locale}/about/`} variant="primary">
          {copy.action}
        </ActionLink>
      </div>
    </section>
  );
}
