import { expect, test } from '@playwright/test';

const chapterIds = [
  'business-context',
  'design-challenge',
  'system-strategy',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'capability-impact',
  'reflection',
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

      expect(ids).toEqual(chapterIds);
      await expect(page.getByText(
        locale === 'zh' ? '唯一产品设计师' : 'Sole Product Designer',
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
      await expect(page.locator('video[src^="/videos/meeting/"]')).toHaveCount(15);
      await expect(page.getByRole('button', { name: locale === 'zh' ? '重播' : 'Replay' })).toBeVisible();
      await expect(page.getByText('Agora Meeting', { exact: true })).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '横屏视窗' : 'Landscape viewport')).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '竖屏视窗' : 'Portrait viewport')).toBeVisible();
      await expect(page.locator('#adaptive-stage figure figcaption > span').filter({
        hasText: locale === 'zh' ? '自适应舞台' : 'Adaptive stage',
      }).first()).toBeVisible();
      await expect(page.locator('#whiteboard-workspace figure figcaption > span').filter({
        hasText: locale === 'zh' ? '屏幕共享标注' : 'Screen-share annotation',
      }).first()).toBeVisible();
      await expect(page.locator('#information-layer figure figcaption > span').filter({
        hasText: locale === 'zh' ? '实时字幕' : 'Live captions',
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
