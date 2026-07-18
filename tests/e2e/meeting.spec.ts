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
      )).toBeVisible();
      await expect(page.getByText(
        locale === 'zh' ? '已上线' : 'Shipped',
        { exact: true },
      )).toBeVisible();
      await expect(page.locator('body')).not.toContainText(
        /提升了?\s*\d+%|increased by\s*\d+%/i,
      );
    });

    test('loads accessible video evidence', async ({ page }) => {
      const videos = page.locator('video');
      await expect(videos).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        await expect(videos.nth(index)).toHaveAttribute(
          'poster',
          /\/images\/meeting\/.+\.webp$/,
        );
        await expect(videos.nth(index).locator('track[kind="captions"]')).toHaveCount(1);
      }
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
