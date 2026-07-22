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
    <article className={styles.root}>
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

      <section id="contact" className={styles.contact}>
        <h2>{locale === 'zh' ? '一起创造真实体验' : 'Make something real together'}</h2>
        <a href="mailto:yangux@qq.com">yangux@qq.com</a>
      </section>
    </article>
  );
}
