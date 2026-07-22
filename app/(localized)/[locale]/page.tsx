import { notFound } from 'next/navigation';

import { DualIdentityHero } from '@/components/home/dual-identity-hero';
import { FeaturedWork } from '@/components/home/featured-work';
import { IntroStory } from '@/components/home/intro-story';
import { PointerField } from '@/components/home/pointer-field';
import { VisualArchive } from '@/components/home/visual-archive';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
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
    <div className={styles.home} data-homepage>
      <PointerField />
      <DualIdentityHero locale={locale} />
      <IntroStory locale={locale} />
      <FeaturedWork locale={locale} />
      <div
        id="archive"
        className={styles.archiveBridge}
        data-archive-bridge
        data-pointer-suppress
      >
        <ScrollReveal>
          <VisualArchive locale={locale} />
        </ScrollReveal>
      </div>
    </div>
  );
}
