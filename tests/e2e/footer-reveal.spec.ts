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
      await expect
        .poll(() =>
          layer.evaluate((element) => {
            const transform = new DOMMatrixReadOnly(getComputedStyle(element).transform);
            return Math.hypot(transform.m41, transform.m42);
          }),
        )
        .toBeLessThanOrEqual(0.05);
      await expect(
        footer.getByRole('link', { name: 'amanda.yangj@gmail.com', exact: true }),
      ).toBeVisible();
      await expect(footer.getByText('© 2026 Yang Jing')).toBeVisible();

      const visualContract = await footer.evaluate((element) => {
        const title = element.querySelector('h2');
        const layer = element.querySelector<HTMLElement>('[data-footer-reveal-layer]');
        const address = element.querySelector<HTMLElement>(
          '[data-footer-email-control="address"]',
        );
        const copy = element.querySelector<HTMLElement>(
          '[data-footer-email-control="copy"]',
        );
        const arrow = element.querySelector<HTMLElement>(
          '[data-footer-email-control="arrow"]',
        );
        const copyIcon = element.querySelector<SVGElement>(
          '[data-footer-email-icon="copy"]',
        );
        const arrowIcon = element.querySelector<SVGElement>(
          '[data-footer-email-icon="arrow"]',
        );
        if (!title || !layer || !address || !copy || !arrow || !copyIcon || !arrowIcon) {
          return null;
        }

        const titleStyle = getComputedStyle(title);
        const addressStyle = getComputedStyle(address);
        return {
          titleSize: Number.parseFloat(titleStyle.fontSize),
          titleLineHeight: Number.parseFloat(titleStyle.lineHeight),
          backgroundImage: getComputedStyle(layer).backgroundImage,
          addressLineHeight: Number.parseFloat(addressStyle.lineHeight),
          copyHeight: copy.getBoundingClientRect().height,
          arrowHeight: arrow.getBoundingClientRect().height,
          copyIconWidth: copyIcon.getBoundingClientRect().width,
          arrowIconWidth: arrowIcon.getBoundingClientRect().width,
          copyTranslate: getComputedStyle(copy).translate,
          arrowTranslate: getComputedStyle(arrow).translate,
          footerCanvasCount: element.querySelectorAll('[data-liquid-field="footer"]').length,
        };
      });

      expect(visualContract).not.toBeNull();
      if (!visualContract) throw new Error('Missing Footer visual contract');
      expect(visualContract.footerCanvasCount).toBe(0);
      expect(visualContract.backgroundImage.match(/radial-gradient/g)).toHaveLength(4);
      expect(visualContract.titleLineHeight / visualContract.titleSize).toBeCloseTo(1.08, 2);
      expect(visualContract.titleSize).toBeLessThanOrEqual(
        testInfo.project.name === 'mobile' ? 36 : 76,
      );
      expect(visualContract.copyHeight).toBeLessThanOrEqual(
        visualContract.addressLineHeight,
      );
      expect(visualContract.arrowHeight).toBeLessThanOrEqual(
        visualContract.addressLineHeight,
      );
      expect(visualContract.copyIconWidth).toBe(16);
      expect(visualContract.arrowIconWidth).toBe(16);
      expect(visualContract.copyTranslate).toBe('0px 3px');
      expect(visualContract.arrowTranslate).toBe('0px 3px');

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
