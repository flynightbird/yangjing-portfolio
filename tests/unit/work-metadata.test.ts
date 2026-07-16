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
});
