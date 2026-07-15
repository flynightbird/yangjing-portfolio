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
      const pdfLink = page.getByRole('link', { name: /PDF/ });
      await expect(pdfLink).toBeInViewport();
      await expect(pdfLink).toHaveAttribute(
        'href',
        `/files/xuelang-case-study-${locale}.pdf`,
      );
      await expect(pdfLink).toHaveAttribute('download', '');

      for (const metric of ['+11.75%', '+1.36%', '+6.5%']) {
        await expect(page.getByText(metric, { exact: true }).last()).not.toBeInViewport();
      }

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

      await expect(page.getByText(
        locale === 'zh'
          ? '数据为实验周期内 14 天累计相对值。'
          : 'Data represents cumulative relative values over the 14-day experiment period.',
        { exact: true },
      )).toBeVisible();
      await expect(page.locator('main')).not.toContainText(/灰度|gray release|long-term validated/i);

      const email = locale === 'zh' ? 'yangux@qq.com' : 'amanda.yangj@gmail.com';
      await expect(page.getByRole('link', { name: email })).toHaveAttribute(
        'href',
        `mailto:${email}`,
      );
    });
  }

  test('desktop chapter rail, lightbox, and Chinese contact remain operable', async ({
    context,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Interactions need one canonical viewport.');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/zh/work/xuelang/', { waitUntil: 'networkidle' });

    for (const id of chapterIds) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect
        .poll(async () => page.locator(`a[href="#${id}"]`).getAttribute('aria-current'))
        .toBe('location');
    }

    const firstEvidence = page.locator('[data-evidence]').first();
    await firstEvidence.getByRole('button').click();
    await expect(page.getByRole('dialog', { name: '查看产品界面' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: '查看产品界面' })).toHaveCount(0);

    await page.getByRole('button', { name: '复制微信号' }).click();
    await expect(page.getByText('已复制微信号', { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('flydesigner_yangj');
  });

  test('desktop creates one learning pin and reduced motion creates none', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Pinning starts at 1200px.');
    await page.goto('/zh/work/xuelang/', { waitUntil: 'networkidle' });
    await expect(page.locator('.pin-spacer')).toHaveCount(1);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '连接持续学习体验' })).toBeVisible();
  });
});
