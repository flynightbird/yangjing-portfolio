import { expect, test } from '@playwright/test';

test.describe('homepage Footer reveal', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.setTimeout(90_000);
    test.skip(
      !['desktop', 'mobile'].includes(testInfo.project.name),
      'Footer reveal is verified at desktop and 390px mobile bounds.',
    );
  });

  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} reveals the Footer as a lower layer`, async ({ page }, testInfo) => {
      await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' });
      const homepage = page.locator('[data-homepage]');
      const footer = page.locator('[data-site-footer]');
      const layer = footer.locator('[data-footer-reveal-layer]');

      await expect(homepage).toHaveCSS('border-bottom-left-radius', '32px');
      await expect(homepage).toHaveCSS('border-bottom-right-radius', '32px');
      await expect(footer).toHaveCSS('position', 'sticky');
      await expect(footer).toHaveCSS('bottom', '0px');
      expect(
        await footer.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--footer-reveal-offset').trim(),
        ),
      ).toBe(testInfo.project.name === 'mobile' ? '4%' : '8%');

      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await expect
        .poll(() =>
          footer.evaluate((element) =>
            Number(
              getComputedStyle(element).getPropertyValue('--footer-reveal-progress'),
            ),
          ),
        )
        .toBeCloseTo(1, 1);
      await expect(layer).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
      await expect(
        footer.getByRole('link', { name: 'amanda.yangj@gmail.com' }),
      ).toBeVisible();
      await expect(footer.getByText('© 2026 Yang Jing')).toBeVisible();

      if (testInfo.project.name === 'desktop') {
        const spacing = await footer.evaluate((element) => {
          const layer = element.querySelector('[data-footer-reveal-layer]');
          const cta = element.querySelector('[data-footer-cta]');
          const meta = element.querySelector('[data-footer-meta]');
          if (!layer || !cta || !meta) return null;
          const layerBox = layer.getBoundingClientRect();
          const ctaBox = cta.getBoundingClientRect();
          const metaBox = meta.getBoundingClientRect();
          return {
            before: ctaBox.top - layerBox.top,
            after: metaBox.top - ctaBox.bottom,
          };
        });
        expect(spacing).not.toBeNull();
        expect(Math.abs((spacing?.before ?? 0) - (spacing?.after ?? 0))).toBeLessThanOrEqual(4);
      }

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      expect(
        await page.evaluate(() => ({
          body: getComputedStyle(document.body).scrollSnapType,
          html: getComputedStyle(document.documentElement).scrollSnapType,
        })),
      ).toEqual({ body: 'none', html: 'none' });
    });
  }

  test('reduced motion keeps a static rounded layer', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-footer-reveal-layer]')).toHaveCSS(
      'transform',
      'none',
    );
    await expect(page.locator('[data-homepage]')).toHaveCSS(
      'border-bottom-left-radius',
      '32px',
    );
  });

  test('non-homepage routes retain normal Footer flow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Route isolation is viewport-independent.');
    await page.goto('/en/about/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-homepage]')).toHaveCount(0);
    await expect(page.locator('[data-site-footer]')).toHaveCSS('position', 'relative');
    await expect(page.locator('#main-content')).toHaveCSS(
      'border-bottom-left-radius',
      '0px',
    );
  });
});
