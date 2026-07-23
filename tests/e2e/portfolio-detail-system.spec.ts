import { expect, test, type Locator } from '@playwright/test';

const fontSize = async (locator: Locator) =>
  locator.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));

const roleCases = [
  {
    route: '/zh/work/call-agent/',
    cardSelector: '[data-case-study] .boundary-map h3',
  },
  {
    route: '/en/work/call-agent/',
    cardSelector: '[data-case-study] .boundary-map h3',
  },
  {
    route: '/zh/work/meeting/',
    cardSelector: '[data-meeting-case] #capability-impact > div > article h3',
  },
  {
    route: '/en/work/meeting/',
    cardSelector: '[data-meeting-case] #capability-impact > div > article h3',
  },
  {
    route: '/zh/build/stt-demo/',
    cardSelector: '[data-case-study] .feedback-loop h3',
  },
  {
    route: '/en/build/stt-demo/',
    cardSelector: '[data-case-study] .feedback-loop h3',
  },
] as const;

const responsiveCases = [
  { route: '/zh/work/call-agent/', root: '[data-case-study]' },
  { route: '/en/work/call-agent/', root: '[data-case-study]' },
  { route: '/zh/work/meeting/', root: '[data-meeting-case]' },
  { route: '/en/work/meeting/', root: '[data-meeting-case]' },
  { route: '/zh/build/stt-demo/', root: '[data-case-study]' },
  { route: '/en/build/stt-demo/', root: '[data-case-study]' },
  { route: '/zh/work/xuelang/', root: '[data-xuelang-case]' },
  { route: '/en/work/xuelang/', root: '[data-xuelang-case]' },
] as const;

const routes = [
  '/zh/work/call-agent/',
  '/zh/work/meeting/',
  '/zh/work/xuelang/',
] as const;

