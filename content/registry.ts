import type { ComponentType } from 'react';

import type { ContentMeta } from '@/content/schema';
import type {
  ContentKind,
  Locale,
  SlugForKind,
} from '@/content/types';

export type MdxContentComponent = ComponentType<Record<string, unknown>>;

export interface ContentEntry {
  readonly meta: ContentMeta;
  readonly Component: MdxContentComponent;
}

export interface ContentRegistry {
  readonly entries: readonly ContentEntry[];
  get<Kind extends ContentKind>(
    kind: Kind,
    slug: SlugForKind<Kind>,
    locale: Locale,
  ): ContentEntry | undefined;
  getByTranslationKey(
    translationKey: string,
    locale: Locale,
  ): ContentEntry | undefined;
}

export function findContentEntry<Kind extends ContentKind>(
  entries: readonly ContentEntry[],
  kind: Kind,
  slug: SlugForKind<Kind>,
  locale: Locale,
): ContentEntry | undefined {
  return entries.find(
    (entry) =>
      entry.meta.type === kind &&
      entry.meta.slug === slug &&
      entry.meta.locale === locale,
  );
}

export function createRegistry(
  entries: readonly ContentEntry[],
): ContentRegistry {
  const registeredEntries = [...entries];

  return {
    entries: registeredEntries,
    get: (kind, slug, locale) =>
      findContentEntry(registeredEntries, kind, slug, locale),
    getByTranslationKey: (translationKey, locale) =>
      registeredEntries.find(
        (entry) =>
          entry.meta.translationKey === translationKey &&
          entry.meta.locale === locale,
      ),
  };
}

export const contentEntries: readonly ContentEntry[] = [];
export const contentRegistry = createRegistry(contentEntries);

export function getContentEntry<Kind extends ContentKind>(
  kind: Kind,
  slug: SlugForKind<Kind>,
  locale: Locale,
): ContentEntry | undefined {
  return contentRegistry.get(kind, slug, locale);
}

export function getEntry<Kind extends ContentKind>(
  kind: Kind,
  slug: SlugForKind<Kind>,
  locale: Locale,
): ContentEntry {
  const entry = getContentEntry(kind, slug, locale);
  if (!entry) {
    throw new Error(`Content entry not found: ${kind}/${slug} (${locale})`);
  }

  return entry;
}
