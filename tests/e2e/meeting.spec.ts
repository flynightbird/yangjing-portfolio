import { expect, test } from '@playwright/test';

const englishChapterIds = [
  'business-context',
  'design-challenge',
  'system-strategy',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'capability-impact',
  'reflection',
];

const chineseChapterIds = [
  'business-context',
  'design-challenge',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'capability-impact',
];

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} Agora Meeting case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(`/${locale}/work/meeting/`, { waitUntil: 'domcontentloaded' });
    });

    test('renders the approved case and shipped boundaries', async ({ page }) => {
      await expect(page.locator('[data-meeting-case]')).toBeVisible();
      const ids = await page.locator('article[data-case-study] > div > section')
        .evaluateAll((sections) => sections.map(({ id }) => id));

      expect(ids).toEqual(
        locale === 'zh' ? chineseChapterIds : englishChapterIds,
      );
      await expect(page.getByText(
        locale === 'zh' ? '独立负责产品设计' : 'Independent Product Designer',
        { exact: true },
      )).toBeVisible();
      await expect(page.getByText(
        locale === 'zh' ? '已上线' : 'Shipped',
        { exact: true },
      )).toBeVisible();
      await expect(page.locator('body')).not.toContainText(
        /提升了?\s*\d+%|increased by\s*\d+%/i,
      );
    });

    test('loads committed static evidence without missing recordings', async ({ page }) => {
      await expect(page.locator('video[src^="/videos/meeting/"]')).toHaveCount(
        locale === 'zh' ? 14 : 18,
      );
      await expect(page.getByRole('button', { name: locale === 'zh' ? '重播' : 'Replay' })).toBeVisible();
      await expect(page.getByText('Agora Meeting', { exact: true })).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '手机横屏' : 'Landscape viewport')).toBeVisible();
      await expect(
        page.locator('#adaptive-stage').getByText(
          locale === 'zh' ? '手机竖屏' : 'Portrait viewport',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        locale === 'zh'
          ? page.locator('#adaptive-stage figure figcaption > strong').filter({
            hasText: '对话、共享与协作状态',
          }).first()
          : page.locator('#adaptive-stage figure figcaption > span').filter({
            hasText: 'Adaptive stage',
          }).first(),
      ).toBeVisible();
      await expect(
        locale === 'zh'
          ? page.locator('#whiteboard-workspace figure figcaption > strong').filter({
            hasText: '白板占据主舞台，会议控制仍然可用',
          }).first()
          : page.locator('#whiteboard-workspace figure figcaption > span').filter({
            hasText: 'Screen-share annotation',
          }).first(),
      ).toBeVisible();
      await expect(page.locator('#information-layer figure figcaption > span').filter({
        hasText: locale === 'zh' ? '字幕反馈' : 'Live captions',
      }).first()).toBeVisible();
      await expect(page.locator('#information-layer figure figcaption > span').filter({
        hasText: locale === 'zh' ? '实时转写' : 'Live transcript',
      }).first()).toBeVisible();
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
