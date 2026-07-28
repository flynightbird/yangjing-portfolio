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
      await expect(page.getByText(locale === 'zh' ? '独立负责产品设计' : 'Independent Product Designer', { exact: true })).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '正式上线' : 'Launched', { exact: true })).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/有限灰度|尚未规模验证|约 8 次迭代|limited customer beta|not yet validated|approximately 8 iterations/i);
    });

    test('keeps hero evidence intact without project navigation', async ({ page }) => {
      const heroSequence = page.locator('[data-call-agent-hero-sequence]');
      await expect(heroSequence.locator('[data-hero-clip]')).toHaveCount(3);
      await expect(
        heroSequence.locator('[data-hero-clip][data-active="true"] [data-call-agent-browser]'),
      ).toBeVisible();
      await expect(heroSequence.locator('img')).toHaveCount(3);
      const sources = [
        '/videos/call-agent/agent-create.mp4',
        '/videos/call-agent/agent-preview.mp4',
        '/videos/call-agent/agent-operate.mp4',
      ];
      for (const [index, source] of sources.entries()) {
        const activeClip = heroSequence.locator('[data-hero-clip]').nth(index);
        await expect(activeClip).toHaveAttribute('data-active', 'true');
        await expect(heroSequence.locator('video')).toHaveCount(1);
        await expect(activeClip.locator('video')).toHaveAttribute('src', source);
        if (index < sources.length - 1) await activeClip.locator('video').dispatchEvent('ended');
      }
      await expect(page.locator('[data-project-previous], [data-project-next]')).toHaveCount(0);
    });

    test('keeps chapter navigation and horizontal geometry usable', async ({ page }, testInfo) => {
      const navigation = page.getByRole('navigation', { name: locale === 'zh' ? '案例章节' : 'Case study chapters' });
      if (testInfo.project.name === 'desktop') await expect(navigation).toBeVisible();
      else {
        const toggle = page.getByRole('button', { name: locale === 'zh' ? '打开章节目录' : 'Open chapter index' });
        await toggle.click();
        await expect(navigation).toBeVisible();
      }
      const tablist = page.getByRole('tablist', {
        name: locale === 'zh' ? '产品阶段' : 'Product stages',
        includeHidden: true,
      });
      await tablist.scrollIntoViewIfNeeded();
      await expect(tablist).toBeVisible();
      await expect(tablist.getByRole('tab')).toHaveCount(6);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('uses posters instead of moving media for print', async ({ page }) => {
      await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
      await expect(page.locator('[data-call-agent-case] video:visible')).toHaveCount(0);
      await expect(page.locator('[data-call-agent-case] [data-call-agent-browser] img').first()).toBeVisible();
      const staticStages = page.locator('[data-static-stage]');
      await expect(staticStages).toHaveCount(6);
      for (const stage of await staticStages.all()) await expect(stage).toBeVisible();
      await expect(page.locator('[data-static-sequence] video')).toHaveCount(0);
      await expect(page.locator('[data-static-sequence] img')).toHaveCount(6);
    });
  });
}
