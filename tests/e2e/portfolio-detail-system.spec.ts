import { expect, test } from '@playwright/test';

const routes = [
  '/zh/work/call-agent/',
  '/zh/work/meeting/',
  '/zh/work/xuelang/',
] as const;

test.describe('portfolio detail system', () => {
  for (const route of routes) {
    test(`${route} shares navigation and heading semantics`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop');
      await page.goto(route, { waitUntil: 'networkidle' });

      await expect(page.getByRole('banner')).toHaveAttribute(
        'data-surface',
        'light',
      );

      const chapters = page
        .getByRole('navigation', { name: '案例章节' })
        .getByRole('link');
      await expect(chapters.first()).toHaveCSS('opacity', '1');
      await expect(chapters.nth(1)).toHaveCSS('opacity', '0.48');

      for (const [level, leading] of [
        [1, 1.06],
        [2, 1.16],
      ] as const) {
        const heading = page.locator(`[data-case-study] h${level}`).first();
        await expect(heading).toHaveCSS('font-weight', '600');
        const ratio = await heading.evaluate((node) => {
          const style = getComputedStyle(node);
          return (
            Number.parseFloat(style.lineHeight) /
            Number.parseFloat(style.fontSize)
          );
        });
        expect(ratio).toBeCloseTo(leading, 1);
      }
    });
  }

  test('dark base-layout details use dark navigation tokens', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.goto('/zh/build/stt-demo/', { waitUntil: 'commit' });

    const header = page.getByRole('banner');
    await expect(header).toHaveAttribute('data-surface', 'dark');
    await expect(header.getByRole('link').first()).toHaveCSS(
      'color',
      'rgb(244, 245, 242)',
    );

    const chapters = page
      .getByRole('navigation', { name: '案例章节' })
      .getByRole('link');
    await expect(chapters.first()).toHaveCSS('color', 'rgb(242, 244, 240)');
    await expect(chapters.first()).toHaveCSS('opacity', '1');
    await expect(chapters.nth(1)).toHaveCSS('opacity', '0.48');
  });

  test('mobile Call Agent keeps the light capsule and chapter disclosure readable', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');
    await page.goto('/zh/work/call-agent/', { waitUntil: 'networkidle' });

    const header = page.getByRole('banner');
    await expect(header).toHaveAttribute('data-surface', 'light');

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(header).toHaveAttribute('data-scrolled', 'true');

    const capsule = header.locator('div').first();
    const capsuleColors = await capsule.evaluate((node) => {
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, color: style.color };
    });
    expect(capsuleColors.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(capsuleColors.color).toBe('rgb(16, 17, 15)');

    await page.getByRole('button', { name: '打开章节目录' }).click();
    await expect(
      page.getByRole('navigation', { name: '案例章节' }),
    ).toBeVisible();
  });
});
