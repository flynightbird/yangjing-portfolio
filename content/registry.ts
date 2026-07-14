import type { ComponentType } from 'react';

import CallAgentEn, {
  metadata as callAgentEnMetadata,
} from '@/content/work/call-agent.en.mdx';
import CallAgentZh, {
  metadata as callAgentZhMetadata,
} from '@/content/work/call-agent.zh.mdx';
import SttDemoEn, {
  metadata as sttDemoEnMetadata,
} from '@/content/build/stt-demo.en.mdx';
import SttDemoZh, {
  metadata as sttDemoZhMetadata,
} from '@/content/build/stt-demo.zh.mdx';
import { CallAgentActions } from '@/components/case-study/call-agent-actions';
import { contentMetaSchema, type ContentMeta } from '@/content/schema';
import type {
  ContentKind,
  Locale,
  SlugForKind,
} from '@/content/types';

export type MdxContentComponent = ComponentType<Record<string, unknown>>;
export type ContentActionsComponent = ComponentType<{ readonly locale: Locale }>;

export interface ContentEntry {
  readonly meta: ContentMeta;
  readonly Component: MdxContentComponent;
  readonly Actions?: ContentActionsComponent;
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

export const contentEntries: readonly ContentEntry[] = [
  {
    meta: contentMetaSchema.parse(callAgentEnMetadata),
    Component: CallAgentEn,
    Actions: CallAgentActions,
  },
  {
    meta: contentMetaSchema.parse(callAgentZhMetadata),
    Component: CallAgentZh,
    Actions: CallAgentActions,
  },
  {
    meta: contentMetaSchema.parse(sttDemoEnMetadata),
    Component: SttDemoEn,
  },
  {
    meta: contentMetaSchema.parse(sttDemoZhMetadata),
    Component: SttDemoZh,
  },
];
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
