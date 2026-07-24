import { expect, test } from '@playwright/test';

const comparisonSelector = '[data-xuelang-home-comparison]';

async function openHomepage(page: import('@playwright/test').Page) {
  await page.goto('/en/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const comparison = page.locator(comparisonSelector);
  await expect(comparison).toBeAttached({ timeout: 30_000 });
  await expect(comparison).toHaveAttribute('data-interaction-ready', 'true', { timeout: 30_000 });
}

async function centerComparison(page: import('@playwright/test').Page) {
  await page.locator(comparisonSelector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
      behavior: 'instant',
    });
  });
}

async function placeComparisonBottomAt(page: import('@playwright/test').Page, bottom: number) {
  const positionedBottom = await page.locator(comparisonSelector).evaluate((element, targetBottom) => {
    const rect = element.getBoundingClientRect();
    const documentTop = rect.top + window.scrollY;
    window.scrollTo({
      top: documentTop - (targetBottom - rect.height),
      behavior: 'instant',
    });
    return element.getBoundingClientRect().bottom;
  }, bottom);
  expect(Math.abs(positionedBottom - bottom)).toBeLessThanOrEqual(1);
}

async function waitForIntroPinLayout(page: import('@playwright/test').Page) {
  await expect.poll(() => page.locator('[data-intro-story]').evaluate((section) => {
    const pinSpacer = section.querySelector(':scope > .pin-spacer');
    if (!pinSpacer) return false;
    const expectedHeight = window.innerHeight * 3.4;
    return Math.abs(pinSpacer.getBoundingClientRect().height - expectedHeight) <= 1;
  })).toBe(true);
}

