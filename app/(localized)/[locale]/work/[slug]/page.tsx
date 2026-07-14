import { notFound } from 'next/navigation';

import { CaseLayout } from '@/components/case-study/case-layout';
import { getContentEntry } from '@/content/registry';
import { locales, workSlugs, type WorkSlug } from '@/content/types';
import { isLocale } from '@/lib/i18n/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    workSlugs.map((slug) => ({ locale, slug })),
  );
}

function isWorkSlug(value: string): value is WorkSlug {
  return workSlugs.some((slug) => slug === value);
}

interface WorkCasePageProps {
  readonly params: Promise<{ locale: string; slug: string }>;
}

export default async function WorkCasePage({ params }: WorkCasePageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale) || !isWorkSlug(slug)) {
    notFound();
  }

  const entry = getContentEntry('work', slug, locale);
  if (!entry) {
    notFound();
  }

  const { Component, meta } = entry;

  return (
    <CaseLayout meta={meta} locale={locale}>
      <Component />
    </CaseLayout>
  );
}
