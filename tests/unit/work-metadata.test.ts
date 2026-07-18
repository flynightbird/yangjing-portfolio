import { describe, expect, it } from 'vitest';

import { generateMetadata } from '@/app/(localized)/[locale]/work/[slug]/page';

describe('localized work metadata', () => {
  it.each([
    ['zh', '学浪商业化体验升级 | Yang Jing', '从卖课工具，到高品质学习平台'],
    ['en', 'Xuelang Commercial Experience Upgrade | Yang Jing', 'From a course-selling tool to a high-quality learning platform'],
  ] as const)('identifies the Xuelang case in the %s browser tab', async (
    locale,
    title,
    description,
  ) => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale, slug: 'xuelang' }),
    });

    expect(metadata.title).toBe(title);
    expect(metadata.description).toBe(description);
  });

  it.each([
    ['en', 'Agora Meeting: A Real-time Collaboration System | Yang Jing'],
    ['zh', 'Agora Meeting：实时协作系统 | Yang Jing'],
  ] as const)('uses the approved Meeting title in %s metadata', async (locale, title) => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale, slug: 'meeting' }),
    });

    expect(metadata.title).toBe(title);
  });

  it.each([
    ['en', 'Tangping Designer | Yang Jing', 'From user research to a product opportunity map for empowering designers'],
    ['zh', '躺平设计家 | Yang Jing', '从用户研究到设计师赋能的产品机会画布'],
  ] as const)('identifies the Tangping case in %s metadata', async (
    locale,
    title,
    description,
  ) => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale, slug: 'tangping' }),
    });

    expect(metadata.title).toBe(title);
    expect(metadata.description).toBe(description);
  });
});
