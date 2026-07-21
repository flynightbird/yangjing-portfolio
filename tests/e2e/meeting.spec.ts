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
      await expect(page.locator('video[src^="/videos/meeting/"]')).toHaveCount(0);
      await expect(
        page.locator('img[src="/images/meeting/adaptive-layout-poster.webp"]'),
      ).toBeVisible();
      await expect(
        page.locator('img[src="/images/meeting/transcript-poster.webp"]'),
      ).toBeVisible();
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
