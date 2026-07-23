import { describe, expect, it } from 'vitest';

import {
  dynamicParams,
  generateStaticParams,
} from '@/app/(localized)/[locale]/work/[slug]/page';
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
      const { Actions, meta } = getEntry('work', 'call-agent', locale);

      expect(meta).toMatchObject({
        type: 'work',
        slug: 'call-agent',
        locale,
        translationKey: 'work.call-agent',
        heroMedia: '/images/call-agent/ai-preview-live.png',
        evidenceLevel: 'observed',
        featuredOrder: 2,
        caseLabel: 'CALL AGENT / 0→1 AI PRODUCT',
      });
      expect(meta.facts).toEqual([
        {
          label: locale === 'zh' ? '迭代' : 'Iterations',
          value: locale === 'zh' ? '约 8 次迭代' : 'Approximately 8 iterations',
        },
      ]);
      expect(Actions).toBeTypeOf('function');
      expect(meta.chapters?.map(({ id }) => id)).toEqual(chapterIds);
    },
  );

  it('generates every registered bilingual work route', () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual([
      { locale: 'en', slug: 'xuelang' },
      { locale: 'zh', slug: 'xuelang' },
      { locale: 'en', slug: 'call-agent' },
      { locale: 'zh', slug: 'call-agent' },
      { locale: 'en', slug: 'convo-ai' },
      { locale: 'zh', slug: 'convo-ai' },
      { locale: 'en', slug: 'meeting' },
      { locale: 'zh', slug: 'meeting' },
      { locale: 'en', slug: 'tangping' },
      { locale: 'zh', slug: 'tangping' },
    ]);
  });
});
