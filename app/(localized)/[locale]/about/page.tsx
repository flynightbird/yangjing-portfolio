import { notFound } from 'next/navigation';

import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import { isLocale } from '@/lib/i18n/locales';

import styles from './about.module.css';

interface AboutPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = locale === 'zh' ? zhDictionary.aboutPage : enDictionary.aboutPage;

  return (
    <article className={styles.root} data-publication-state="draft">
      <header className={styles.hero}>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <section className={styles.career}>
        <h2>{locale === 'zh' ? '职业路径' : 'Career path'}</h2>
        <p>{copy.career}</p>
      </section>

      <section className={styles.opportunity}>
        <h2>{copy.opportunityTitle}</h2>
        <p>{copy.opportunity}</p>
      </section>

      <section id="contact" className={styles.pending}>
        <h2>{copy.awaitingTitle}</h2>
        <ul>
          <li>{copy.portrait}</li>
          <li>{copy.resumes}</li>
          <li>{copy.contact}</li>
        </ul>
        <p>{copy.contactDescription}</p>
      </section>
    </article>
  );
}
