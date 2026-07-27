import { expect, test } from '@playwright/test';

test.describe('homepage liquid Footer', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.setTimeout(90_000);
    test.skip(
      !['desktop', 'mobile'].includes(testInfo.project.name),
      'Footer flow is verified at desktop and 390px mobile bounds.',
    );
  });

  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} ends in a normal-flow liquid contact surface`, async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: async () => undefined },
        });
      });
      await page.goto(`/${locale}/`, { waitUntil: 'networkidle' });

      const homepage = page.locator('[data-homepage]');
      const footer = page.locator('[data-site-footer]');
      const contacts = footer.locator('[data-footer-contacts]');

      await expect(footer).toHaveCount(1);
      await expect(footer).toHaveCSS('position', 'relative');
      await expect(footer).toHaveCSS('bottom', '0px');
      await expect(homepage).toHaveCSS('border-bottom-left-radius', '0px');
      await expect(contacts).toBeVisible();
      await expect(contacts.locator('[data-contact-capsule]')).toHaveCount(2);
      await expect(contacts.getByText('flydesigner-yj')).toBeVisible();

      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      const flow = await page.evaluate(() => {
        const homepageElement = document.querySelector('[data-homepage]');
        const footerElement = document.querySelector('[data-site-footer]');
        if (!homepageElement || !footerElement) return null;
        return {
          gap: footerElement.getBoundingClientRect().top
            - homepageElement.getBoundingClientRect().bottom,
          overflow: document.documentElement.scrollWidth
            - document.documentElement.clientWidth,
        };
      });
      expect(flow).not.toBeNull();
      expect(Math.abs(flow?.gap ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(1);
      expect(flow?.overflow ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);

      const wechatCopy = contacts.locator('[data-contact-copy="wechat"]');
      await wechatCopy.click();
      await expect(wechatCopy).toHaveAttribute('data-copy-state', 'copied');
      await expect(wechatCopy.locator('[data-copy-icon="check"]')).toHaveCount(1);
      await expect(wechatCopy).toHaveAttribute('data-copy-state', 'idle', {
        timeout: 2_500,
      });
      await expect(wechatCopy.locator('[data-copy-icon="copy"]')).toHaveCount(1);

      const visualContract = await footer.evaluate((element) => {
        const capsule = element.querySelector<HTMLElement>(
          '[data-contact-capsule="email"]',
        );
        const ribbons = Array.from(
          element.querySelectorAll<HTMLElement>('[data-footer-liquid^="ribbon-"]'),
        );
        const copyButton = capsule?.querySelector<HTMLElement>(
          '[data-contact-copy="email"]',
        );
        const mailAction = capsule?.querySelector<HTMLElement>(
          '[class*="contactActions"] a[href^="mailto:"]',
        );
        const copyIcon = copyButton?.querySelector<SVGElement>('svg');
        const arrowIcon = mailAction?.querySelector<SVGElement>('svg');
        if (
          !capsule
          || ribbons.length !== 2
          || !copyButton
          || !mailAction
          || !copyIcon
          || !arrowIcon
        ) return null;

        const style = getComputedStyle(capsule);
        const capsuleBox = capsule.getBoundingClientRect();
        const copyBox = copyButton.getBoundingClientRect();
        const mailBox = mailAction.getBoundingClientRect();
        const copyIconBox = copyIcon.getBoundingClientRect();
        const arrowIconBox = arrowIcon.getBoundingClientRect();

        return {
          borderTopWidth: style.borderTopWidth,
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor,
          ribbonAnimations: ribbons.map((ribbon) => getComputedStyle(ribbon).animationName),
          footerCanvasCount: element.querySelectorAll('canvas').length,
          controls: {
            copy: { width: copyBox.width, height: copyBox.height },
            mail: { width: mailBox.width, height: mailBox.height },
            copyIcon: { width: copyIconBox.width, height: copyIconBox.height },
            arrowIcon: { width: arrowIconBox.width, height: arrowIconBox.height },
            copyCenterOffset: copyBox.y + copyBox.height / 2
              - (capsuleBox.y + capsuleBox.height / 2),
            mailCenterOffset: mailBox.y + mailBox.height / 2
              - (capsuleBox.y + capsuleBox.height / 2),
          },
        };
      });

      expect(visualContract).not.toBeNull();
      expect(visualContract?.borderTopWidth).toBe('0px');
      expect(visualContract?.borderRadius).toBe('999px');
      expect(visualContract?.backgroundColor).toBe('rgba(34, 27, 38, 0.58)');
      expect(visualContract?.ribbonAnimations).toHaveLength(2);
      expect(visualContract?.ribbonAnimations).not.toContain('none');
      expect(visualContract?.footerCanvasCount).toBe(0);
      expect(visualContract?.controls.copy).toEqual({ width: 40, height: 40 });
      expect(visualContract?.controls.mail).toEqual({ width: 40, height: 40 });
      expect(visualContract?.controls.copyIcon).toEqual({ width: 18, height: 18 });
      expect(visualContract?.controls.arrowIcon).toEqual({ width: 19, height: 19 });
      expect(
        Math.abs(visualContract?.controls.copyCenterOffset ?? Number.POSITIVE_INFINITY),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(visualContract?.controls.mailCenterOffset ?? Number.POSITIVE_INFINITY),
      ).toBeLessThanOrEqual(1);
    });
  }

  test('reduced motion freezes every decorative liquid layer', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'domcontentloaded' });

    const layers = page.locator('[data-footer-liquid]');
    await expect(layers).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(layers.nth(index)).toHaveCSS('animation-name', 'none');
    }
  });

  test('localized content routes share the liquid Footer', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Route coverage is viewport-independent.');

    for (const path of [
      '/en/about/',
      '/zh/work/call-agent/',
      '/en/build/stt-demo/',
    ]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const footer = page.locator('[data-site-footer]');
      const contacts = footer.locator('[data-footer-contacts]');
      await expect(footer).toHaveCount(1);
      await expect(contacts).toBeVisible();
      await expect(contacts.locator('[data-contact-capsule]')).toHaveCount(2);
      await expect(contacts.getByText('flydesigner-yj')).toBeVisible();
      await expect(footer.locator('[data-footer-liquid]')).toHaveCount(3);
    }
  });
});
