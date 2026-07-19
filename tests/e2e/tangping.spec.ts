import { expect, test } from '@playwright/test';

const frameIds = ['6', '10', '11', '20'];

test.describe('Tangping visual detail', () => {
  test('opens the Chinese detail from the Visual Archive card', async ({ page }) => {
    await page.goto('/zh/', { waitUntil: 'networkidle' });

    const archive = page.locator('[data-archive-carousel]');
    await archive.scrollIntoViewIfNeeded();
    await archive.getByRole('link', { name: '查看项目：躺平' }).click();

    await expect(page).toHaveURL(/\/zh\/work\/tangping\/$/);
    await expect(page.getByRole('heading', { level: 1, name: '躺平设计家' })).toBeVisible();
  });

  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} renders the localized cover and numeric frame sequence`, async ({ page }) => {
      await page.goto(`/${locale}/work/tangping/`, { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', {
        level: 1,
        name: locale === 'zh' ? '躺平设计家' : 'Tangping Designer',
      })).toBeVisible();

      const frames = page.locator('[data-tangping-frame]');
      await expect(frames).toHaveCount(4);
      expect(await frames.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-frame-id')))).toEqual(frameIds);
      await expect(page.locator('img[src*="reference-"]')).toHaveCount(0);
    });
  }

  test('keeps all frames equal-width, contiguous, and free of page overflow', async ({ page }) => {
    await page.goto('/zh/work/tangping/', { waitUntil: 'networkidle' });

    const boxes = await page.locator('[data-tangping-frame]').evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { top: box.top, width: box.width, height: box.height };
      }),
    );

    expect(new Set(boxes.map(({ width }) => Math.round(width))).size).toBe(1);
    expect(
      boxes.slice(1).every((box, index) =>
        Math.abs(box.top - (boxes[index].top + boxes[index].height)) <= 1,
      ),
    ).toBe(true);
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )).toBe(true);
  });

  test('renders reveal layers immediately when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/work/tangping/', { waitUntil: 'networkidle' });

    const frames = page.locator('[data-tangping-frame]');
    await expect(frames).toHaveCount(4);
    expect(await frames.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-reveal-state')),
    )).toEqual(['revealed', 'revealed', 'revealed', 'revealed']);

    const motion = await page.locator('[data-reveal-layer]').evaluateAll((layers) =>
      layers.map((layer) => {
        const style = getComputedStyle(layer);
        return {
          animationDuration: style.animationDuration,
          transform: style.transform,
          transitionDuration: style.transitionDuration,
        };
      }),
    );
    expect([...new Set(motion.map(({ animationDuration }) => animationDuration))]).toEqual(['0s']);
    expect([...new Set(motion.map(({ transform }) => transform))]).toEqual(['none']);
    expect([...new Set(motion.map(({ transitionDuration }) => transitionDuration))]).toEqual(['0s']);
  });
});
