import { expect, test } from '@playwright/test';

const chapterIds = [
  'context',
  'challenge',
  'strategy',
  'system',
  'interrupt',
  'multimodal',
  'impact-reflection',
] as const;

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} ConvoAI case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/work/convo-ai/`, { waitUntil: 'domcontentloaded' });
    });

    test('renders the approved evidence-led chapter sequence', async ({ page }) => {
      const article = page.locator('article[data-case-study]');
      await expect(article).toBeVisible();
      await expect(article.locator(':scope > section')).toHaveCount(chapterIds.length);
      expect(
        await article.locator(':scope > section').evaluateAll((sections) =>
          sections.map(({ id }) => id),
        ),
      ).toEqual(chapterIds);

      await expect(article).toContainText(
        locale === 'zh'
          ? '独立负责产品设计（Designer-reported）'
          : 'Sole product design ownership (designer-reported)',
      );
      await expect(article).not.toContainText(/\d+(?:\.\d+)?%/);
    });

    test('loads all selected Figma evidence and preserves navigation', async ({ page }) => {
      const evidence = page.locator('figure[data-evidence] img');
      await expect(evidence).toHaveCount(7);

      for (let index = 0; index < 7; index += 1) {
        const image = evidence.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }

      await expect(page.locator('[data-project-previous]')).toHaveAttribute(
        'href',
        `/${locale}/work/call-agent/`,
      );
      await expect(page.locator('[data-project-next]')).toHaveAttribute(
        'href',
        `/${locale}/work/meeting/`,
      );
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
