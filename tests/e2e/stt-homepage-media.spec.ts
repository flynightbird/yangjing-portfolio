import path from 'node:path';

import { expect, test, type Locator, type Page, type Route } from '@playwright/test';

const fullDemoPath = '/demos/stt-demo/index.html';
const stageEmbedUrl = /\/demos\/stt-demo\/index\.html\?embed=stage$/;
const sttProjectSelector = '[data-project-id="stt-demo"]';
const sttMediaSelector = `${sttProjectSelector} [data-stt-media-stage]`;

interface ElementBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function relativeBox(child: ElementBox | null, parent: ElementBox | null) {
  expect(child).not.toBeNull();
  expect(parent).not.toBeNull();
  if (!child || !parent) return null;

  return {
    x: child.x - parent.x,
    y: child.y - parent.y,
    width: child.width,
    height: child.height,
  };
}

function expectStableBox(before: ElementBox | null, after: ElementBox | null) {
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  if (!before || !after) return;

  for (const dimension of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(after[dimension] - before[dimension])).toBeLessThanOrEqual(1);
  }
}

async function offsetBox(locator: Locator): Promise<ElementBox> {
  return locator.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    return {
      x: htmlElement.offsetLeft,
      y: htmlElement.offsetTop,
      width: htmlElement.offsetWidth,
      height: htmlElement.offsetHeight,
    };
  });
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
    await route.fulfill({
      contentType: 'text/html',
      path: path.join(process.cwd(), 'public/demos/stt-demo/index.html'),
    });
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

      await expect(fallback).toHaveJSProperty('complete', true);
      expect(
        await fallback.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const browserBoxBefore = await browserWindow.boundingBox();
      const viewportBox = await viewport.boundingBox();
      const browserOffsetsBefore = await offsetBox(browserWindow);
      const viewportOffsetsBefore = await offsetBox(viewport);
      expect(viewportBox).not.toBeNull();
      expect((viewportBox?.width ?? 0) / (viewportBox?.height ?? 1)).toBeCloseTo(2, 2);
      const relativeViewportBefore = relativeBox(viewportBox, browserBoxBefore);

      releaseRequest();
      await expect(media).toHaveAttribute('data-stt-ready', 'true');
      await expect(fallback).toHaveCSS('opacity', '0');
      await expect(frame).toHaveCSS('opacity', '1');
      const embed = page.frameLocator(
        'iframe[src="/demos/stt-demo/index.html?embed=stage"]',
      );
      const fill = await embed.locator('.land-visual').evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const selectors = [
          '.snip-speaker',
          '.snip-original',
          '.snip-translation',
          '.snip-side',
          '.snip-dock',
        ];
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          viewportWidth: document.documentElement.clientWidth,
          viewportHeight: document.documentElement.clientHeight,
          content: selectors.map((selector) => {
            const childRect = document.querySelector(selector)?.getBoundingClientRect();
            return childRect
              ? {
                  selector,
                  x: childRect.x,
                  y: childRect.y,
                  width: childRect.width,
                  height: childRect.height,
                }
              : null;
          }),
        };
      });
      expect(fill.x).toBeCloseTo(0, 0);
      expect(fill.y).toBeCloseTo(0, 0);
      expect(fill.width).toBeCloseTo(fill.viewportWidth, 0);
      expect(fill.height).toBeCloseTo(fill.viewportHeight, 0);
      expect(fill.content).not.toContain(null);
      for (const child of fill.content) {
        if (!child) continue;
        expect(child.x, child.selector).toBeGreaterThanOrEqual(-1);
        expect(child.y, child.selector).toBeGreaterThanOrEqual(-1);
        expect(child.x + child.width, child.selector).toBeLessThanOrEqual(
          fill.viewportWidth + 1,
        );
        expect(child.y + child.height, child.selector).toBeLessThanOrEqual(
          fill.viewportHeight + 1,
        );
      }
      expectStableBox(browserOffsetsBefore, await offsetBox(browserWindow));
      expectStableBox(viewportOffsetsBefore, await offsetBox(viewport));
      expectStableBox(
        relativeViewportBefore,
        relativeBox(
          await viewport.boundingBox(),
          await browserWindow.boundingBox(),
        ),
      );

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
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Scan lifecycle runs once on desktop.');
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

  test('pauses stage motion offscreen and resumes the transcript cycle', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Timer lifecycle is viewport-independent.');
    testInfo.setTimeout(45_000);
    const { requestHeld, releaseRequest, cleanup } = await holdStageEmbed(page);

    try {
      await page.goto('/en/', { waitUntil: 'domcontentloaded' });

      const media = page.locator(sttMediaSelector);
      await media.scrollIntoViewIfNeeded();
      await requestHeld;
      releaseRequest();
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

      await page.waitForTimeout(4_000);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'paused');
      const pausedOriginal = await original.innerHTML();
      expect(
        await stage.locator('.snip-wave span').evaluateAll((elements) =>
          elements.every(
            (element) => getComputedStyle(element).animationPlayState === 'paused',
          ),
        ),
      ).toBe(true);

      await page.waitForTimeout(8_000);
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
      await expect
        .poll(() => original.innerHTML(), { timeout: 12_500 })
        .not.toBe(pausedOriginal);
    } finally {
      await cleanup();
    }
  });

  test('freezes a pending transcript fade timeout while the stage is paused', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Timer lifecycle is viewport-independent.');
    testInfo.setTimeout(30_000);
    const { requestHeld, releaseRequest, cleanup } = await holdStageEmbed(page);

    try {
      await page.goto('/en/', { waitUntil: 'domcontentloaded' });
      const media = page.locator(sttMediaSelector);
      await media.scrollIntoViewIfNeeded();
      await requestHeld;
      releaseRequest();
      await expect(media).toHaveAttribute('data-stt-ready', 'true');

      const stage = page.frameLocator(
        'iframe[src="/demos/stt-demo/index.html?embed=stage"]',
      );
      const embedRoot = stage.locator('html');
      const original = stage.locator('.snip-original');
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'playing');
      await original.evaluate((element) => {
        const observedWindow = window as Window & {
          __sttPendingFadeObserved?: boolean;
        };
        observedWindow.__sttPendingFadeObserved = false;
        const observer = new MutationObserver(() => {
          if (
            observedWindow.__sttPendingFadeObserved ||
            (element as HTMLElement).style.opacity !== '0'
          ) {
            return;
          }
          observedWindow.__sttPendingFadeObserved = true;
          observer.disconnect();
          parent.scrollTo({ top: 0, behavior: 'instant' });
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: ['style'],
        });
      });

      await expect
        .poll(
          () =>
            original.evaluate(
              () =>
                (window as Window & { __sttPendingFadeObserved?: boolean })
                  .__sttPendingFadeObserved,
            ),
          { timeout: 7_000 },
        )
        .toBe(true);
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'paused');
      const pausedText = await original.innerHTML();
      expect(await original.evaluate((element) => element.style.opacity)).toBe('0');

      await page.waitForTimeout(650);
      expect(await original.innerHTML()).toBe(pausedText);
      expect(await original.evaluate((element) => element.style.opacity)).toBe('0');
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'paused');

      await media.scrollIntoViewIfNeeded();
      await expect(embedRoot).toHaveAttribute('data-stt-playback', 'playing');
      await expect
        .poll(() => original.evaluate((element) => element.style.opacity), {
          timeout: 1_000,
        })
        .toBe('1');
    } finally {
      await cleanup();
    }
  });

  test('keeps the linked fallback available when the stage embed request fails', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The failure branch is viewport-independent.');
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
      const frame = media.locator('iframe[src="/demos/stt-demo/index.html?embed=stage"]');
      await expect(frame).toHaveCSS('opacity', '0');
      await expect(frame).toHaveCSS('pointer-events', 'none');
      await expect(frame).toHaveAttribute('aria-hidden', 'true');
      await expect(frame).toHaveAttribute('tabindex', '-1');
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
