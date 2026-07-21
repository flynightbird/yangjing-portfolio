import { describe, expect, it } from 'vitest';

import {
  dynamicParams,
  generateStaticParams,
} from '@/app/(localized)/[locale]/work/[slug]/page';
import { getEntry } from '@/content/registry';

const chapterIds = [
  'product-boundary',
  'product-system',
  'start',
  'orchestrate',
  'validate-release',
  'operationalize',
  'scope-reflection',
] as const;

describe('Call Agent native content registry', () => {
  it.each(['en', 'zh'] as const)(
    'registers the complete %s case-study metadata',
    (locale) => {
      const { Layout, meta } = getEntry('work', 'call-agent', locale);

      expect(meta).toMatchObject({
        type: 'work',
        slug: 'call-agent',
        locale,
        translationKey: 'work.call-agent',
        title:
          locale === 'zh'
            ? 'Call Agent：把对话式 AI 能力变成企业可自主运营的产品'
            : 'Call Agent: turn conversational AI into an enterprise-operated product',
        role:
          locale === 'zh'
            ? '独立负责从 0 到 1 的产品设计'
            : 'Independent 0-to-1 product design owner',
        status: locale === 'zh' ? '正式上线' : 'Formally launched',
        heroMedia: '/images/call-agent/agent-preview-poster.webp',
        evidenceLevel: 'observed',
        featuredOrder: 2,
        previousSlug: 'xuelang',
        nextSlug: 'convo-ai',
        caseLabel: 'CALL AGENT / 0→1 AI PRODUCT',
      });
      expect(meta.facts).toBeUndefined();
      expect(Layout).toBeTypeOf('function');
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
