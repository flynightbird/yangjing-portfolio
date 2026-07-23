import { describe, expect, it } from 'vitest';

import {
  contentEntries,
  createRegistry,
  getEntry,
} from '@/content/registry';
import { contentMetaSchema, type ContentMeta } from '@/content/schema';
import type { ContentEntry } from '@/content/registry';
import type { WorkSlug } from '@/content/types';
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
    slug: 'xuelang',
    translationKey: 'work-xuelang',
    featuredOrder: 1,
  },
  {
    type: 'work',
    slug: 'call-agent',
    translationKey: 'work-call-agent',
    featuredOrder: 2,
  },
  {
    type: 'work',
    slug: 'convo-ai',
    translationKey: 'work-convo-ai',
    featuredOrder: 3,
  },
  {
    type: 'work',
    slug: 'meeting',
    translationKey: 'work-meeting',
    featuredOrder: 4,
  },
  {
    type: 'work',
    slug: 'tangping',
    translationKey: 'work-tangping',
    featuredOrder: 5,
  },
  {
    type: 'build',
    slug: 'stt-demo',
    translationKey: 'build-stt-demo',
    featuredOrder: 6,
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
        }),
      ),
    ),
  );
}

describe('content metadata', () => {
  it('removes legacy project-neighbor fields from parsed metadata', () => {
    const parsed = contentMetaSchema.parse({
      ...validCallAgent,
      previousSlug: 'xuelang',
      nextSlug: 'meeting',
    });

    expect(parsed).not.toHaveProperty('previousSlug');
    expect(parsed).not.toHaveProperty('nextSlug');
  });

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
  it('registers the bilingual work and Build Lab entries and resolves explicit registries', () => {
    const registry = createRegistry(pairedEntries);

    expect(
      contentEntries.map(
        ({ meta }) => `${meta.type}/${meta.slug}:${meta.locale}`,
      ),
    ).toEqual([
      'work/xuelang:en',
      'work/xuelang:zh',
      'work/call-agent:en',
      'work/call-agent:zh',
      'work/convo-ai:en',
      'work/convo-ai:zh',
      'work/meeting:en',
      'work/meeting:zh',
      'work/tangping:en',
      'work/tangping:zh',
      'build/stt-demo:en',
      'build/stt-demo:zh',
    ]);
    expect(registry.get('work', 'call-agent', 'zh')).toBe(pairedEntries[1]);
    expect(registry.get('work', 'meeting', 'en')).toBeUndefined();
  });

  it('throws a clear error when a requested production entry is absent', () => {
    expect(() => getEntry('work', 'missing' as WorkSlug, 'en')).toThrow(
      /content entry.*work\/missing.*en/i,
    );
  });

  it('accepts complete in-memory translation pairs', () => {
    expect(() => validateRegistry(pairedEntries)).not.toThrow();
  });

  it('rejects an empty registry because launch routes are missing', () => {
    expect(() => assertCompleteRegistry([])).toThrow(
      /missing launch route.*work\/xuelang.*en/i,
    );
  });

  it('accepts all bilingual launch routes in canonical featured order', () => {
    expect(() =>
      assertCompleteRegistry(createCompleteLaunchEntries()),
    ).not.toThrow();
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
        slug: 'xuelang',
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

});
