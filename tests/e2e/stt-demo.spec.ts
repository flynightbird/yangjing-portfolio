import { expect, test, type Page } from '@playwright/test';

test.setTimeout(60_000);

function observeRuntime(page: Page, baseURL: string | undefined) {
  if (!baseURL) throw new Error('STT E2E requires a configured base URL');

  const consoleErrors: string[] = [];
  const failedLocalRequests: string[] = [];
  const localOrigin = new URL(baseURL).origin;

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin === localOrigin) {
      failedLocalRequests.push(
        `${requestUrl.pathname}: ${request.failure()?.errorText ?? 'failed'}`,
      );
    }
  });

  return { consoleErrors, failedLocalRequests };
}

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} STT Build Lab`, () => {
    test('renders the truthful case, provenance, and correct actions', async ({
      page,
    }, testInfo) => {
      const runtime = observeRuntime(page, testInfo.project.use.baseURL);
      const embeddedDemoResponse =
        testInfo.project.name === 'desktop'
          ? page.waitForResponse((candidate) => {
              const url = new URL(candidate.url());
              return (
                url.pathname === '/demos/stt-demo/index.html' &&
                candidate.request().resourceType() === 'document'
              );
            })
          : null;
      const response = await page.goto(`/${locale}/build/stt-demo/`, {
        waitUntil: 'domcontentloaded',
      });

      expect(response?.status()).toBe(200);
      await expect(page.locator('article[data-case-study]')).toBeVisible();
      await expect(page.locator('article[data-case-study] > section')).toHaveCount(5);
      await expect(page.getByText('e5e840a').first()).toBeVisible();
      await expect(
        page.getByRole('link', {
          name: locale === 'zh' ? '打开原型' : 'Open prototype',
        }),
      ).toHaveAttribute('href', '/demos/stt-demo/index.html');
      const directResponse = await page.request.get(
        '/demos/stt-demo/index.html',
      );
      expect(directResponse.status()).toBe(200);
      expect((await directResponse.text()).trim()).not.toBe('');
      await expect(
        page.getByRole('link', {
          name: locale === 'zh' ? /查看源代码/ : /View source/,
        }),
      ).toHaveAttribute(
        'href',
        'https://github.com/flynightbird/stt-demo/tree/e5e840a',
      );
      await expect(page.locator('#evidence-boundary')).toContainText(
        locale === 'zh' ? '不包含实际 STT 流' : 'No actual STT stream',
      );

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
      if (embeddedDemoResponse) {
        expect((await embeddedDemoResponse).status()).toBe(200);
        const prototype = page.frameLocator(
          'iframe[src="/demos/stt-demo/index.html"]',
        );
        await expect
          .poll(() =>
            prototype.locator('html').evaluate(() => document.readyState),
          )
          .toBe('complete');
        await expect(prototype.locator('#pageLanding')).toBeVisible();
      }
      expect(runtime.failedLocalRequests).toEqual([]);
      expect(runtime.consoleErrors).toEqual([]);
    });

    test('uses the iframe on desktop and the pinned poster on mobile', async ({
      page,
    }, testInfo) => {
      await page.goto(`/${locale}/build/stt-demo/`, {
        waitUntil: 'domcontentloaded',
      });

      const frame = page.locator('iframe[src="/demos/stt-demo/index.html"]');
      const fallback = page.locator('[data-demo-fallback]');
      if (testInfo.project.name === 'mobile') {
        await expect(frame).toBeHidden();
        await expect(fallback).toBeVisible();
        const poster = fallback.getByRole('img');
        await expect(poster).toHaveJSProperty('complete', true);
        expect(
          await poster.evaluate((image) => (image as HTMLImageElement).naturalWidth),
        ).toBeGreaterThan(0);
      } else {
        await expect(frame).toBeVisible();
        await expect(fallback).toBeHidden();
        const prototype = page.frameLocator(
          'iframe[src="/demos/stt-demo/index.html"]',
        );
        await expect(prototype.locator('#pageLanding')).toBeVisible();
        await expect(prototype.locator('body')).not.toHaveText('');
      }
    });
  });
}

test('the direct pinned prototype loads a nonblank same-origin artifact', async ({
  page,
}, testInfo) => {
  const runtime = observeRuntime(page, testInfo.project.use.baseURL);
  const response = await page.goto('/demos/stt-demo/index.html', {
    waitUntil: 'networkidle',
  });

  expect(response?.status()).toBe(200);
  await expect(page.locator('#pageLanding')).toBeVisible();
  await expect(page.locator('body')).not.toHaveText('');
  const surface = await page.locator('body').screenshot();
  expect(surface.byteLength).toBeGreaterThan(1_000);
  expect(runtime.failedLocalRequests).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});

test('the normal demo primary action remains interactive', async ({ page }) => {
  await page.goto('/demos/stt-demo/index.html', {
    waitUntil: 'networkidle',
  });

  await expect(page.locator('html')).not.toHaveAttribute('data-stt-embed');
  await expect(page.locator('#pageLanding')).toBeVisible();
  await page.locator('#landCtaBtn').click();
  await expect(page.locator('body')).toHaveAttribute('data-page', 'product');
  await expect(page.locator('#pageLanding')).toBeHidden();
  await expect(page.locator('#pageProduct')).toBeVisible();
});

test('the direct stage embed is centered and preserves the complete composition', async ({
  page,
}, testInfo) => {
  const runtime = observeRuntime(page, testInfo.project.use.baseURL);
  const response = await page.goto(
    '/demos/stt-demo/index.html?embed=stage',
    { waitUntil: 'networkidle' },
  );

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('data-stt-embed', 'stage');
  const stage = page.locator('.land-visual');
  const snip = page.locator('.snip');
  const speaker = page.locator('.snip-speaker');
  const original = page.locator('.snip-original');
  const translation = page.locator('.snip-translation');
  const participantRail = page.locator('.snip-side');
  const dock = page.locator('.snip-dock');
  await expect(stage).toBeVisible();
  await expect(snip).toBeVisible();
  await expect(speaker).toBeVisible();
  await expect(original).toBeVisible();
  await expect(translation).toBeVisible();
  await expect(participantRail).toBeVisible();
  await expect(dock).toBeVisible();
  await expect(page.locator('.land-bar')).toBeHidden();
  await expect(page.locator('.land-copy')).toBeHidden();
  await expect(page.locator('#pageProduct')).toBeHidden();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  const viewport = page.viewportSize();
  const stageBox = await stage.boundingBox();
  const snipBox = await snip.boundingBox();
  const contentBoxes = await Promise.all(
    [speaker, original, translation, participantRail, dock].map((locator) =>
      locator.boundingBox(),
    ),
  );
  expect(viewport).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(snipBox).not.toBeNull();
  expect(contentBoxes).not.toContain(null);
  if (!viewport || !stageBox || !snipBox || contentBoxes.includes(null)) {
    return;
  }

  const expectedInset = viewport.width <= 600 ? 8 : 16;
  const horizontalInset = (viewport.width - stageBox.width) / 2;
  const verticalInset = (viewport.height - stageBox.height) / 2;
  expect(Math.abs(stageBox.x - horizontalInset)).toBeLessThanOrEqual(2);
  expect(Math.abs(stageBox.y - verticalInset)).toBeLessThanOrEqual(2);
  expect(stageBox.x).toBeGreaterThanOrEqual(expectedInset - 1);
  expect(viewport.width - stageBox.x - stageBox.width).toBeGreaterThanOrEqual(
    expectedInset - 1,
  );
  expect(stageBox.width).toBeGreaterThanOrEqual(
    viewport.width - (expectedInset + 2) * 2,
  );
  expect(stageBox.width / stageBox.height).toBeCloseTo(1000 / 560, 2);
  for (const childBox of contentBoxes) {
    if (!childBox) continue;
    expect(childBox.x).toBeGreaterThanOrEqual(snipBox.x - 1);
    expect(childBox.y).toBeGreaterThanOrEqual(snipBox.y - 1);
    expect(childBox.x + childBox.width).toBeLessThanOrEqual(
      snipBox.x + snipBox.width + 1,
    );
    expect(childBox.y + childBox.height).toBeLessThanOrEqual(
      snipBox.y + snipBox.height + 1,
    );
  }
  const scale = await page.locator('html').evaluate((element) =>
    Number(
      getComputedStyle(element).getPropertyValue('--stt-stage-scale').trim(),
    ),
  );
  expect(scale).toBeCloseTo(
    Math.min(
      (viewport.width - expectedInset * 2) / 1000,
      (viewport.height - expectedInset * 2) / 560,
    ),
    3,
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await testInfo.attach(`stt-stage-${testInfo.project.name}`, {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  expect(runtime.failedLocalRequests).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});

test('the stage timer shim uses isolated handles and supports both clear APIs', async ({
  page,
}) => {
  await page.goto('/demos/stt-demo/index.html?embed=stage', {
    waitUntil: 'networkidle',
  });

  const ids = await page.evaluate(() => {
    const state = {
      clearedByTimeout: 0,
      clearedByInterval: 0,
    };
    const nativeTimeoutId = window.setTimeout('void 0', 10_000);
    const timeoutClearedTimeoutId = window.setTimeout(() => {
      state.clearedByTimeout += 1;
    }, 10);
    const intervalClearedTimeoutId = window.setTimeout(() => {
      state.clearedByInterval += 1;
    }, 10);
    const timeoutClearedIntervalId = window.setInterval(() => {
      state.clearedByTimeout += 1;
    }, 10);
    const intervalClearedIntervalId = window.setInterval(() => {
      state.clearedByInterval += 1;
    }, 10);
    window.clearTimeout(nativeTimeoutId);
    window.clearTimeout(timeoutClearedTimeoutId);
    window.clearInterval(intervalClearedTimeoutId);
    window.clearTimeout(timeoutClearedIntervalId);
    window.clearInterval(intervalClearedIntervalId);
    window.postMessage(
      { type: 'stt-stage-playback', paused: false },
      location.origin,
    );
    Object.assign(window, { __sttTimerClearState: state });
    return {
      nativeTimeoutId,
      timeoutClearedTimeoutId,
      intervalClearedTimeoutId,
      timeoutClearedIntervalId,
      intervalClearedIntervalId,
    };
  });

  expect(ids.nativeTimeoutId).toBeGreaterThanOrEqual(0);
  expect(ids.timeoutClearedTimeoutId).toBeLessThan(0);
  expect(ids.intervalClearedTimeoutId).toBeLessThan(0);
  expect(ids.timeoutClearedIntervalId).toBeLessThan(0);
  expect(ids.intervalClearedIntervalId).toBeLessThan(0);
  await page.waitForTimeout(80);
  await expect.poll(() =>
    page.evaluate(() => (
      window as Window & {
        __sttTimerClearState: {
          clearedByTimeout: number;
          clearedByInterval: number;
        };
      }
    ).__sttTimerClearState),
  ).toEqual({ clearedByTimeout: 0, clearedByInterval: 0 });
});

test('the stage timer shim freezes functional one-shot timeouts while paused', async ({
  page,
}) => {
  await page.goto('/demos/stt-demo/index.html?embed=stage', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => {
    window.postMessage(
      { type: 'stt-stage-playback', paused: false },
      location.origin,
    );
  });
  await expect(page.locator('html')).toHaveAttribute('data-stt-playback', 'playing');

  const timeoutId = await page.evaluate(() => {
    const state = { runs: 0, correctThis: true, args: [] as unknown[] };
    const id = window.setTimeout(function (...args) {
      state.runs += 1;
      state.correctThis &&= this === window;
      state.args = args;
    }, 1_000, 'forwarded', 42);
    Object.assign(window, { __sttOneShotState: state });
    return id;
  });
  expect(timeoutId).toBeLessThan(0);

  await page.waitForTimeout(700);
  await page.evaluate(() => {
    window.postMessage(
      { type: 'stt-stage-playback', paused: true },
      location.origin,
    );
  });
  await expect(page.locator('html')).toHaveAttribute('data-stt-playback', 'paused');
  await page.waitForTimeout(1_200);
  expect(await page.evaluate(() => (
    window as Window & {
      __sttOneShotState: {
        runs: number;
        correctThis: boolean;
        args: unknown[];
      };
    }
  ).__sttOneShotState)).toEqual({ runs: 0, correctThis: true, args: [] });

  await page.evaluate(() => {
    window.postMessage(
      { type: 'stt-stage-playback', paused: false },
      location.origin,
    );
  });
  await expect.poll(() => page.evaluate(() => (
    window as Window & {
      __sttOneShotState: {
        runs: number;
        correctThis: boolean;
        args: unknown[];
      };
    }
  ).__sttOneShotState), {
    timeout: 600,
    intervals: [25, 50, 100],
  }).toEqual({
    runs: 1,
    correctThis: true,
    args: ['forwarded', 42],
  });
  await page.waitForTimeout(1_100);
  expect(await page.evaluate(() => (
    window as Window & { __sttOneShotState: { runs: number } }
  ).__sttOneShotState.runs)).toBe(1);
});

test('the stage timer shim preserves callback semantics after errors', async ({
  page,
}) => {
  const expectedErrors: string[] = [];
  page.on('pageerror', (error) => {
    if (error.message.includes('expected staged interval failure')) {
      expectedErrors.push(error.message);
    }
  });
  await page.goto('/demos/stt-demo/index.html?embed=stage', {
    waitUntil: 'networkidle',
  });

  await page.evaluate(() => {
    const state = { runs: 0, correctThis: true, args: [] as unknown[] };
    let intervalId = 0;
    intervalId = window.setInterval(function (...args) {
      state.runs += 1;
      state.correctThis &&= this === window;
      state.args = args;
      if (state.runs === 1) {
        throw new Error('expected staged interval failure');
      }
      window.clearInterval(intervalId);
    }, 10, 'forwarded', 42);
    Object.assign(window, { __sttTimerCallbackState: state });
    window.postMessage(
      { type: 'stt-stage-playback', paused: false },
      location.origin,
    );
  });

  await expect.poll(() => page.evaluate(() => (
    window as Window & {
      __sttTimerCallbackState: {
        runs: number;
        correctThis: boolean;
        args: unknown[];
      };
    }
  ).__sttTimerCallbackState)).toEqual({
    runs: 2,
    correctThis: true,
    args: ['forwarded', 42],
  });
  expect(expectedErrors).toEqual([
    expect.stringContaining('expected staged interval failure'),
  ]);
});

test('the normal demo leaves native timer functions untouched', async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, {
      __sttNativeTimerFunctions: [
        window.setInterval,
        window.clearInterval,
        window.setTimeout,
        window.clearTimeout,
      ],
    });
  });
  await page.goto('/demos/stt-demo/index.html', { waitUntil: 'networkidle' });

  await expect(page.locator('html')).not.toHaveAttribute('data-stt-embed');
  expect(await page.evaluate(() => {
    const original = (
      window as Window & { __sttNativeTimerFunctions: unknown[] }
    ).__sttNativeTimerFunctions;
    return original.every((timer, index) => timer === [
      window.setInterval,
      window.clearInterval,
      window.setTimeout,
      window.clearTimeout,
    ][index]);
  })).toBe(true);
});
