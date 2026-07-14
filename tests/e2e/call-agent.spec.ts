import { expect, test } from '@playwright/test';

test.setTimeout(60_000);

const chapterIds = [
  'overview',
  'context-role',
  'design-thesis',
  'decision-path',
  'decision-preview',
  'decision-operate',
  'system-delivery',
  'outcome-learnings',
] as const;

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} Call Agent case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/work/call-agent/`, {
        waitUntil: 'domcontentloaded',
      });
    });

    test('renders the complete approved chapter sequence and boundaries', async ({ page }) => {
      await expect(page.locator('article[data-case-study]')).toBeVisible();
      await expect(page.locator('article[data-case-study] > section')).toHaveCount(8);

      const renderedIds = await page
        .locator('article[data-case-study] > section')
        .evaluateAll((sections) => sections.map(({ id }) => id));
      expect(renderedIds).toEqual(chapterIds);

      await expect(page.getByText(locale === 'zh' ? '唯一产品设计师' : 'Sole product designer', { exact: true })).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '9 个月' : '9 months', { exact: true })).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '约 8 次迭代' : 'Approximately 8 iterations', { exact: true })).toBeVisible();
      await expect(page.locator('#outcome-learnings')).toContainText(
        locale === 'zh' ? '有限客户灰度' : 'limited customer beta',
      );
      await expect(page.locator('#outcome-learnings')).toContainText(
        locale === 'zh' ? '尚未规模验证' : 'Not yet validated at scale',
      );
      await expect(page.locator('#system-delivery')).toContainText(
        locale === 'zh' ? '未合入生产环境' : 'was not merged into production',
      );

      await expect(page.locator('body')).not.toContainText(/增长了|提升了\s*\d+%|转化率达到/);
      await expect(page.locator('body')).not.toContainText(/increased by\s*\d+%|conversion reached/i);
    });

    test('loads intrinsically sized evidence and preserves project neighbors', async ({ page }) => {
      const evidence = page.locator('figure[data-evidence] img');
      await expect(evidence.first()).toBeVisible();
      expect(await evidence.count()).toBeGreaterThanOrEqual(7);

      for (let index = 0; index < await evidence.count(); index += 1) {
        const image = evidence.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        const size = await image.evaluate((element) => {
          const renderedImage = element as HTMLImageElement;
          return {
            width: renderedImage.width,
            height: renderedImage.height,
            naturalWidth: renderedImage.naturalWidth,
            naturalHeight: renderedImage.naturalHeight,
          };
        });
        expect(size.width).toBeGreaterThan(0);
        expect(size.height).toBeGreaterThan(0);
        expect(size.naturalWidth).toBeGreaterThan(0);
        expect(size.naturalHeight).toBeGreaterThan(0);
      }

      await expect(page.locator('[data-project-previous]')).toHaveCount(0);
      await expect(page.locator('[data-project-next]')).toHaveCount(0);
      await expect(
        page.getByRole('navigation', {
          name: locale === 'zh' ? '项目导航' : 'Project navigation',
        }),
      ).toHaveCount(0);
    });

    test('opens and dismisses evidence with the keyboard without losing scroll state', async ({ page }) => {
      const trigger = page.getByRole('button', { name: locale === 'zh' ? /放大查看/ : /Enlarge/ }).first();
      await expect(trigger).toHaveAttribute('data-hydrated', 'true');
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

      const close = page.getByRole('button', {
        name: locale === 'zh' ? '关闭图片' : 'Close image',
      });
      const backgroundTrigger = page
        .getByRole('button', {
          name: locale === 'zh' ? /放大查看/ : /Enlarge/,
        })
        .nth(1);
      await expect(close).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await expect(backgroundTrigger).not.toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();
      await expect(backgroundTrigger).not.toBeFocused();

      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    });

    test('keeps chapter navigation usable at every breakpoint', async ({ page }, testInfo) => {
      const navigation = page.getByRole('navigation', {
        name: locale === 'zh' ? '案例章节' : 'Case study chapters',
      });

      if (testInfo.project.name === 'desktop') {
        await expect(navigation).toBeVisible();
        await expect(page.getByRole('button', { name: locale === 'zh' ? '打开章节目录' : 'Open chapter index' })).toBeHidden();
      } else {
        const toggle = page.getByRole('button', {
          name: locale === 'zh' ? '打开章节目录' : 'Open chapter index',
        });
        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('data-hydrated', 'true');
        await toggle.click();
        await expect(navigation).toBeVisible();
        await navigation.getByRole('link').nth(1).click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      }
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('keeps evidence visible and hides web controls in print', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('article[data-case-study]')).toBeVisible();
      await expect(page.locator('figure[data-evidence]').first()).toBeVisible();
      await expect(page.locator('[data-case-web-control]:visible')).toHaveCount(0);
      await expect(page.locator('body > header')).toBeHidden();
      await expect(page.locator('body > footer')).toBeHidden();

      const printContract = await page.evaluate(() => {
        const styleFor = (selector: string) => {
          const element = document.querySelector(selector);
          if (!element) throw new Error(`Missing print contract element: ${selector}`);
          return getComputedStyle(element);
        };
        const columnCount = (selector: string) =>
          styleFor(selector).gridTemplateColumns.split(/\s+/).filter(Boolean).length;

        return {
          heroBreakAfter: styleFor('article[data-case-study] > header').breakAfter,
          chapterBreaks: [
            '#decision-path',
            '#decision-operate',
            '#system-delivery',
          ].map((selector) => styleFor(selector).breakBefore),
          feedbackColumns: columnCount('.feedback-loop'),
          evidenceColumns: columnCount('.evidence-levels'),
          h1FontSize: Number.parseFloat(styleFor('article[data-case-study] h1').fontSize),
          h2FontSize: Number.parseFloat(styleFor('article[data-case-study] h2').fontSize),
          componentStatesDisplay: styleFor('.component-states').display,
          darkBandBackground: styleFor('.band--dark').backgroundColor,
          tokenBoardBackground: styleFor('.token-board').backgroundColor,
          decisionCardBackground: styleFor('.decision-card').backgroundColor,
          evidenceMaxHeight: Number.parseFloat(
            styleFor('figure[data-evidence] img').maxHeight,
          ),
          comparisonBreakInside: styleFor('.comparison').breakInside,
        };
      });

      expect(printContract.heroBreakAfter).toBe('page');
      expect(printContract.chapterBreaks).toEqual(['page', 'page', 'page']);
      expect(printContract.feedbackColumns).toBe(4);
      expect(printContract.evidenceColumns).toBe(3);
      expect(printContract.h1FontSize).toBeCloseTo((31 * 96) / 72, 1);
      expect(printContract.h2FontSize).toBeCloseTo((24 * 96) / 72, 1);
      expect(printContract.componentStatesDisplay).toBe('none');
      expect(printContract.darkBandBackground).toBe('rgb(255, 255, 255)');
      expect(printContract.tokenBoardBackground).toBe('rgb(255, 255, 255)');
      expect(printContract.decisionCardBackground).toBe('rgb(255, 255, 255)');
      expect(printContract.evidenceMaxHeight).toBeCloseTo((115 * 96) / 25.4, 1);
      expect(printContract.comparisonBreakInside).toBe('avoid');
    });
  });
}
