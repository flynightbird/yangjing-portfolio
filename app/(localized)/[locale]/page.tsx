import { notFound } from 'next/navigation';

import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import { isLocale } from '@/lib/i18n/locales';

interface LocaleHomePageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;

  return (
    <section>
      <h1>{dictionary.home.title}</h1>
      <p>{dictionary.home.description}</p>
    </section>
  );
}
