import { expect, test } from '@playwright/test';

const comparisonSelector = '[data-xuelang-home-comparison]';

async function centerComparison(page: import('@playwright/test').Page) {
  await page.locator(comparisonSelector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
      behavior: 'instant',
    });
  });
}

test.describe('Xuelang homepage comparison', () => {
  test('runs four auto legs once and returns to its initial position', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical desktop motion contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const comparison = page.locator(comparisonSelector);
    const observedLegs = await comparison.evaluate((element) => {
      const legs: string[] = [];
      (window as typeof window & { __xuelangLegs?: string[] }).__xuelangLegs = legs;
      new MutationObserver(() => {
        const leg = element.getAttribute('data-auto-leg');
        if (leg && legs.at(-1) !== leg) legs.push(leg);
      }).observe(element, { attributes: true, attributeFilter: ['data-auto-leg'] });
      return legs;
    });
    expect(observedLegs).toEqual([]);

    await centerComparison(page);
    await expect(comparison).toHaveAttribute('data-auto-state', 'running');
    await expect(comparison).toHaveAttribute('data-auto-state', 'complete', { timeout: 5000 });
    await expect(comparison).toHaveAttribute('data-auto-leg', '4');
    await expect(comparison.getByRole('slider')).toHaveValue('38');
    expect(
      await page.evaluate(() =>
        (window as typeof window & { __xuelangLegs?: string[] }).__xuelangLegs,
      ),
    ).toEqual(['1', '2', '3', '4']);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await centerComparison(page);
    await page.waitForTimeout(900);
    await expect(comparison).toHaveAttribute('data-auto-state', 'complete');
    await expect(comparison).toHaveAttribute('data-auto-leg', '4');
  });

  test('deliberate pointer and keyboard input cancel auto motion and remain usable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical desktop input contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });
    await centerComparison(page);

    const comparison = page.locator(comparisonSelector);
    const slider = comparison.getByRole('slider');
    await expect(comparison).toHaveAttribute('data-auto-state', 'running');
    const box = await slider.boundingBox();
    if (!box) throw new Error('Missing comparison control bounds');
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
    await expect(comparison).toHaveAttribute('data-auto-state', 'cancelled');
    expect(Number(await slider.inputValue())).toBeGreaterThan(60);

    await slider.focus();
    await slider.press('End');
    await expect(comparison).toHaveAttribute('data-auto-state', 'cancelled');
    await expect(slider).toHaveValue('96');
    await slider.press('ArrowLeft');
    await expect(slider).toHaveValue('93');
    await page.waitForTimeout(3000);
    await expect(comparison).toHaveAttribute('data-auto-state', 'cancelled');
    await expect(slider).toHaveValue('93');
  });

  test('allows a vertical touch gesture without moving the divider or overflowing', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Real touch input contract.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const comparison = page.locator(comparisonSelector);
    await comparison.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - 180, behavior: 'instant' });
    });
    const box = await comparison.boundingBox();
    if (!box) throw new Error('Missing comparison bounds');
    const slider = comparison.getByRole('slider');
    const before = await page.evaluate(() => window.scrollY);
    const session = await page.context().newCDPSession(page);
    const x = box.x + box.width * 0.75;
    const startY = Math.min(box.y + box.height * 0.72, 700);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y: startY }],
    });
    for (let offset = 40; offset <= 240; offset += 40) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: startY - offset }],
      });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100);
    await expect(slider).toHaveValue('38');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );

    const updatedBox = await comparison.boundingBox();
    if (!updatedBox) throw new Error('Missing comparison bounds after scroll');
    const dragY = updatedBox.y + updatedBox.height / 2;
    const dragStartX = updatedBox.x + updatedBox.width * 0.38;
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: dragStartX, y: dragY }],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: dragStartX + 90, y: dragY }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect(Number(await slider.inputValue())).toBeGreaterThan(50);
  });

  test('disables auto motion for reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical reduced-motion contract.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });
    await centerComparison(page);

    const comparison = page.locator(comparisonSelector);
    await expect(comparison).toHaveAttribute('data-auto-state', 'disabled');
    await page.waitForTimeout(3200);
    await expect(comparison).toHaveAttribute('data-auto-state', 'disabled');
    await expect(comparison).toHaveAttribute('data-auto-leg', '0');
    await expect(comparison.getByRole('slider')).toHaveValue('38');
  });
});
