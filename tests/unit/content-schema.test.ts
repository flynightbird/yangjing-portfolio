import { describe, expect, it } from 'vitest';

import {
  contentEntries,
  createRegistry,
  getEntry,
} from '@/content/registry';
import { contentMetaSchema, type ContentMeta } from '@/content/schema';
import type { ContentEntry } from '@/content/registry';
import {
  assertCompleteRegistry,
  validateRegistry,
} from '@/lib/content/validate';

const validCallAgent = {
  slug: 'call-agent',
  locale: 'en',
  translationKey: 'work-call-agent',
  title: 'Call Agent',
  proposition: 'Make AI visible, testable, and controllable before release.',
  type: 'work',
  role: 'Lead Product Designer',
  duration: '9 months',
  status: 'Limited beta',
  disclosure: 'Public, destructively redacted',
  heroMedia: '/images/call-agent/ai-preview-live.png',
  evidenceLevel: 'observed',
  featuredOrder: 2,
  previousSlug: 'bytedance',
  nextSlug: 'meeting',
} as const;

const TestContent = () => null;

function entry(meta: ContentMeta): ContentEntry {
  return { meta, Component: TestContent };
}

const pairedEntries = [
  entry(contentMetaSchema.parse(validCallAgent)),
  entry(contentMetaSchema.parse({ ...validCallAgent, locale: 'zh' })),
];

const launchDefinitions = [
  {
    type: 'work',
    slug: 'bytedance',
    translationKey: 'work-bytedance',
    featuredOrder: 1,
    nextSlug: 'call-agent',
  },
  {
    type: 'work',
    slug: 'call-agent',
    translationKey: 'work-call-agent',
    featuredOrder: 2,
    previousSlug: 'bytedance',
    nextSlug: 'meeting',
  },
  {
    type: 'work',
    slug: 'meeting',
    translationKey: 'work-meeting',
    featuredOrder: 3,
    previousSlug: 'call-agent',
    nextSlug: 'stt-demo',
  },
  {
    type: 'build',
    slug: 'stt-demo',
    translationKey: 'build-stt-demo',
    featuredOrder: 4,
    previousSlug: 'meeting',
  },
] as const;

function createCompleteLaunchEntries(): ContentEntry[] {
  return (['en', 'zh'] as const).flatMap((locale) =>
    launchDefinitions.map((definition) =>
      entry(
        contentMetaSchema.parse({
          ...validCallAgent,
          ...definition,
          locale,
          previousSlug:
            'previousSlug' in definition
              ? definition.previousSlug
              : undefined,
          nextSlug:
            'nextSlug' in definition ? definition.nextSlug : undefined,
        }),
      ),
    ),
  );
}

describe('content metadata', () => {
  it('accepts the exact approved Call Agent fixture', () => {
    expect(contentMetaSchema.parse(validCallAgent)).toEqual(validCallAgent);
  });

  it('supports optional typed chapter metadata', () => {
    const chapters = [
      { id: 'overview', label: 'Overview' },
      { id: 'evidence', label: 'Evidence' },
    ];

    expect(contentMetaSchema.parse({ ...validCallAgent, chapters }).chapters).toEqual(
      chapters,
    );
  });

  it('accepts omitted neighbors at the canonical navigation boundaries', () => {
    expect(
      contentMetaSchema.parse({
        ...validCallAgent,
        slug: 'bytedance',
        translationKey: 'work-bytedance',
        featuredOrder: 1,
        previousSlug: undefined,
        nextSlug: 'call-agent',
      }),
    ).toMatchObject({ slug: 'bytedance', nextSlug: 'call-agent' });

    expect(
      contentMetaSchema.parse({
        ...validCallAgent,
        type: 'build',
        slug: 'stt-demo',
        translationKey: 'build-stt-demo',
        featuredOrder: 4,
        previousSlug: 'meeting',
        nextSlug: undefined,
      }),
    ).toMatchObject({ slug: 'stt-demo', previousSlug: 'meeting' });
  });

  it('rejects unsupported evidence claims', () => {
    expect(() =>
      contentMetaSchema.parse({
        ...validCallAgent,
        evidenceLevel: 'proven-growth',
      }),
    ).toThrow();
  });

  it.each([
    { type: 'work', slug: 'stt-demo' },
    { type: 'build', slug: 'call-agent' },
  ])('rejects $type metadata with the mismatched $slug slug', (mismatch) => {
    expect(() => contentMetaSchema.parse({ ...validCallAgent, ...mismatch })).toThrow();
  });

  it('rejects blank disclosure text', () => {
    expect(() =>
      contentMetaSchema.parse({ ...validCallAgent, disclosure: '   ' }),
    ).toThrow();
  });

  it('rejects media paths outside the public root', () => {
    expect(() =>
      contentMetaSchema.parse({
        ...validCallAgent,
        heroMedia: 'images/call-agent/ai-preview-live.png',
      }),
    ).toThrow();
  });

  it.each([
    '//cdn.example.com/hero.png',
    '/images//hero.png',
    '/images\\hero.png',
    '/images/./hero.png',
    '/images/../private.json',
    '/images/%2e%2e/private.json',
    '/images/%252e%252e/private.json',
    '/images/%2F%2Fcdn.example.com/hero.png',
    '/images/%5chero.png',
    '/images/hero.png?download=1',
    '/images/hero.png#preview',
    '/images/hero%3Fdownload.png',
    '/images/hero%ZZ.png',
  ])('rejects unsafe public media path %s', (heroMedia) => {
    expect(() => contentMetaSchema.parse({ ...validCallAgent, heroMedia })).toThrow();
  });
});

