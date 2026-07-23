import { expect, test, type Locator } from '@playwright/test';

type SiblingRelation = 'preceding' | 'following';

interface SiblingGeometry {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  name: string;
  relation: SiblingRelation;
  hasMedia: boolean;
}

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

const convoRoleCases = {
  zh: [
    ['[data-convo-ai-stage][data-hero="true"] [data-stage-semantic-title]', 58],
    ['[data-convo-ai-case] .section-heading h2', 50],
    ['[data-convo-ai-case] .convo-subheading', 36],
    [
      '[data-convo-ai-case] [class*="avatarFigure"] figcaption strong',
      29,
    ],
  ],
  en: [
    ['[data-convo-ai-stage][data-hero="true"] [data-stage-semantic-title]', 58],
    ['[data-convo-ai-case] .section-heading h2', 50],
    [
      '[data-convo-ai-stage]:not([data-hero="true"]) [data-stage-semantic-title]',
      29,
    ],
    ['[data-convo-ai-case] .convo-principles h3', 22],
  ],
} as const;

const responsiveCases = [
  { route: '/zh/work/call-agent/', root: '[data-case-study]' },
  { route: '/en/work/call-agent/', root: '[data-case-study]' },
  { route: '/zh/work/meeting/', root: '[data-meeting-case]' },
  { route: '/en/work/meeting/', root: '[data-meeting-case]' },
  { route: '/zh/build/stt-demo/', root: '[data-case-study]' },
  { route: '/en/build/stt-demo/', root: '[data-case-study]' },
  { route: '/zh/work/xuelang/', root: '[data-xuelang-case]' },
  { route: '/en/work/xuelang/', root: '[data-xuelang-case]' },
  { route: '/zh/work/convo-ai/', root: '[data-convo-ai-case]' },
  { route: '/en/work/convo-ai/', root: '[data-convo-ai-case]' },
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

  for (const locale of ['zh', 'en'] as const) {
    test(`${locale} Convo AI exposes its available shared visual roles at desktop size`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`/${locale}/work/convo-ai/`, {
        waitUntil: 'networkidle',
      });

      for (const [selector, expected] of convoRoleCases[locale]) {
        const heading = page.locator(selector).first();
        await expect(heading).toHaveCount(1);
        expect(await fontSize(heading)).toBeCloseTo(expected, 0);
      }
    });
  }

  for (const width of [1440, 1024, 390] as const) {
    test(`Convo AI keeps decorative type subordinate at ${width}px`, async ({
      page,
    }, testInfo) => {
      const expectedProject = width === 390 ? 'mobile' : 'desktop';
      test.skip(testInfo.project.name !== expectedProject);
      await page.setViewportSize({
        width,
        height: width === 390 ? 844 : 900,
      });

      for (const locale of ['zh', 'en'] as const) {
        await page.goto(`/${locale}/work/convo-ai/`, {
          waitUntil: 'networkidle',
        });

        const root = page.locator('[data-convo-ai-case]');
        const displayTitle = root.locator('[data-stage-display-title]').first();
        const projectTitle = root
          .locator('[data-stage-semantic-title]')
          .first();
        const chapterTitle = root.locator('.section-heading h2').first();
        const sectionIndex = root.locator('.section-index').first();
        const semanticHeadings = root.locator(
          '[data-stage-semantic-title], .section-heading h2',
        );

        await expect(projectTitle).toBeVisible();
        for (let index = 0; index < await semanticHeadings.count(); index += 1) {
          const heading = semanticHeadings.nth(index);
          await heading.scrollIntoViewIfNeeded();
          await expect(heading).toBeVisible();
        }
        await expect(displayTitle).toHaveAttribute('aria-hidden', 'true');
        await expect(displayTitle).toHaveCSS('pointer-events', 'none');
        await expect(displayTitle).toHaveCSS('z-index', '-1');
        await expect(projectTitle).toHaveCSS('z-index', '1');
        await expect(chapterTitle).toHaveCSS('z-index', '1');

        const indexLayer = await sectionIndex.evaluate((node) => {
          const style = getComputedStyle(node, '::before');
          return {
            color: style.color,
            pointerEvents: style.pointerEvents,
            zIndex: style.zIndex,
          };
        });
        expect(indexLayer).toEqual({
          color: 'rgba(242, 247, 246, 0.055)',
          pointerEvents: 'none',
          zIndex: '-1',
        });

        const headingLayout = await semanticHeadings.evaluateAll((headings) =>
          headings.map((heading) => {
            const headingRect = heading.getBoundingClientRect();
            const container = heading.closest(
              '[data-convo-ai-stage], section',
            );
            if (!container) {
              return { label: heading.textContent?.trim() ?? '', fits: false };
            }
            const containerRect = container.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(heading);
            const textRects = Array.from(range.getClientRects()).filter(
              (rect) => rect.width > 0 && rect.height > 0,
            );
            const fits =
              textRects.length > 0 &&
              headingRect.left >= containerRect.left - 1 &&
              headingRect.right <= containerRect.right + 1 &&
              textRects.every(
                (rect) =>
                  rect.left >= containerRect.left - 1 &&
                  rect.right <= containerRect.right + 1,
              );
            return {
              label: heading.textContent?.trim() ?? '',
              fits,
              heading: {
                left: headingRect.left,
                right: headingRect.right,
                top: headingRect.top,
                bottom: headingRect.bottom,
              },
              container: {
                left: containerRect.left,
                right: containerRect.right,
                top: containerRect.top,
                bottom: containerRect.bottom,
              },
            };
          }),
        );
        expect(headingLayout.filter(({ fits }) => !fits)).toEqual([]);
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          ),
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test('English Xuelang avoids a single-word final project-title line on mobile', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/en/work/xuelang/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const title = page.locator('[data-xuelang-case] h1');
    await expect(title).toHaveText('Xuelang Commercial Experience Upgrade');
    const chapterTitle = page
      .locator('[data-xuelang-case] .section-heading h2')
      .first();
    await expect(chapterTitle).toHaveCount(1);
    expect(await fontSize(title)).toBeGreaterThan(await fontSize(chapterTitle));
    const lineWordCounts = await title.evaluate((node) => {
      const textNode = Array.from(node.childNodes).find(
        (child): child is Text => child.nodeType === Node.TEXT_NODE,
      );
      if (!textNode) throw new Error('Xuelang title has no text node');

      const words = Array.from(textNode.data.matchAll(/\S+/g), (match) => {
        const start = match.index;
        const range = document.createRange();
        range.setStart(textNode, start);
        range.setEnd(textNode, start + match[0].length);
        const rects = Array.from(range.getClientRects()).filter(
          (rect) => rect.width > 0 && rect.height > 0,
        );
        if (rects.length !== 1) {
          throw new Error(`Expected one rendered rect for ${match[0]}`);
        }
        return { word: match[0], top: rects[0].top };
      });

      const lines: Array<{ top: number; words: string[] }> = [];
      for (const word of words) {
        const line = lines.find(({ top }) => Math.abs(top - word.top) <= 1);
        if (line) line.words.push(word.word);
        else lines.push({ top: word.top, words: [word.word] });
      }
      return lines
        .sort((first, second) => first.top - second.top)
        .map(({ words: renderedWords }) => renderedWords.length);
    });

    expect(lineWordCounts.length).toBeGreaterThan(1);
    expect(lineWordCounts.reduce((sum, count) => sum + count, 0)).toBe(4);
    expect(lineWordCounts.at(-1)).toBeGreaterThanOrEqual(2);
  });

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
        await page.evaluate(() => document.fonts.ready);
        await expect
          .poll(
            () =>
              headings.evaluateAll(
                (nodes) =>
                  new Promise<boolean>((resolve) => {
                    const snapshot = () =>
                      nodes.map((node) => {
                        const rect = node.getBoundingClientRect();
                        return [rect.left, rect.top, rect.width, rect.height];
                      });
                    const before = snapshot();
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        const after = snapshot();
                        resolve(
                          before.every((box, boxIndex) =>
                            box.every(
                              (value, valueIndex) =>
                                Math.abs(value - after[boxIndex][valueIndex]) <=
                                0.25,
                            ),
                          ),
                        );
                      });
                    });
                  }),
              ),
            { timeout: 5_000, intervals: [100, 250, 500] },
          )
          .toBe(true);
        const boxes = await headings.evaluateAll(
          (nodes, rootSelector) =>
            nodes.map((node, index) => {
              const rect = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              const range = document.createRange();
              range.selectNodeContents(node);
              const textRects = Array.from(range.getClientRects()).filter(
                (textRect) => textRect.width > 0 && textRect.height > 0,
              );
              if (textRects.length === 0) {
                throw new Error(`Heading ${index} has no rendered text`);
              }
              const textBounds = textRects.reduce(
                (bounds, textRect) => ({
                  left: Math.min(bounds.left, textRect.left),
                  right: Math.max(bounds.right, textRect.right),
                  top: Math.min(bounds.top, textRect.top),
                  bottom: Math.max(bounds.bottom, textRect.bottom),
                }),
                {
                  left: textRects[0].left,
                  right: textRects[0].right,
                  top: textRects[0].top,
                  bottom: textRects[0].bottom,
                },
              );
              const rendered = {
                left: Math.min(rect.left, textBounds.left),
                right: Math.max(rect.right, textBounds.right),
                top: Math.min(rect.top, textBounds.top),
                bottom: Math.max(rect.bottom, textBounds.bottom),
              };
              const clipsOwnX = ['hidden', 'clip'].includes(style.overflowX);
              const clipsOwnY = ['hidden', 'clip'].includes(style.overflowY);
              const rootElement = node.closest(rootSelector);
              if (!rootElement) {
                throw new Error(`Heading ${index} has no case root`);
              }
              const isChapterHeading =
                node.parentElement?.matches('.section-heading');
              const container = isChapterHeading
                ? node.closest('section')
                : node.closest('article, figure, section, header');
              if (!container) {
                throw new Error(`Heading ${index} has no layout container`);
              }
              const containerRect = container.getBoundingClientRect();
              const siblings: SiblingGeometry[] = [];
              const seenSiblings = new Set<Element>();
              const collectSiblings = (
                elements: readonly Element[],
                reference: Element,
              ) => {
                for (const sibling of elements) {
                  const isCaseNavigation =
                    sibling.matches('aside') &&
                    sibling.querySelector('[data-case-web-control]') !== null;
                  if (
                    sibling === reference ||
                    seenSiblings.has(sibling) ||
                    isCaseNavigation ||
                    sibling.getAttribute('aria-hidden') === 'true' ||
                    ['presentation', 'none'].includes(
                      sibling.getAttribute('role') ?? '',
                    )
                  ) {
                    continue;
                  }
                  const siblingStyle = getComputedStyle(sibling);
                  if (
                    siblingStyle.position === 'fixed' ||
                    siblingStyle.display === 'none' ||
                    siblingStyle.visibility === 'hidden' ||
                    sibling.getClientRects().length === 0
                  ) {
                    continue;
                  }
                  const siblingRect = sibling.getBoundingClientRect();
                  if (siblingRect.width === 0 || siblingRect.height === 0) {
                    continue;
                  }
                  const relativePosition =
                    node.compareDocumentPosition(sibling);
                  const relation: SiblingRelation =
                    relativePosition & Node.DOCUMENT_POSITION_FOLLOWING
                      ? 'following'
                      : 'preceding';
                  seenSiblings.add(sibling);
                  siblings.push({
                    left: siblingRect.left,
                    right: siblingRect.right,
                    top: siblingRect.top,
                    bottom: siblingRect.bottom,
                    width: siblingRect.width,
                    height: siblingRect.height,
                    name: sibling.tagName.toLowerCase(),
                    relation,
                    hasMedia:
                      sibling.matches('img, picture, video, canvas, svg') ||
                      sibling.querySelector(
                        'img, picture, video, canvas, svg',
                      ) !== null,
                  });
                }
              };
              let comparisonNode: Element = node;
              while (
                comparisonNode !== rootElement &&
                comparisonNode.parentElement
              ) {
                collectSiblings(
                  Array.from(comparisonNode.parentElement.children),
                  comparisonNode,
                );
                comparisonNode = comparisonNode.parentElement;
              }
              if (siblings.length === 0) {
                throw new Error(`Heading ${index} has no comparable content`);
              }
              const clippingAncestors = [];
              let ancestor = node.parentElement;
              while (ancestor) {
                const ancestorStyle = getComputedStyle(ancestor);
                const clipsX = ['hidden', 'clip'].includes(
                  ancestorStyle.overflowX,
                );
                const clipsY = ['hidden', 'clip'].includes(
                  ancestorStyle.overflowY,
                );
                if (clipsX || clipsY) {
                  const ancestorRect = ancestor.getBoundingClientRect();
                  clippingAncestors.push({
                    left: ancestorRect.left,
                    right: ancestorRect.right,
                    top: ancestorRect.top,
                    bottom: ancestorRect.bottom,
                    clipsX,
                    clipsY,
                    name:
                      ancestor.getAttribute('data-testid') ??
                      ancestor.tagName.toLowerCase(),
                  });
                }
                if (ancestor === rootElement) break;
                ancestor = ancestor.parentElement;
              }
              return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                clientWidth: node.clientWidth,
                scrollWidth: node.scrollWidth,
                clientHeight: node.clientHeight,
                scrollHeight: node.scrollHeight,
                clipsOwnX,
                clipsOwnY,
                rendered,
                fontSize: parseFloat(style.fontSize),
                lineHeight: parseFloat(style.lineHeight),
                viewport: window.innerWidth,
                isCourseStageHeading:
                  node.matches('h4') &&
                  node.closest('[data-course-entry]') !== null,
                container: {
                  left: containerRect.left,
                  right: containerRect.right,
                  top: containerRect.top,
                  bottom: containerRect.bottom,
                  name: container.tagName.toLowerCase(),
                },
                siblings,
                clippingAncestors,
              };
            }),
          root,
        );
        expect(
          boxes.some(({ siblings }) =>
            siblings.some(({ relation }) => relation === 'preceding'),
          ),
          `${route} at ${width}px has no preceding-sibling coverage`,
        ).toBe(true);
        expect(
          boxes.some(({ siblings }) =>
            siblings.some(({ relation }) => relation === 'following'),
          ),
          `${route} at ${width}px has no following-sibling coverage`,
        ).toBe(true);
        if (route.includes('/work/xuelang/')) {
          const courseStageHeading = boxes.find(
            ({ isCourseStageHeading }) => isCourseStageHeading,
          );
          expect(
            courseStageHeading,
            `${route} at ${width}px has no course stage heading`,
          ).toBeDefined();
          expect(
            courseStageHeading?.siblings.some(({ hasMedia }) => hasMedia),
            `${route} course stage heading is not compared with adjacent media at ${width}px`,
          ).toBe(true);
        }

        for (const [index, box] of boxes.entries()) {
          expect(box.rendered.left).toBeGreaterThanOrEqual(-1);
          expect(box.rendered.right).toBeLessThanOrEqual(box.viewport + 1);
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
          expect(box.fontSize).toBeGreaterThan(0);
          expect(box.lineHeight).toBeGreaterThan(0);
          if (box.scrollWidth > box.clientWidth + 1) {
            expect(
              box.clipsOwnX,
              `heading ${index} clips horizontal text on ${route} at ${width}px`,
            ).toBe(false);
          }
          if (box.scrollHeight > box.clientHeight + 1) {
            expect(
              box.clipsOwnY,
              `heading ${index} clips vertical text on ${route} at ${width}px`,
            ).toBe(false);
          }
          expect(
            box.rendered.left,
            `heading ${index} escapes its ${box.container.name} on ${route} at ${width}px`,
          ).toBeGreaterThanOrEqual(box.container.left - 1);
          expect(
            box.rendered.right,
            `heading ${index} escapes its ${box.container.name} on ${route} at ${width}px`,
          ).toBeLessThanOrEqual(box.container.right + 1);
          expect(
            box.rendered.top,
            `heading ${index} escapes its ${box.container.name} on ${route} at ${width}px`,
          ).toBeGreaterThanOrEqual(box.container.top - 1);
          expect(
            box.rendered.bottom,
            `heading ${index} escapes its ${box.container.name} on ${route} at ${width}px`,
          ).toBeLessThanOrEqual(box.container.bottom + 1);

          for (const sibling of box.siblings) {
            expect(sibling.width).toBeGreaterThan(0);
            expect(sibling.height).toBeGreaterThan(0);
            const siblingHorizontalOverlap =
              Math.min(box.rendered.right, sibling.right) -
              Math.max(box.rendered.left, sibling.left);
            const siblingVerticalOverlap =
              Math.min(box.rendered.bottom, sibling.bottom) -
              Math.max(box.rendered.top, sibling.top);
            expect(
              siblingHorizontalOverlap > 1 && siblingVerticalOverlap > 1,
              `heading ${index} overlaps ${sibling.relation} ${sibling.name} on ${route} at ${width}px`,
            ).toBe(false);
          }

          for (const clippingAncestor of box.clippingAncestors) {
            if (clippingAncestor.clipsX) {
              expect(
                box.rendered.left,
                `heading ${index} is horizontally clipped by ${clippingAncestor.name} on ${route} at ${width}px`,
              ).toBeGreaterThanOrEqual(clippingAncestor.left - 1);
              expect(
                box.rendered.right,
                `heading ${index} is horizontally clipped by ${clippingAncestor.name} on ${route} at ${width}px`,
              ).toBeLessThanOrEqual(clippingAncestor.right + 1);
            }
            if (clippingAncestor.clipsY) {
              expect(
                box.rendered.top,
                `heading ${index} is vertically clipped by ${clippingAncestor.name} on ${route} at ${width}px`,
              ).toBeGreaterThanOrEqual(clippingAncestor.top - 1);
              expect(
                box.rendered.bottom,
                `heading ${index} is vertically clipped by ${clippingAncestor.name} on ${route} at ${width}px`,
              ).toBeLessThanOrEqual(clippingAncestor.bottom + 1);
            }
          }
        }

        for (let first = 0; first < boxes.length; first += 1) {
          for (let second = first + 1; second < boxes.length; second += 1) {
            const horizontalOverlap =
              Math.min(
                boxes[first].rendered.right,
                boxes[second].rendered.right,
              ) -
              Math.max(boxes[first].rendered.left, boxes[second].rendered.left);
            const verticalOverlap =
              Math.min(
                boxes[first].rendered.bottom,
                boxes[second].rendered.bottom,
              ) -
              Math.max(boxes[first].rendered.top, boxes[second].rendered.top);
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
