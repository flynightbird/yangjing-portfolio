import { notFound } from 'next/navigation';

import { CaseLayout } from '@/components/case-study/case-layout';
import {
  contentEntries,
  getContentEntry,
  type ContentEntry,
} from '@/content/registry';
import { workSlugs, type WorkSlug } from '@/content/types';
import { isLocale } from '@/lib/i18n/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  const workRoutes = contentEntries
    .filter(({ meta }) => meta.type === 'work')
    .map(({ meta }) => ({ locale: meta.locale, slug: meta.slug }));

  return Array.from(
    new Map(
      workRoutes.map((route) => [`${route.locale}/${route.slug}`, route]),
    ).values(),
  );
}

function isWorkSlug(value: string): value is WorkSlug {
  return workSlugs.some((slug) => slug === value);
}

interface WorkCasePageProps {
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

export default async function WorkCasePage({ params }: WorkCasePageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale) || !isWorkSlug(slug)) {
    notFound();
  }

  const entry = getContentEntry('work', slug, locale);
  if (!entry) {
    notFound();
  }

  const { Actions, Component, meta } = entry;
  const previousEntry = findUniqueNeighbor(meta.previousSlug, locale);
  const nextEntry = findUniqueNeighbor(meta.nextSlug, locale);

  return (
    <CaseLayout
      meta={meta}
      locale={locale}
      actions={Actions ? <Actions locale={locale} /> : undefined}
      previous={resolveNeighbor(previousEntry, locale)}
      next={resolveNeighbor(nextEntry, locale)}
    >
      <Component />
    </CaseLayout>
  );
}
