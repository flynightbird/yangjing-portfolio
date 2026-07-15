import { notFound } from 'next/navigation';

import { AboutPreview } from '@/components/home/about-preview';
import { DualIdentityHero } from '@/components/home/dual-identity-hero';
import { FeaturedWork } from '@/components/home/featured-work';
import { IntroStory } from '@/components/home/intro-story';
import { VisualArchive } from '@/components/home/visual-archive';
import { isLocale } from '@/lib/i18n/locales';

import styles from '@/components/home/home.module.css';

interface LocaleHomePageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div className={styles.home}>
      <DualIdentityHero locale={locale} />
      <IntroStory locale={locale} />
      <FeaturedWork locale={locale} />
      <VisualArchive locale={locale} />
      <AboutPreview locale={locale} />
    </div>
  );
}
