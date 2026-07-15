import { expect, test } from '@playwright/test';

test.describe('kinetic introduction', () => {
  test('keeps the statements within the viewport and advances through all four scenes', async ({
    page,
  }) => {
    const runtimeErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });

    await page.goto('/en/', { waitUntil: 'networkidle' });

    const intro = page.locator('[data-intro-story]');
    const scenes = intro.locator('[data-intro-scene]');
    const controls = intro.getByRole('button', {
      name: /Go to introduction statement/i,
    });
    await expect(intro).toBeVisible();
    await expect(scenes).toHaveCount(4);
    await expect(controls).toHaveCount(4);

    const metrics = await intro.evaluate((section) => {
      const statement = section.querySelector<HTMLElement>('[data-intro-scene="1"]');
      if (!statement) throw new Error('Missing introduction statement');
      return {
        fontSize: Number.parseFloat(getComputedStyle(statement).fontSize),
        overflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(metrics.fontSize).toBeLessThanOrEqual(60);
    expect(metrics.overflow).toBeLessThanOrEqual(1);

    const geometry = await intro.evaluate((section) => ({
      start: section.getBoundingClientRect().top + window.scrollY,
      height: window.innerHeight,
    }));

    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });

    for (let index = 0; index < 4; index += 1) {
      await page.evaluate(
        ({ start, height, index: sceneIndex }) => {
          window.scrollTo(0, start + height * 3 * ((sceneIndex + 0.5) / 4));
        },
        { ...geometry, index },
      );
      await expect(controls.nth(index)).toHaveAttribute('aria-current', 'step');

      const bounds = await scenes.nth(index).boundingBox();
      const viewport = page.viewportSize();
      expect(bounds).not.toBeNull();
      expect(viewport).not.toBeNull();
      expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(
        viewport?.width ?? 0,
      );
      const linesFit = await scenes
        .nth(index)
        .locator('[data-intro-line]')
        .evaluateAll((lines) =>
          lines.every((line) => line.scrollWidth <= line.clientWidth + 1),
        );
      expect(linesFit).toBe(true);
    }

    await controls.nth(2).click();
    await expect(controls.nth(2)).toHaveAttribute('aria-current', 'step');
    expect(runtimeErrors).toEqual([]);
  });

  test('returns directly to statement one when re-entering from projects', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Reverse-scroll behavior needs one representative viewport.',
    );

    await page.goto('/en/', { waitUntil: 'networkidle' });
    const intro = page.locator('[data-intro-story]');
    const controls = intro.getByRole('button', {
      name: /Go to introduction statement/i,
    });
    const geometry = await intro.evaluate((section) => ({
      start: section.getBoundingClientRect().top + window.scrollY,
      height: window.innerHeight,
    }));

    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });
    await page.evaluate(
      ({ start, height }) => window.scrollTo(0, start + height * 3 + 64),
      geometry,
    );
    await expect(controls.nth(3)).toHaveAttribute('aria-current', 'step');
    await page.evaluate(
      ({ start, height }) => window.scrollTo(0, start + height * 3 - 64),
      geometry,
    );

    await expect(controls.first()).toHaveAttribute('aria-current', 'step');
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeLessThan(geometry.start + 16);
  });

  test('renders every statement as a normal stack with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const intro = page.locator('[data-intro-story]');
    const scenes = intro.locator('[data-intro-scene]');
    await expect(scenes).toHaveCount(4);

    for (let index = 0; index < 4; index += 1) {
      await expect(scenes.nth(index)).toBeVisible();
      await expect(scenes.nth(index)).not.toHaveAttribute('aria-hidden');
    }

    await expect(
      intro.getByRole('navigation', { name: 'Introduction progress' }),
    ).toBeHidden();
  });

  test('keeps every Chinese statement to two fitting lines', async ({ page }) => {
    await page.goto('/zh/', { waitUntil: 'networkidle' });

    const intro = page.locator('[data-intro-story]');
    const scenes = intro.locator('[data-intro-scene]');
    await expect(scenes).toHaveCount(4);

    for (let index = 0; index < 4; index += 1) {
      const lineMetrics = await scenes
        .nth(index)
        .locator('[data-intro-line]')
        .evaluateAll((lines) =>
          lines.map((line) => ({
            fits: line.scrollWidth <= line.clientWidth + 1,
            whiteSpace: getComputedStyle(line).whiteSpace,
          })),
        );
      expect(lineMetrics).toHaveLength(2);
      expect(lineMetrics.every(({ fits }) => fits)).toBe(true);
      expect(lineMetrics.every(({ whiteSpace }) => whiteSpace === 'nowrap')).toBe(true);
    }
  });
});
