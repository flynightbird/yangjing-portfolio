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
  const previousEntry = contentEntries.find(
    ({ meta: candidate }) =>
      candidate.locale === locale && candidate.slug === meta.previousSlug,
  );
  const nextEntry = contentEntries.find(
    ({ meta: candidate }) =>
      candidate.locale === locale && candidate.slug === meta.nextSlug,
  );

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
