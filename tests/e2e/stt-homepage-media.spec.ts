import { expect, test, type Page, type Route } from '@playwright/test';

const fullDemoPath = '/demos/stt-demo/index.html';
const stageEmbedUrl = /\/demos\/stt-demo\/index\.html\?embed=stage$/;
const sttProjectSelector = '[data-project-id="stt-demo"]';
const sttMediaSelector = `${sttProjectSelector} [data-stt-media-stage]`;

test.setTimeout(60_000);

function expectStableBox(
  before: { x: number; y: number; width: number; height: number } | null,
  after: { x: number; y: number; width: number; height: number } | null,
) {
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  if (!before || !after) return;

  for (const dimension of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(after[dimension] - before[dimension])).toBeLessThanOrEqual(1);
  }
}

async function holdStageEmbed(page: Page) {
  let releaseRequest = () => undefined;
  let markRequestHeld = () => undefined;
  const requestHeld = new Promise<void>((resolve) => {
    markRequestHeld = resolve;
  });
  const release = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  const handler = async (route: Route) => {
    markRequestHeld();
    await release;
    await route.continue();
  };
  await page.route(stageEmbedUrl, handler);

  return {
    requestHeld,
    releaseRequest,
    cleanup: async () => {
      releaseRequest();
      await page.unroute(stageEmbedUrl, handler);
    },
  };
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
    const { requestHeld, releaseRequest, cleanup } = await holdStageEmbed(page);

    try {
      await page.goto('/en/', { waitUntil: 'domcontentloaded' });

      const project = page.locator(sttProjectSelector);
      const media = page.locator(sttMediaSelector);
      await media.scrollIntoViewIfNeeded();
      await requestHeld;

      const browserWindow = media.locator('[data-stt-browser-window]');
      const fallback = media.locator('[data-stt-stage-fallback]');
      const frame = media.locator('iframe[src="/demos/stt-demo/index.html?embed=stage"]');
      const scan = media.locator('[data-stt-stage-scan]');
      const viewport = media.locator('[data-stt-stage-viewport]');

      await expect(media).toHaveAttribute('data-stt-ready', 'false');
      await expect(fallback).toHaveCSS('opacity', '1');
      await expect(frame).toHaveCSS('opacity', '0');
      await expect(frame).toHaveCSS('pointer-events', 'none');
      await expect(frame).toHaveAttribute('aria-hidden', 'true');
      await expect(frame).toHaveAttribute('tabindex', '-1');
      await expect(media).toHaveAttribute('href', fullDemoPath);
      await expect(project.locator('a')).toHaveCount(2);
      await expect(project.locator('[data-stt-copy] a')).toHaveAttribute(
        'href',
        fullDemoPath,
      );
      expect(await media.evaluate((element) => element.querySelectorAll('a').length)).toBe(0);

      const browserBoxBefore = await browserWindow.boundingBox();
      const viewportBox = await viewport.boundingBox();
      expect(viewportBox).not.toBeNull();
      expect((viewportBox?.width ?? 0) / (viewportBox?.height ?? 1)).toBeCloseTo(2, 2);

      releaseRequest();
      await expect(media).toHaveAttribute('data-stt-ready', 'true');
      await expect(fallback).toHaveCSS('opacity', '0');
      await expect(frame).toHaveCSS('opacity', '1');
      expectStableBox(browserBoxBefore, await browserWindow.boundingBox());
      expectStableBox(viewportBox, await viewport.boundingBox());

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
      await cleanup();
    }
  });

  test('plays the scan once without resetting readiness across visibility changes', async ({
    page,
  }) => {
    const { requestHeld, releaseRequest, cleanup } = await holdStageEmbed(page);

    try {
      await page.goto('/en/', { waitUntil: 'domcontentloaded' });
      const media = page.locator(sttMediaSelector);
      await media.scrollIntoViewIfNeeded();
      await requestHeld;

      const scan = media.locator('[data-stt-stage-scan]');
      await scan.evaluate((element) => {
        const observedWindow = window as Window & { __sttScanStarts?: string[] };
        observedWindow.__sttScanStarts = [];
        element.addEventListener('animationstart', (event) => {
          observedWindow.__sttScanStarts?.push(
            (event as AnimationEvent).animationName,
          );
        });
      });

      releaseRequest();
      await expect(media).toHaveAttribute('data-stt-ready', 'true');
      await expect
        .poll(() =>
          page.evaluate(
            () => (window as Window & { __sttScanStarts?: string[] }).__sttScanStarts,
          ),
        )
        .toHaveLength(1);
      expect(
        await page.evaluate(
          () => (window as Window & { __sttScanStarts?: string[] }).__sttScanStarts?.[0],
        ),
      ).toContain('stt-stage-scan');

      const embedRoot = page
        .frameLocator('iframe[src="/demos/stt-demo/index.html?embed=stage"]')
        .locator('html');
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'playing');
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'paused');
      await media.scrollIntoViewIfNeeded();
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'playing');
      await expect(media).toHaveAttribute('data-stt-ready', 'true');
      await page.waitForTimeout(850);
      expect(
        await page.evaluate(
          () => (window as Window & { __sttScanStarts?: string[] }).__sttScanStarts,
        ),
      ).toHaveLength(1);
    } finally {
      await cleanup();
    }
  });

  test('pauses stage motion offscreen and resumes the remaining transcript interval', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'domcontentloaded' });

    const media = page.locator(sttMediaSelector);
    await media.scrollIntoViewIfNeeded();
    await expect(media).toHaveAttribute('data-stt-ready', 'true');

    const stage = page.frameLocator(
      'iframe[src="/demos/stt-demo/index.html?embed=stage"]',
    );
    const embedRoot = stage.locator('html');
    const original = stage.locator('.snip-original');
    await expect(embedRoot).toHaveAttribute('data-stt-playback', 'playing');
    const initialOriginal = await original.innerHTML();
    await expect
      .poll(() => original.innerHTML(), { timeout: 12_500 })
      .not.toBe(initialOriginal);
    const cycleOriginal = await original.innerHTML();

    await page.waitForTimeout(2_400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(embedRoot).toHaveAttribute('data-stt-playback', 'paused');
    const pausedOriginal = await original.innerHTML();
    expect(pausedOriginal).toBe(cycleOriginal);
    expect(
      await stage.locator('.snip-wave span').evaluateAll((elements) =>
        elements.every(
          (element) => getComputedStyle(element).animationPlayState === 'paused',
        ),
      ),
    ).toBe(true);

    await page.waitForTimeout(5_400);
    expect(await original.innerHTML()).toBe(pausedOriginal);
    expect(
      await stage.locator('.snip-wave span').evaluateAll((elements) =>
        elements.every(
          (element) => getComputedStyle(element).animationPlayState === 'paused',
        ),
      ),
    ).toBe(true);

    await media.scrollIntoViewIfNeeded();
    await expect(embedRoot).toHaveAttribute('data-stt-playback', 'playing');
    const resumedAt = Date.now();
    await expect
      .poll(() => original.innerHTML(), { timeout: 4_400 })
      .not.toBe(pausedOriginal);
    expect(Date.now() - resumedAt).toBeLessThan(4_400);
  });

  test('keeps the linked fallback available when the stage embed request fails', async ({
    page,
  }) => {
    let markRequestFailed = () => undefined;
    const requestFailed = new Promise<void>((resolve) => {
      markRequestFailed = resolve;
    });
    const handler = async (route: Route) => {
      await route.abort('failed');
      markRequestFailed();
    };
    await page.route(stageEmbedUrl, handler);

    try {
      await page.goto('/en/', { waitUntil: 'domcontentloaded' });
      const project = page.locator(sttProjectSelector);
      const media = page.locator(sttMediaSelector);
      await media.scrollIntoViewIfNeeded();
      await requestFailed;

      await expect(media).toHaveAttribute('data-stt-ready', 'false');
      await expect(media.locator('[data-stt-stage-fallback]')).toHaveCSS('opacity', '1');
      await expect(media).toHaveAttribute('href', fullDemoPath);
      await expect(project.locator('[data-stt-copy] a')).toHaveAttribute(
        'href',
        fullDemoPath,
      );
    } finally {
      await page.unroute(stageEmbedUrl, handler);
    }
  });

  test('keeps the static fallback under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const media = page.locator(sttMediaSelector);
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

    const media = page.locator(sttMediaSelector);
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
