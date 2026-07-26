import { expect, test } from '@playwright/test';

const orderedSources = [
  '/images/archive/details/tangping/06.jpg',
  '/images/archive/details/tangping/10.jpg',
  '/images/archive/details/tangping/11.jpg',
  '/images/archive/details/tangping/23.jpg',
  '/images/archive/details/tangping/24.jpg',
  '/images/archive/details/tangping/51.jpg',
  '/images/archive/details/tangping/50.jpg',
] as const;

test.describe('Tangping archive lightbox', () => {
  test('loads the ordered gallery on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop gallery navigation check');

    await page.goto('/zh/', { waitUntil: 'networkidle' });
    const archive = page.locator('[data-archive-carousel]');
    await archive.scrollIntoViewIfNeeded();
    await archive.getByRole('button', { name: '打开项目图片: 躺平' }).click();

    const dialog = page.getByRole('dialog', { name: /躺平/ });
    const image = dialog.locator('[data-gallery-desktop] img');
    const next = dialog.getByRole('button', { name: '下一张图片' });
    await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('01 / 07');

    for (let index = 0; index < orderedSources.length; index += 1) {
      await expect(image).toHaveAttribute('src', orderedSources[index]);
      await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
      if (index < orderedSources.length - 1) await next.click();
    }

    await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('07 / 07');
    await expect(next).toBeDisabled();
  });

  test('loads all seven gallery images on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile gallery stack check');

    await page.goto('/zh/', { waitUntil: 'networkidle' });
    const archive = page.locator('[data-archive-carousel]');
    await archive.scrollIntoViewIfNeeded();
    await archive.getByRole('button', { name: '打开项目图片: 躺平' }).click();

    const images = page.locator('[data-gallery-mobile] img');
    await expect(images).toHaveCount(7);
    await expect
      .poll(() =>
        images.evaluateAll((nodes) =>
          nodes.every(
            (node) =>
              (node as HTMLImageElement).complete
              && (node as HTMLImageElement).naturalWidth > 0,
          ),
        ),
      )
      .toBe(true);
    expect(await images.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src')))).toEqual(
      orderedSources,
    );
  });
});
