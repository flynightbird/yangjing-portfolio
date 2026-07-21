import { expect, test } from '@playwright/test';

const chapterIds = ['product-boundary', 'product-system', 'start', 'orchestrate', 'validate-release', 'operationalize', 'scope-reflection'] as const;

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} Call Agent case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/work/call-agent/`, { waitUntil: 'networkidle' });
    });

    test('renders the approved productization story', async ({ page }) => {
      await expect(page.locator('[data-call-agent-case] article[data-case-study]')).toBeVisible();
      expect(await page.locator('article[data-case-study] > section').evaluateAll((sections) => sections.map(({ id }) => id))).toEqual(chapterIds);
      await expect(page.getByText(locale === 'zh' ? '独立负责从 0 到 1 的产品设计' : 'Independent 0-to-1 product design owner', { exact: true })).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '正式上线' : 'Formally launched', { exact: true })).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/有限灰度|尚未规模验证|约 8 次迭代|limited customer beta|not yet validated|approximately 8 iterations/i);
    });

    test('keeps hero evidence and project navigation intact', async ({ page }) => {
      await expect(page.locator('[data-call-agent-hero] [data-call-agent-browser]')).toBeVisible();
      await expect(page.locator('[data-call-agent-hero] video')).toHaveAttribute('src', '/videos/call-agent/agent-preview.mp4');
      await expect(page.locator('[data-project-previous]')).toHaveAttribute('href', `/${locale}/work/xuelang/`);
      await expect(page.locator('[data-project-next]')).toHaveAttribute('href', `/${locale}/work/convo-ai/`);
    });

    test('keeps chapter navigation and horizontal geometry usable', async ({ page }, testInfo) => {
      const navigation = page.getByRole('navigation', { name: locale === 'zh' ? '案例章节' : 'Case study chapters' });
      if (testInfo.project.name === 'desktop') await expect(navigation).toBeVisible();
      else {
        const toggle = page.getByRole('button', { name: locale === 'zh' ? '打开章节目录' : 'Open chapter index' });
        await toggle.click();
        await expect(navigation).toBeVisible();
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('uses posters instead of moving media for print', async ({ page }) => {
      await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
      await expect(page.locator('[data-call-agent-case] video:visible')).toHaveCount(0);
      await expect(page.locator('[data-call-agent-case] [data-call-agent-browser] img').first()).toBeVisible();
      await expect(page.locator('[data-static-stage]')).toHaveCount(6);
    });
  });
}
