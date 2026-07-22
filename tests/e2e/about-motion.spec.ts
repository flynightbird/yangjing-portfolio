import { expect, test, type Locator, type Page } from '@playwright/test';

const motionProjects = new Set(['desktop', 'mobile']);

function skipNonMotionProject(projectName: string) {
  test.skip(
    !motionProjects.has(projectName),
    'Desktop and mobile cover the supported motion viewports.',
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() => page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ))
    .toBe(true);
}

async function readRevealGroupStyle(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const properties = style.transitionProperty.split(',').map((value) => value.trim());
    const durations = style.transitionDuration.split(',').map((value) => value.trim());
    const delays = style.transitionDelay.split(',').map((value) => value.trim());
    const toMilliseconds = (value: string) => (
      Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000)
    );
    const transitions = Object.fromEntries(properties.map((property, index) => [
      property,
      {
        durationMs: toMilliseconds(durations[index % durations.length] ?? '0s'),
        delayMs: toMilliseconds(delays[index % delays.length] ?? '0s'),
      },
    ]));
    const matrix = style.transform === 'none'
      ? new DOMMatrixReadOnly()
      : new DOMMatrixReadOnly(style.transform);
    const blur = style.filter.match(/blur\(([-\d.]+)px\)/);

    return {
      opacity: Number.parseFloat(style.opacity),
      blurPx: blur ? Number.parseFloat(blur[1] ?? '0') : 0,
      translateY: matrix.m42,
      transitions,
    };
  });
}

test.describe('localized About scroll reveals', () => {
  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} keeps the career reveal visible after its first intersection`, async ({
      page,
    }, testInfo) => {
      skipNonMotionProject(testInfo.project.name);
      await page.goto(`/${locale}/about/`, { waitUntil: 'networkidle' });

      const boundaries = page.locator('[data-about-page] [data-scroll-reveal]');
      const heroRevealAncestor = page.locator(
        '[data-scroll-reveal]:has([data-about-hero])',
      );
      const careerBoundary = page.locator(
        '[data-about-page] [data-scroll-reveal]:has([data-about-timeline])',
      );
      const text = careerBoundary.locator('[data-scroll-reveal-group="text"]');
      const media = careerBoundary.locator('[data-scroll-reveal-group="media"]');

      await expect(boundaries).toHaveCount(3);
      await expect(heroRevealAncestor).toHaveCount(0);
      await expect(careerBoundary).toHaveCount(1);
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'pending',
      );
      await expect
        .poll(() => careerBoundary.evaluate(
          (element) => element.getBoundingClientRect().top >= window.innerHeight - 1,
        ))
        .toBe(true);
      await expect(text).toHaveCount(1);
      await expect(media).toHaveCount(1);

      await expect
        .poll(() => readRevealGroupStyle(text))
        .toEqual({
          opacity: 0,
          blurPx: 2,
          translateY: 22,
          transitions: {
            opacity: { durationMs: 740, delayMs: 0 },
            transform: { durationMs: 740, delayMs: 0 },
            filter: { durationMs: 740, delayMs: 0 },
          },
        });
      await expect
        .poll(() => readRevealGroupStyle(media))
        .toEqual({
          opacity: 0,
          blurPx: 2,
          translateY: 22,
          transitions: {
            opacity: { durationMs: 800, delayMs: 180 },
            transform: { durationMs: 800, delayMs: 180 },
            filter: { durationMs: 800, delayMs: 180 },
          },
        });

      await careerBoundary.evaluate((element) => {
        document.documentElement.style.scrollBehavior = 'auto';
        element.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
      await expect
        .poll(() => careerBoundary.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const visibleHeight = Math.max(
            0,
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
          );
          return visibleHeight / rect.height;
        }))
        .toBeGreaterThanOrEqual(0.12);
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'revealed',
      );
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
      await expect
        .poll(() => careerBoundary.evaluate(
          (element) => element.getBoundingClientRect().top >= window.innerHeight - 1,
        ))
        .toBe(true);
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'revealed',
      );
      await careerBoundary.evaluate((element) => {
        element.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'revealed',
      );
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('reduced-motion About scroll reveals', () => {
  test.use({
    contextOptions: { reducedMotion: 'reduce' },
  });

  test('reveals all English sections immediately without transitions', async ({
    page,
  }, testInfo) => {
    skipNonMotionProject(testInfo.project.name);
    await page.goto('/en/about/', { waitUntil: 'networkidle' });

    expect(await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )).toBe(true);

    const boundaries = page.locator('[data-about-page] [data-scroll-reveal]');
    const groups = boundaries.locator('[data-scroll-reveal-group]');

    await expect(boundaries).toHaveCount(3);
    await expect
      .poll(() => boundaries.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute('data-scroll-reveal-state'),
      )))
      .toEqual(['revealed', 'revealed', 'revealed']);
    await expect(groups).toHaveCount(6);
    await expect
      .poll(() => Promise.all(Array.from(
        { length: 6 },
        (_, index) => readRevealGroupStyle(groups.nth(index)),
      )))
      .toEqual(Array.from({ length: 6 }, () => ({
        opacity: 1,
        blurPx: 0,
        translateY: 0,
        transitions: {
          none: { durationMs: 0, delayMs: 0 },
        },
      })));
    await expectNoHorizontalOverflow(page);
  });
});
