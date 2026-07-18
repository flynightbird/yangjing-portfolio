import type { ComponentType } from 'react';

import CallAgentEn, {
  metadata as callAgentEnMetadata,
} from '@/content/work/call-agent.en.mdx';
import CallAgentZh, {
  metadata as callAgentZhMetadata,
} from '@/content/work/call-agent.zh.mdx';
import XuelangEn, {
  metadata as xuelangEnMetadata,
} from '@/content/work/xuelang.en.mdx';
import XuelangZh, {
  metadata as xuelangZhMetadata,
} from '@/content/work/xuelang.zh.mdx';
import SttDemoEn, {
  metadata as sttDemoEnMetadata,
} from '@/content/build/stt-demo.en.mdx';
import SttDemoZh, {
  metadata as sttDemoZhMetadata,
} from '@/content/build/stt-demo.zh.mdx';
import MeetingEn, { metadata as meetingEnMetadata } from '@/content/work/meeting.en.mdx';
import MeetingZh, { metadata as meetingZhMetadata } from '@/content/work/meeting.zh.mdx';
import TangpingEn, { metadata as tangpingEnMetadata } from '@/content/work/tangping.en.mdx';
import TangpingZh, { metadata as tangpingZhMetadata } from '@/content/work/tangping.zh.mdx';
import { CallAgentActions } from '@/components/case-study/call-agent-actions';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';
import { MeetingLayout } from '@/components/meeting/meeting-layout';
import { TangpingLayout } from '@/components/tangping/tangping-layout';
import { XuelangLayout } from '@/components/xuelang/xuelang-layout';
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
  readonly Layout?: ComponentType<ContentLayoutProps>;
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
    meta: contentMetaSchema.parse(xuelangEnMetadata),
    Component: XuelangEn,
    Layout: XuelangLayout,
  },
  {
    meta: contentMetaSchema.parse(xuelangZhMetadata),
    Component: XuelangZh,
    Layout: XuelangLayout,
  },
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
    meta: contentMetaSchema.parse(meetingEnMetadata),
    Component: MeetingEn,
    Layout: MeetingLayout,
  },
  {
    meta: contentMetaSchema.parse(meetingZhMetadata),
    Component: MeetingZh,
    Layout: MeetingLayout,
  },
  {
    meta: contentMetaSchema.parse(tangpingEnMetadata),
    Component: TangpingEn,
    Layout: TangpingLayout,
  },
  {
    meta: contentMetaSchema.parse(tangpingZhMetadata),
    Component: TangpingZh,
    Layout: TangpingLayout,
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
