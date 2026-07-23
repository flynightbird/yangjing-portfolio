import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CaseLayout } from '@/components/case-study/case-layout';
import {
  contentEntries,
  getContentEntry,
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

export async function generateMetadata({
  params,
}: WorkCasePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale) || !isWorkSlug(slug)) {
    return {};
  }

  const entry = getContentEntry('work', slug, locale);
  if (!entry) {
    return {};
  }

  return {
    title: `${entry.meta.title} | Yang Jing`,
    description: entry.meta.proposition,
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

  const { Actions, Component, Layout = CaseLayout, meta } = entry;

  return (
    <Layout
      meta={meta}
      locale={locale}
      actions={Actions ? <Actions locale={locale} /> : undefined}
    >
      <Component />
    </Layout>
  );
}
