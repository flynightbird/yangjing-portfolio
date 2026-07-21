import { describe, expect, it } from 'vitest';

import { contentEntries, getEntry } from '@/content/registry';
import { homepageProjects } from '@/content/home';

describe('ConvoAI publication contract', () => {
  it('publishes a complete bilingual internal case', () => {
    const entries = contentEntries.filter(({ meta }) => meta.slug === 'convo-ai');

    expect(entries.map(({ meta }) => meta.locale)).toEqual(['en', 'zh']);
    for (const locale of ['en', 'zh'] as const) {
      expect(getEntry('work', 'convo-ai', locale).meta).toMatchObject({
        type: 'work',
        slug: 'convo-ai',
        locale,
        translationKey: 'work.convo-ai',
        heroMedia: '/images/convo-ai/figma/web-ready.png',
        previousSlug: 'call-agent',
        nextSlug: 'meeting',
      });
    }
  });

  it('routes the homepage card to the internal case without placeholder state', () => {
    expect(homepageProjects.find(({ id }) => id === 'convo-ai')).toMatchObject({
      destination: 'internal-case',
      availability: 'complete',
      href: 'work/convo-ai/',
    });
  });
});
