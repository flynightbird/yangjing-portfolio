import { expect, test, type Page } from '@playwright/test';

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

test.describe('localized About scroll reveals', () => {
  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} reveals each section once with the approved motion`, async ({
      page,
    }, testInfo) => {
      skipNonMotionProject(testInfo.project.name);
      await page.goto(`/${locale}/about/`, { waitUntil: 'networkidle' });

      const boundaries = page.locator('[data-about-page] [data-scroll-reveal]');
      const heroRevealAncestor = page.locator(
        '[data-scroll-reveal]:has([data-about-hero])',
      );
      const careerBoundary = boundaries.nth(2);
      const text = careerBoundary.locator('[data-scroll-reveal-group="text"]');
      const media = careerBoundary.locator('[data-scroll-reveal-group="media"]');

      await expect(boundaries).toHaveCount(3);
      await expect(heroRevealAncestor).toHaveCount(0);
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'pending',
      );
      await expect(text).toHaveCount(1);
      await expect(media).toHaveCount(1);

      await expect
        .poll(() => text.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            opacity: style.opacity,
            filter: style.filter,
            transform: style.transform,
            duration: style.transitionDuration,
            delay: style.transitionDelay,
          };
        }))
        .toEqual({
          opacity: '0',
          filter: 'blur(2px)',
          transform: 'matrix(1, 0, 0, 1, 0, 22)',
          duration: '0.74s, 0.74s, 0.74s',
          delay: '0s, 0s, 0s',
        });
      await expect
        .poll(() => media.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            opacity: style.opacity,
            filter: style.filter,
            transform: style.transform,
            duration: style.transitionDuration,
            delay: style.transitionDelay,
          };
        }))
        .toEqual({
          opacity: '0',
          filter: 'blur(2px)',
          transform: 'matrix(1, 0, 0, 1, 0, 22)',
          duration: '0.8s',
          delay: '0.18s',
        });

      await careerBoundary.scrollIntoViewIfNeeded();
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'revealed',
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(careerBoundary).toHaveAttribute(
        'data-scroll-reveal-state',
        'revealed',
      );
      await careerBoundary.scrollIntoViewIfNeeded();
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
    expect(await groups.evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        opacity: style.opacity,
        filter: style.filter,
        transform: style.transform,
        duration: style.transitionDuration,
      };
    }))).toEqual(Array.from({ length: 6 }, () => ({
      opacity: '1',
      filter: 'none',
      transform: 'none',
      duration: '0s',
    })));
    await expectNoHorizontalOverflow(page);
  });
});
