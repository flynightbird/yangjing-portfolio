import { notFound } from 'next/navigation';

import { AboutPage as AboutPageContent } from '@/components/about/about-page';
import { isLocale } from '@/lib/i18n/locales';

interface AboutPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AboutPageContent locale={locale} />;
}
