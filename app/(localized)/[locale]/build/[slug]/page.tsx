import { notFound } from 'next/navigation';

import { CaseLayout } from '@/components/case-study/case-layout';
import {
  contentEntries,
  getContentEntry,
  type ContentEntry,
} from '@/content/registry';
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

function resolveNeighbor(
  entry: ContentEntry | undefined,
  locale: string,
) {
  if (!entry) return undefined;

  return {
    href: `/${locale}/${entry.meta.type}/${entry.meta.slug}/`,
    title: entry.meta.title,
  };
}

function findUniqueNeighbor(slug: string | undefined, locale: string) {
  if (!slug) return undefined;

  const candidates = contentEntries.filter(
    ({ meta }) => meta.locale === locale && meta.slug === slug,
  );
  return candidates.length === 1 ? candidates[0] : undefined;
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
  const previousEntry = findUniqueNeighbor(meta.previousSlug, locale);
  const nextEntry = findUniqueNeighbor(meta.nextSlug, locale);

  return (
    <CaseLayout
      meta={meta}
      locale={locale}
      previous={resolveNeighbor(previousEntry, locale)}
      next={resolveNeighbor(nextEntry, locale)}
    >
      <Component />
    </CaseLayout>
  );
}
