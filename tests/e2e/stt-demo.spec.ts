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
      const response = await page.goto(`/${locale}/build/stt-demo/`, {
        waitUntil: 'networkidle',
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
  const participantRail = page.locator('.snip-side');
  const dock = page.locator('.snip-dock');
  await expect(stage).toBeVisible();
  await expect(participantRail).toBeVisible();
  await expect(dock).toBeVisible();
  await expect(page.locator('.land-bar')).toBeHidden();
  await expect(page.locator('.land-copy')).toBeHidden();
  await expect(page.locator('#pageProduct')).toBeHidden();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  const viewport = page.viewportSize();
  const stageBox = await stage.boundingBox();
  const railBox = await participantRail.boundingBox();
  const dockBox = await dock.boundingBox();
  expect(viewport).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(railBox).not.toBeNull();
  expect(dockBox).not.toBeNull();
  if (!viewport || !stageBox || !railBox || !dockBox) return;

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

  for (const childBox of [railBox, dockBox]) {
    expect(childBox.x).toBeGreaterThanOrEqual(stageBox.x - 1);
    expect(childBox.y).toBeGreaterThanOrEqual(stageBox.y - 1);
    expect(childBox.x + childBox.width).toBeLessThanOrEqual(
      stageBox.x + stageBox.width + 1,
    );
    expect(childBox.y + childBox.height).toBeLessThanOrEqual(
      stageBox.y + stageBox.height + 1,
    );
  }
  expect(runtime.failedLocalRequests).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});
