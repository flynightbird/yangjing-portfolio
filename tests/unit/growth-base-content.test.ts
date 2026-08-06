import { describe, expect, it } from 'vitest';

import { contentRegistry } from '@/content/registry';

describe('Growth Base case metadata', () => {
  it.each([
    ['zh', '个人概念 · 可交互原型'],
    ['en', 'Personal concept · Interactive prototype'],
  ] as const)('registers the %s prototype without unsupported outcome claims', (locale, status) => {
    const entry = contentRegistry.get('work', 'growth-base', locale);

    expect(entry?.meta).toMatchObject({
      slug: 'growth-base',
      locale,
      translationKey: 'work.growth-base',
      evidenceLevel: 'prototype',
      status,
    });
    expect(entry?.meta.chapters?.map((chapter) => chapter.id)).toEqual([
      'showcase',
      'experience-clips',
    ]);
    expect(JSON.stringify(entry?.meta)).not.toMatch(
      /launched|shipped|conversion|retention|上线|转化率|留存|提升\s*\d/iu,
    );
  });
});
