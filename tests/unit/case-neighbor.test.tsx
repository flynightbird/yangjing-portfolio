import { beforeEach, describe, expect, it, vi } from 'vitest';

const registryState = vi.hoisted(() => ({
  entries: [] as Array<Record<string, unknown>>,
  currentEntry: undefined as Record<string, unknown> | undefined,
}));

vi.mock('@/content/registry', () => ({
  contentEntries: registryState.entries,
  getContentEntry: () => registryState.currentEntry,
}));

import WorkCasePage from '@/app/(localized)/[locale]/work/[slug]/page';

const Component = () => null;
const baseMeta = {
  type: 'work',
  slug: 'call-agent',
  locale: 'en',
  translationKey: 'work.call-agent',
  title: 'Call Agent',
  proposition: 'Visible AI',
  role: 'Designer',
  duration: '9 months',
  status: 'Beta',
  disclosure: 'Public',
  heroMedia: '/images/call-agent/ai-preview-live.png',
  evidenceLevel: 'observed',
  featuredOrder: 2,
} as const;

beforeEach(() => {
  registryState.entries.splice(0);
  registryState.currentEntry = undefined;
});

describe('work case neighbor resolution', () => {
  it('does not select an ambiguous locale and slug by import order', async () => {
    const currentEntry = {
      meta: { ...baseMeta, previousSlug: 'meeting' },
      Component,
    };
    registryState.currentEntry = currentEntry;
    registryState.entries.push(
      currentEntry,
      {
        meta: {
          ...baseMeta,
          slug: 'meeting',
          translationKey: 'work.meeting',
          title: 'Meeting work',
          featuredOrder: 3,
        },
        Component,
      },
      {
        meta: {
          ...baseMeta,
          type: 'build',
          slug: 'meeting',
          translationKey: 'build.meeting',
          title: 'Meeting build',
          featuredOrder: 4,
        },
        Component,
      },
    );

    const result = await WorkCasePage({
      params: Promise.resolve({ locale: 'en', slug: 'call-agent' }),
    });
    expect(result.props.previous).toBeUndefined();
  });

  it('preserves a unique cross-kind neighbor route', async () => {
    const currentEntry = {
      meta: { ...baseMeta, nextSlug: 'stt-demo' },
      Component,
    };
    registryState.currentEntry = currentEntry;
    registryState.entries.push(currentEntry, {
      meta: {
        ...baseMeta,
        type: 'build',
        slug: 'stt-demo',
        translationKey: 'build.stt-demo',
        title: 'Speech-to-text build',
        featuredOrder: 4,
      },
      Component,
    });

    const result = await WorkCasePage({
      params: Promise.resolve({ locale: 'en', slug: 'call-agent' }),
    });
    expect(result.props.next).toEqual({
      href: '/en/build/stt-demo/',
      title: 'Speech-to-text build',
    });
  });
});