test.describe('Xuelang homepage comparison', () => {
  test.describe.configure({ timeout: 90_000 });

  test('starts only when its edge enters the central viewport band after resize', async ({
    page,
  }) => {
    await openHomepage(page);
    const comparison = page.locator(comparisonSelector);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing comparison viewport');
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.dataset.comparisonBoundarySpacer = 'true';
      spacer.style.height = `${window.innerHeight * 2}px`;
      spacer.setAttribute('aria-hidden', 'true');
      document.body.append(spacer);
    });

    const initialHeight = await page.evaluate(() => window.innerHeight);
    const initialInset = Math.round(initialHeight * 0.3);
    await expect(comparison).toHaveAttribute(
      'data-observer-root-margin',
      `-${initialInset}px 0px -${initialInset}px 0px`,
    );

    await page.setViewportSize({ width: viewport.width, height: viewport.height - 120 });
    await waitForIntroPinLayout(page);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const inset = Math.round(viewportHeight * 0.3);
    await expect(comparison).toHaveAttribute(
      'data-observer-root-margin',
      `-${inset}px 0px -${inset}px 0px`,
    );

    await placeComparisonBottomAt(page, inset - 20);
    await page.waitForTimeout(300);
    await expect(comparison).toHaveAttribute('data-auto-state', 'idle');

    await placeComparisonBottomAt(page, inset + 20);
    await expect
      .poll(() => comparison.getAttribute('data-auto-state'), { timeout: 10_000 })
      .toMatch(/^(running|complete)$/);
    await page.locator('[data-comparison-boundary-spacer]').evaluate((element) => element.remove());
  });

  test('runs four auto legs once and returns to its initial position', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical desktop motion contract.');
    await openHomepage(page);

    const comparison = page.locator(comparisonSelector);
    await comparison.evaluate((element) => {
      const trace: Array<{ leg: number; state: string; value: number; time: number }> = [];
      const slider = element.querySelector<HTMLInputElement>('input[type="range"]');
      (window as typeof window & { __xuelangTrace?: typeof trace }).__xuelangTrace = trace;
      new MutationObserver(() => {
        const leg = Number(element.getAttribute('data-auto-leg'));
        const state = element.getAttribute('data-auto-state') ?? '';
        const previous = trace.at(-1);
        const isNewLeg = state === 'running' && previous?.leg !== leg;
        const isCompletion = state === 'complete' && previous?.state !== 'complete';
        if ((isNewLeg || isCompletion) && slider) {
          trace.push({ leg, state, value: Number(slider.value), time: performance.now() });
        }
      }).observe(element, {
        attributes: true,
        attributeFilter: ['data-auto-leg', 'data-auto-state'],
      });
    });

    await centerComparison(page);
    await expect(comparison).toHaveAttribute('data-auto-state', 'running');
    await expect(comparison).toHaveAttribute('data-auto-state', 'complete', { timeout: 5000 });
    await expect(comparison).toHaveAttribute('data-auto-leg', '4');
    await expect(comparison.getByRole('slider')).toHaveValue('38');
    const trace = await page.evaluate(() =>
      (window as typeof window & {
        __xuelangTrace?: Array<{ leg: number; state: string; value: number; time: number }>;
      }).__xuelangTrace,
    );
    expect(trace?.map(({ value }) => value)).toEqual([38, 82, 18, 82, 38]);
    expect(trace?.map(({ leg }) => leg)).toEqual([1, 2, 3, 4, 4]);
    const durations = trace?.slice(1).map((entry, index) => entry.time - trace[index].time) ?? [];
    expect(durations).toHaveLength(4);
    for (const duration of durations) {
      expect(duration).toBeGreaterThanOrEqual(450);
      expect(duration).toBeLessThanOrEqual(1600);
    }
    expect(durations.reduce((total, duration) => total + duration, 0)).toBeLessThanOrEqual(6000);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await centerComparison(page);
    await page.waitForTimeout(900);
    await expect(comparison).toHaveAttribute('data-auto-state', 'complete');
    await expect(comparison).toHaveAttribute('data-auto-leg', '4');
  });

  test('deliberate pointer and keyboard input cancel auto motion and remain usable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical desktop input contract.');
    await openHomepage(page);

    const comparison = page.locator(comparisonSelector);
    const slider = comparison.getByRole('slider');
    const clickPoint = await comparison.evaluate((element) => {
      return new Promise<{ x: number; y: number }>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          observer.disconnect();
          reject(new Error('Comparison did not enter the running state'));
        }, 5_000);
        const capturePoint = () => {
          if (element.getAttribute('data-auto-state') !== 'running') return false;
          const rect = element.getBoundingClientRect();
          window.clearTimeout(timeout);
          observer.disconnect();
          resolve({ x: rect.left + rect.width * 0.75, y: rect.top + rect.height / 2 });
          return true;
        };
        const observer = new MutationObserver(capturePoint);
        observer.observe(element, { attributes: true, attributeFilter: ['data-auto-state'] });
        const rect = element.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
          behavior: 'instant',
        });
        capturePoint();
      });
    });
    await page.mouse.click(clickPoint.x, clickPoint.y);
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

  test('keyboard focus cancels running auto motion before input', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical desktop focus contract.');
    await openHomepage(page);
    await centerComparison(page);

    const comparison = page.locator(comparisonSelector);
    const slider = comparison.getByRole('slider');
    await expect(comparison).toHaveAttribute('data-auto-state', 'running');
    await slider.focus();
    await expect(comparison).toHaveAttribute('data-auto-state', 'cancelled');
    const focusedValue = await slider.inputValue();
    await page.waitForTimeout(900);
    await expect(slider).toHaveValue(focusedValue);
    await expect(slider).toBeFocused();
  });

  test('allows a vertical touch gesture without moving the divider or overflowing', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Real touch input contract.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openHomepage(page);

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

    await centerComparison(page);
    const updatedBox = await comparison.boundingBox();
    if (!updatedBox) throw new Error('Missing comparison bounds after scroll');
    const dragY = updatedBox.y + updatedBox.height / 2;
    const dragStartX = updatedBox.x + updatedBox.width * 0.38;
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: dragStartX, y: dragY }],
    });
    for (const offset of [10, 20, 30]) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: dragStartX + offset, y: dragY + 1 }],
      });
      await page.waitForTimeout(20);
    }
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(38);
    for (const offset of [60, 90]) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: dragStartX + offset, y: dragY + 1 }],
      });
      await page.waitForTimeout(20);
    }
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(50);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect(Number(await slider.inputValue())).toBeGreaterThan(50);
  });

  test('disables auto motion for reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical reduced-motion contract.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openHomepage(page);
    await centerComparison(page);

    const comparison = page.locator(comparisonSelector);
    await expect(comparison).toHaveAttribute('data-auto-state', 'disabled');
    await page.waitForTimeout(3200);
    await expect(comparison).toHaveAttribute('data-auto-state', 'disabled');
    await expect(comparison).toHaveAttribute('data-auto-leg', '0');
    await expect(comparison.getByRole('slider')).toHaveValue('38');
  });
});
