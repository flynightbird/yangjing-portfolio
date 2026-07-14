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