describe('content registry', () => {
  it('registers the bilingual production case and resolves explicit registries', () => {
    const registry = createRegistry(pairedEntries);

    expect(contentEntries).toHaveLength(2);
    expect(contentEntries.map(({ meta }) => meta.locale)).toEqual(['en', 'zh']);
    expect(registry.get('work', 'call-agent', 'zh')).toBe(pairedEntries[1]);
    expect(registry.get('work', 'meeting', 'en')).toBeUndefined();
  });

  it('throws a clear error when a requested production entry is absent', () => {
    expect(() => getEntry('work', 'meeting', 'en')).toThrow(
      /content entry.*work\/meeting.*en/i,
    );
  });

  it('accepts complete in-memory translation pairs', () => {
    expect(() => validateRegistry(pairedEntries)).not.toThrow();
  });

  it('rejects an empty registry because launch routes are missing', () => {
    expect(() => assertCompleteRegistry([])).toThrow(
      /missing launch route.*work\/bytedance.*en/i,
    );
  });

  it('checks dangling navigation targets by default', () => {
    expect(() => assertCompleteRegistry(pairedEntries)).toThrow(
      /entries\[0\]\.meta\.previousSlug.*bytedance.*en/i,
    );
  });

  it('accepts all bilingual launch routes with canonical boundary navigation', () => {
    expect(() =>
      assertCompleteRegistry(createCompleteLaunchEntries()),
    ).not.toThrow();
  });

  it('rejects an incorrect interior neighbor even when that target exists', () => {
    const entries = createCompleteLaunchEntries();
    entries[1] = entry(
      contentMetaSchema.parse({ ...entries[1].meta, nextSlug: 'stt-demo' }),
    );

    expect(() => assertCompleteRegistry(entries)).toThrow(
      /entries\[1\]\.meta\.nextSlug.*expected.*meeting/i,
    );
  });

  it('rejects a missing interior neighbor', () => {
    const entries = createCompleteLaunchEntries();
    entries[1] = entry(
      contentMetaSchema.parse({ ...entries[1].meta, previousSlug: undefined }),
    );

    expect(() => assertCompleteRegistry(entries)).toThrow(
      /entries\[1\]\.meta\.previousSlug.*expected.*bytedance/i,
    );
  });

  it('rejects a route whose featured order differs from the canonical index', () => {
    const entries = createCompleteLaunchEntries();
    entries[1] = entry(
      contentMetaSchema.parse({ ...entries[1].meta, featuredOrder: 5 }),
    );

    expect(() => assertCompleteRegistry(entries)).toThrow(
      /entries\[1\]\.meta\.featuredOrder.*expected 2.*received 5/i,
    );
  });

  it('rejects route identities that share a featured order', () => {
    const entries = createCompleteLaunchEntries();
    entries[1] = entry(
      contentMetaSchema.parse({ ...entries[1].meta, featuredOrder: 3 }),
    );

    expect(() => assertCompleteRegistry(entries)).toThrow(
      /entries\[1\]\.meta\.featuredOrder.*expected 2.*received 3/i,
    );
  });

  it('rejects duplicate slug-locale pairs with a path-specific message', () => {
    expect(() =>
      assertCompleteRegistry([...pairedEntries, pairedEntries[0]]),
    ).toThrow(/entries\[2\].*duplicate slug-locale.*work\/call-agent.*en/i);
  });

  it('rejects duplicate translation keys within one locale', () => {
    const duplicateTranslationKey = entry(
      contentMetaSchema.parse({
        ...validCallAgent,
        slug: 'bytedance',
        previousSlug: 'call-agent',
        locale: 'en',
      }),
    );

    expect(() =>
      assertCompleteRegistry([...pairedEntries, duplicateTranslationKey]),
    ).toThrow(/entries\[2\].*duplicate translation key.*work-call-agent.*en/i);
  });

  it('rejects translation keys without both locale entries', () => {
    expect(() => assertCompleteRegistry([pairedEntries[0]])).toThrow(
      /translation key.*work-call-agent.*missing locale.*zh/i,
    );
  });

  it('rejects translation pairs that point to different route identities', () => {
    const crossWiredMeeting = entry(
      contentMetaSchema.parse({
        ...validCallAgent,
        locale: 'zh',
        slug: 'meeting',
        previousSlug: 'call-agent',
        nextSlug: 'stt-demo',
      }),
    );

    expect(() =>
      validateRegistry([pairedEntries[0], crossWiredMeeting]),
    ).toThrow(/entries\[1\].*translation key.*work-call-agent.*work\/meeting.*work\/call-agent/i);
  });

  it('checks referenced assets through an injected dependency', () => {
    expect(() =>
      assertCompleteRegistry(pairedEntries, {
        checkAssets: true,
        assetExists: (assetPath) => assetPath !== validCallAgent.heroMedia,
      }),
    ).toThrow(/entries\[0\]\.meta\.heroMedia.*ai-preview-live\.png/i);
  });

  it('rejects previous or next targets outside the locale registry', () => {
    const selfContainedPair = pairedEntries.map(({ meta, Component }) => ({
      meta: contentMetaSchema.parse({
        ...meta,
        previousSlug: 'call-agent',
        nextSlug: 'meeting',
      }),
      Component,
    }));

    expect(() =>
      assertCompleteRegistry(selfContainedPair),
    ).toThrow(/entries\[0\]\.meta\.nextSlug.*meeting.*en/i);
  });
});
