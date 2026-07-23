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

describe('work case route contract', () => {
  it('does not resolve or pass project neighbors to the detail layout', async () => {
    registryState.currentEntry = { meta: baseMeta, Component };
    registryState.entries.push(
      registryState.currentEntry,
      {
        meta: { ...baseMeta, slug: 'meeting', title: 'Meeting', featuredOrder: 3 },
        Component,
      },
    );

    const result = await WorkCasePage({
      params: Promise.resolve({ locale: 'en', slug: 'call-agent' }),
    });

    expect(result.props).not.toHaveProperty('previous');
    expect(result.props).not.toHaveProperty('next');
  });
});
