import { expect, test, type Page } from '@playwright/test';

const stageEmbedUrl = /\/demos\/stt-demo\/index\.html\?embed=stage$/;

async function holdStageEmbed(page: Page) {
  let releaseRequest = () => undefined;
  let markRequestHeld = () => undefined;
  const requestHeld = new Promise<void>((resolve) => {
    markRequestHeld = resolve;
  });
  const release = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  await page.route(stageEmbedUrl, async (route) => {
    markRequestHeld();
    await release;
    await route.continue();
  });

  return { requestHeld, releaseRequest };
}

test.describe('STT homepage live-stage presentation', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !['desktop', 'mobile'].includes(testInfo.project.name),
      'The STT stage presentation is covered at its desktop and compact bounds.',
    );
  });

  test('reserves the stage and crossfades only after valid embed readiness', async ({
    page,
  }) => {
    const { requestHeld, releaseRequest } = await holdStageEmbed(page);

    try {
      await page.goto('/en/', { waitUntil: 'domcontentloaded' });

      const media = page.locator('[data-project-id="stt-demo"] [data-stt-media-stage]');
      await media.scrollIntoViewIfNeeded();
      await requestHeld;

      const fallback = media.locator('[data-stt-stage-fallback]');
      const frame = media.locator('iframe[src="/demos/stt-demo/index.html?embed=stage"]');
      const scan = media.locator('[data-stt-stage-scan]');
      const viewport = fallback.locator('..');

      await expect(media).toHaveAttribute('data-stt-ready', 'false');
      await expect(fallback).toHaveCSS('opacity', '1');
      await expect(frame).toHaveCSS('opacity', '0');
      await expect(frame).toHaveCSS('pointer-events', 'none');

      const viewportBox = await viewport.boundingBox();
      expect(viewportBox).not.toBeNull();
      expect((viewportBox?.width ?? 0) / (viewportBox?.height ?? 1)).toBeCloseTo(2, 2);

      releaseRequest();
      await expect(media).toHaveAttribute('data-stt-ready', 'true');
      await expect(fallback).toHaveCSS('opacity', '0');
      await expect(frame).toHaveCSS('opacity', '1');

      const scanAnimation = await scan.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          duration: style.animationDuration,
          iterationCount: style.animationIterationCount,
          name: style.animationName,
          pointerEvents: style.pointerEvents,
        };
      });
      expect(scanAnimation.name).not.toBe('none');
      expect(Number.parseFloat(scanAnimation.duration) * 1000).toBeCloseTo(700, -1);
      expect(scanAnimation.iterationCount).toBe('1');
      expect(scanAnimation.pointerEvents).toBe('none');

      await expect(media).toHaveCSS('border-radius', '20px');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    } finally {
      releaseRequest();
    }
  });

  test('keeps the static fallback under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const media = page.locator('[data-project-id="stt-demo"] [data-stt-media-stage]');
    const browserWindow = media.locator('[data-stt-browser-window]');
    const fallback = media.locator('[data-stt-stage-fallback]');
    const scan = media.locator('[data-stt-stage-scan]');
    await media.scrollIntoViewIfNeeded();

    await expect(media.locator('iframe')).toHaveCount(0);
    await expect(fallback).toHaveCSS('opacity', '1');
    await expect(fallback).toHaveCSS('transition-duration', '0s');
    await expect(scan).toHaveCSS('display', 'none');

    const restingTransform = await browserWindow.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    const mediaBox = await media.boundingBox();
    expect(mediaBox).not.toBeNull();
    await media.hover({ position: { x: (mediaBox?.width ?? 320) - 16, y: 24 } });
    await expect(browserWindow).toHaveCSS('transform', restingTransform);
  });

  test('keeps pointer drift on the outer window without zooming the fallback', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Pointer drift is a desktop interaction.');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const media = page.locator('[data-project-id="stt-demo"] [data-stt-media-stage]');
    const browserWindow = media.locator('[data-stt-browser-window]');
    const fallback = media.locator('[data-stt-stage-fallback]');
    await media.scrollIntoViewIfNeeded();
    const mediaBox = await media.boundingBox();
    expect(mediaBox).not.toBeNull();

    const restingTransform = await browserWindow.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    await media.hover({ position: { x: (mediaBox?.width ?? 400) - 24, y: 36 } });
    await expect
      .poll(() => browserWindow.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(restingTransform);
    await expect(fallback).toHaveCSS('transform', 'none');

    await page.mouse.move(24, 24);
    await expect
      .poll(() => browserWindow.evaluate((element) => getComputedStyle(element).transform))
      .toBe(restingTransform);
  });
});
