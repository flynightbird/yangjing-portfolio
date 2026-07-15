import { expect, test } from '@playwright/test';

const chapterIds = [
  'overview',
  'business',
  'problem',
  'strategy',
  'decision-standard',
  'decision-purchase',
  'decision-learning',
  'results',
] as const;

test.describe('Xuelang case study', () => {
  for (const locale of ['zh', 'en'] as const) {
    test(`${locale} renders the complete evidence-led case`, async ({ page }) => {
      await page.goto(`/${locale}/work/xuelang/`, { waitUntil: 'networkidle' });

      const sections = await page
        .locator('[data-case-study] > div > section')
        .evaluateAll((elements) => elements.map((element) => element.id));
      expect(sections).toEqual(chapterIds);

      const title = locale === 'zh'
        ? '学浪商业化体验升级'
        : 'Xuelang Commercial Experience Upgrade';
      const role = locale === 'zh' ? '项目主负责设计师' : 'Lead UX Designer';
      const duration = locale === 'zh' ? '2022.03–05 · 2 个月' : 'Mar–May 2022 · 2 months';
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeInViewport();
      await expect(page.getByText(role, { exact: true })).toBeInViewport();
      await expect(page.getByText(duration, { exact: true })).toBeInViewport();
      await expect(page.locator('[data-hero-panorama] img')).toBeInViewport();
      await expect(page.getByRole('link', { name: /PDF/ })).toBeInViewport();

      await expect(page.locator('[data-testid="xuelang-dark-stage"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="learning-state"]')).toHaveCount(5);
      await expect(page.getByRole('navigation', { name: locale === 'zh' ? '项目导航' : 'Project navigation' })).toHaveCount(0);

      const evidence = page.locator('[data-evidence] img');
      expect(await evidence.count()).toBeGreaterThanOrEqual(12);
      for (let index = 0; index < await evidence.count(); index += 1) {
        const image = evidence.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
      }

      expect(await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )).toBeLessThanOrEqual(1);
    });
  }

  test('desktop creates one learning pin and reduced motion creates none', async ({ page }) => {
    await page.goto('/zh/work/xuelang/', { waitUntil: 'networkidle' });
    await expect(page.locator('.pin-spacer')).toHaveCount(1);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '连接持续学习体验' })).toBeVisible();
  });
});
