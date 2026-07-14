import { notFound } from 'next/navigation';

import { CaseLayout } from '@/components/case-study/case-layout';
import { contentEntries, getContentEntry } from '@/content/registry';
import { buildSlugs, type BuildSlug } from '@/content/types';
import { isLocale } from '@/lib/i18n/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  const buildRoutes = contentEntries
    .filter(({ meta }) => meta.type === 'build')
    .map(({ meta }) => ({ locale: meta.locale, slug: meta.slug }));

  return Array.from(
    new Map(
      buildRoutes.map((route) => [`${route.locale}/${route.slug}`, route]),
    ).values(),
  );
}

function isBuildSlug(value: string): value is BuildSlug {
  return buildSlugs.some((slug) => slug === value);
}

interface BuildLabPageProps {
  readonly params: Promise<{ locale: string; slug: string }>;
}

export default async function BuildLabPage({ params }: BuildLabPageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale) || !isBuildSlug(slug)) {
    notFound();
  }

  const entry = getContentEntry('build', slug, locale);
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
