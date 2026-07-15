import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop-1728', width: 1728, height: 1080 },
  { name: 'desktop-1600', width: 1600, height: 1000 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-375', width: 375, height: 812 },
] as const;

const visualPeakSelectors = [
  '[data-hero-panorama]',
  '[data-testid="xuelang-dark-stage"]',
  'figure:has(img[src*="result-evidence.webp"])',
] as const;

test.describe('Xuelang visual matrix', () => {
  test.setTimeout(90_000);

  for (const locale of ['zh', 'en'] as const) {
    for (const viewport of viewports) {
      test(`${locale} ${viewport.name} stays inside its editorial canvas`, async ({
        page,
      }, testInfo) => {
        test.skip(
          testInfo.project.name !== 'desktop',
          'The visual matrix sets its own exact viewport dimensions.',
        );

        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}/work/xuelang/`, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          for (const image of Array.from(document.images)) image.loading = 'eager';
          await document.fonts.ready;
        });
        await expect.poll(
          () => page.locator('img').evaluateAll((images) => images.every((image) => {
            const rendered = image as HTMLImageElement;
            return rendered.complete && rendered.naturalWidth > 0;
          })),
          { timeout: 30_000 },
        ).toBe(true);

        await expect(page.locator('[data-xuelang-hero] h1')).toBeInViewport();
        await expect(page.locator('[data-xuelang-hero] [data-case-web-control]')).toBeInViewport();
        await expect(page.locator('[data-hero-panorama]')).toBeInViewport();

        if (viewport.width >= 1280) {
          const visiblePanoramaHeight = await page.locator('[data-hero-panorama]').evaluate(
            (element) => {
              const box = element.getBoundingClientRect();
              return Math.max(0, Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0));
            },
          );
          expect(
            visiblePanoramaHeight,
            'The product panorama should be meaningfully visible in the first desktop viewport',
          ).toBeGreaterThanOrEqual(220);
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);

        const layoutDefects = await page
          .locator('h1, h2, h3, button, a, figure, [data-result-metric]')
          .evaluateAll((elements) => {
            const viewportWidth = document.documentElement.clientWidth;
            const isVisible = (element: Element) => {
              const style = getComputedStyle(element);
              const box = element.getBoundingClientRect();
              return style.display !== 'none'
                && style.visibility !== 'hidden'
                && Number(style.opacity) > 0
                && box.width > 1
                && box.height > 1;
            };
            const describe = (element: Element) => {
              const label = element.getAttribute('aria-label')
                ?? element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80)
                ?? '';
              return `${element.tagName.toLowerCase()}${label ? ` (${label})` : ''}`;
            };

            return elements.flatMap((element) => {
              if (!isVisible(element)) return [];
              const box = element.getBoundingClientRect();
              const defects: string[] = [];

              if (box.left < -1 || box.right > viewportWidth + 1) {
                defects.push(
                  `${describe(element)} exceeds viewport: ${box.left.toFixed(1)}..${box.right.toFixed(1)} / ${viewportWidth}`,
                );
              }

              let sibling = element.nextElementSibling;
              while (sibling && !isVisible(sibling)) sibling = sibling.nextElementSibling;
              if (sibling) {
                const siblingBox = sibling.getBoundingClientRect();
                const horizontalIntersection = Math.min(box.right, siblingBox.right)
                  - Math.max(box.left, siblingBox.left);
                const verticalIntersection = Math.min(box.bottom, siblingBox.bottom)
                  - Math.max(box.top, siblingBox.top);
                if (horizontalIntersection > 1 && verticalIntersection > 1) {
                  defects.push(
                    `${describe(element)} overlaps following ${describe(sibling)} by ${horizontalIntersection.toFixed(1)}x${verticalIntersection.toFixed(1)}px`,
                  );
                }
              }

              return defects;
            });
          });
        expect(layoutDefects).toEqual([]);

        const chapterIntros = await page
          .locator('[data-case-study] section:has(> .section-heading + .xuelang-reading)')
          .evaluateAll((sections) => sections.map((section) => {
            const heading = section.querySelector<HTMLElement>(':scope > .section-heading');
            const reading = section.querySelector<HTMLElement>(':scope > .xuelang-reading');
            if (!heading || !reading) throw new Error('Missing chapter intro pair');
            const headingBox = heading.getBoundingClientRect();
            const readingBox = reading.getBoundingClientRect();
            return {
              id: section.id,
              heading: {
                left: headingBox.left,
                right: headingBox.right,
                top: headingBox.top,
                bottom: headingBox.bottom,
              },
              reading: {
                left: readingBox.left,
                right: readingBox.right,
                top: readingBox.top,
                bottom: readingBox.bottom,
              },
            };
          }));
        for (const intro of chapterIntros) {
          if (viewport.width >= 1101) {
            expect(
              intro.reading.left - intro.heading.right,
              `${intro.id} should preserve a clear horizontal gutter between its title and reading copy`,
            ).toBeGreaterThanOrEqual(16);
          } else {
            expect(
              intro.reading.top - intro.heading.bottom,
              `${intro.id} should stack reading copy below its title without overlap`,
            ).toBeGreaterThanOrEqual(16);
          }
        }

        if (viewport.width >= 1280) {
          const caseWidth = await page.locator('[data-case-study]').evaluate(
            (element) => element.getBoundingClientRect().width,
          );
          for (const selector of visualPeakSelectors) {
            const peakWidth = await page.locator(selector).evaluate(
              (element) => element.getBoundingClientRect().width,
            );
            expect(
              peakWidth / caseWidth,
              `${selector} should occupy at least 80% of the case canvas`,
            ).toBeGreaterThanOrEqual(0.8);
          }

          const summaryWidth = await page.locator('[data-result-summary]').evaluate(
            (element) => element.getBoundingClientRect().width,
          );
          expect(
            summaryWidth / caseWidth,
            'The fourth result should read as a full-width summary row',
          ).toBeGreaterThanOrEqual(0.8);
        }

        await page.screenshot({
          path: testInfo.outputPath(`xuelang-${locale}-${viewport.name}.png`),
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  }

  test('Xuelang owns the wider compact chapter breakpoint without changing shared cases', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'This test sets exact breakpoint widths.');

    const toggle = page.getByRole('button', { name: 'Open chapter index' });
    const navigation = page.getByRole('navigation', { name: 'Case study chapters' });

    for (const width of [1024, 1100]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/en/work/xuelang/', { waitUntil: 'networkidle' });
      await expect(toggle, `Xuelang should use its compact index at ${width}px`).toBeVisible();
      await expect(navigation).toBeHidden();
    }

    for (const width of [1101, 1199, 1200]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/en/work/xuelang/', { waitUntil: 'networkidle' });
      await expect(toggle, `Xuelang should restore its rail at ${width}px`).toBeHidden();
      await expect(navigation).toBeVisible();
    }

    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/en/work/call-agent/', { waitUntil: 'networkidle' });
    await expect(toggle, 'Shared cases should retain the original 900px breakpoint').toBeHidden();
    await expect(navigation).toBeVisible();
  });

  for (const width of [1280, 1440]) {
    test(`learning thesis pins cleanly while its normal-motion reveal starts at ${width}px`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'This test sets an exact desktop width.');
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto('/en/work/xuelang/', { waitUntil: 'networkidle' });

      const position = await page.locator('[data-learning-sequence]').evaluate(async (sequence) => {
        const thesis = sequence.querySelector<HTMLElement>('[data-learning-thesis]');
        if (!thesis) throw new Error('Missing learning thesis');
        document.documentElement.style.scrollBehavior = 'auto';
        const targetScroll = sequence.getBoundingClientRect().top
          + window.scrollY
          - window.innerHeight * 0.15
          + 8;
        window.scrollTo(0, targetScroll);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        return {
          sequenceTransform: getComputedStyle(sequence).transform,
          thesisPosition: getComputedStyle(thesis).position,
          thesisTop: thesis.getBoundingClientRect().top,
          expectedTop: window.innerHeight * 0.15,
        };
      });

      expect(
        position.sequenceTransform,
        'The pin container must never become a transformed containing block during reveal',
      ).toBe('none');
      expect(position.thesisPosition).toBe('fixed');
      expect(Math.abs(position.thesisTop - position.expectedTop)).toBeLessThanOrEqual(12);
    });
  }
});