test.describe('portfolio detail system', () => {
  for (const { route, cardSelector } of roleCases) {
    test(`${route} exposes the approved desktop hierarchy`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(route, { waitUntil: 'networkidle' });

      expect(
        await fontSize(page.locator('[data-case-study] h1').first()),
      ).toBeCloseTo(58, 0);
      expect(
        await fontSize(page.locator('[data-case-study] h2').first()),
      ).toBeCloseTo(50, 0);

      const card = page.locator(cardSelector).first();
      await expect(card).toHaveCount(1);
      expect(await fontSize(card)).toBeCloseTo(22, 0);
    });
  }

  for (const locale of ['zh', 'en'] as const) {
    test(`${locale} Xuelang exposes all five visual roles at desktop size`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`/${locale}/work/xuelang/`, { waitUntil: 'networkidle' });

      const roles = [
        ['[data-xuelang-case] h1', 58],
        ['[data-xuelang-case] .section-heading h2', 50],
        ['[data-xuelang-case] [data-evidence-story] h3', 36],
        ['[data-xuelang-case] [role="tabpanel"] h4', 29],
        ['[data-xuelang-case] .xuelang-problem-list h3', 22],
      ] as const;

      for (const [selector, expected] of roles) {
        const heading = page.locator(selector).first();
        await expect(heading).toHaveCount(1);
        expect(await fontSize(heading)).toBeCloseTo(expected, 0);
      }
    });
  }

  for (const width of [1024, 390] as const) {
    for (const { route, root } of responsiveCases) {
      test(`${route} keeps headings contained at ${width}px`, async ({
        page,
      }, testInfo) => {
        const expectedProject = width === 1024 ? 'desktop' : 'mobile';
        test.skip(testInfo.project.name !== expectedProject);
        await page.setViewportSize({
          width,
          height: width === 1024 ? 900 : 844,
        });
        await page.goto(route, { waitUntil: 'networkidle' });

        await expect(page.locator(root)).toBeVisible();
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          ),
        ).toBeLessThanOrEqual(1);

        const headings = page.locator(`${root} :is(h1, h2, h3, h4)`);
        expect(await headings.count()).toBeGreaterThan(0);
        const boxes = await headings.evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return {
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
              clientWidth: node.clientWidth,
              scrollWidth: node.scrollWidth,
              fontSize: parseFloat(style.fontSize),
              lineHeight: parseFloat(style.lineHeight),
              viewport: window.innerWidth,
            };
          }),
        );

        for (const box of boxes) {
          expect(box.left).toBeGreaterThanOrEqual(-1);
          expect(box.right).toBeLessThanOrEqual(box.viewport + 1);
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
          expect(box.fontSize).toBeGreaterThan(0);
          expect(box.lineHeight).toBeGreaterThan(0);
          expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth + 1);
        }

        for (let first = 0; first < boxes.length; first += 1) {
          for (let second = first + 1; second < boxes.length; second += 1) {
            const horizontalOverlap =
              Math.min(boxes[first].right, boxes[second].right) -
              Math.max(boxes[first].left, boxes[second].left);
            const verticalOverlap =
              Math.min(boxes[first].bottom, boxes[second].bottom) -
              Math.max(boxes[first].top, boxes[second].top);
            expect(
              horizontalOverlap > 1 && verticalOverlap > 1,
              `headings ${first} and ${second} overlap on ${route} at ${width}px`,
            ).toBe(false);
          }
        }
      });
    }
  }

  for (const route of routes) {
    test(`${route} shares navigation and heading semantics`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop');
      await page.goto(route, { waitUntil: 'networkidle' });

      await expect(page.getByRole('banner')).toHaveAttribute(
        'data-surface',
        'light',
      );

      const chapters = page
        .getByRole('navigation', { name: '案例章节' })
        .getByRole('link');
      await expect(chapters.first()).toHaveCSS('opacity', '1');
      await expect(chapters.nth(1)).toHaveCSS('opacity', '0.48');

      for (const [level, leading] of [
        [1, 1.06],
        [2, 1.16],
      ] as const) {
        const heading = page.locator(`[data-case-study] h${level}`).first();
        await expect(heading).toHaveCSS('font-weight', '600');
        const ratio = await heading.evaluate((node) => {
          const style = getComputedStyle(node);
          return (
            Number.parseFloat(style.lineHeight) /
            Number.parseFloat(style.fontSize)
          );
        });
        expect(ratio).toBeCloseTo(leading, 1);
      }
    });
  }

  test('dark base-layout details use dark navigation tokens', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.goto('/zh/build/stt-demo/', { waitUntil: 'networkidle' });

    const header = page.getByRole('banner');
    await expect(header).toHaveAttribute('data-surface', 'dark');
    await expect(header.getByRole('link').first()).toHaveCSS(
      'color',
      'rgb(244, 245, 242)',
    );

    const chapters = page
      .getByRole('navigation', { name: '案例章节' })
      .getByRole('link');
    await expect(chapters.first()).toHaveCSS('color', 'rgb(242, 244, 240)');
    await expect(chapters.first()).toHaveCSS('opacity', '1');
    await expect(chapters.nth(1)).toHaveCSS('opacity', '0.48');
  });

  test('mobile Call Agent keeps the light capsule and chapter disclosure readable', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');
    await page.goto('/zh/work/call-agent/', { waitUntil: 'networkidle' });

    const header = page.getByRole('banner');
    await expect(header).toHaveAttribute('data-surface', 'light');

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(header).toHaveAttribute('data-scrolled', 'true');

    const capsule = header.locator('div').first();
    await expect
      .poll(() =>
        capsule.evaluate((node) => getComputedStyle(node).backgroundColor),
      )
      .not.toBe('rgba(0, 0, 0, 0)');
    await expect(capsule).toHaveCSS('color', 'rgb(16, 17, 15)');

    await page.getByRole('button', { name: '打开章节目录' }).click();
    await expect(
      page.getByRole('navigation', { name: '案例章节' }),
    ).toBeVisible();
  });
});
