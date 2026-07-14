import { describe, expect, it } from 'vitest';

import { getEntry } from '@/content/registry';

const chapterIds = [
  'overview',
  'context-role',
  'design-thesis',
  'decision-path',
  'decision-preview',
  'decision-operate',
  'system-delivery',
  'outcome-learnings',
] as const;

describe('Call Agent native content registry', () => {
  it.each(['en', 'zh'] as const)(
    'registers the complete %s case-study metadata',
    (locale) => {
      const { meta } = getEntry('work', 'call-agent', locale);

      expect(meta).toMatchObject({
        type: 'work',
        slug: 'call-agent',
        locale,
        translationKey: 'work.call-agent',
        heroMedia: '/images/call-agent/ai-preview-live.png',
        evidenceLevel: 'observed',
        featuredOrder: 2,
        previousSlug: 'bytedance',
        nextSlug: 'meeting',
      });
      expect(meta.chapters?.map(({ id }) => id)).toEqual(chapterIds);
    },
  );
});
