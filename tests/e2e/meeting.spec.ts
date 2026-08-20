import { expect, test } from '@playwright/test';

const chapterIds = [
  'challenge',
  'design-challenges',
  'adaptive-canvas',
  'visible-states',
  'different-roles',
  'chat-deep-dive',
  'logic-summary',
  'reflection',
];

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} Agora Meeting case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(`/${locale}/work/meeting/`, { waitUntil: 'domcontentloaded' });
    });

    test('renders the approved case and shipped boundaries', async ({ page }) => {
      await expect(page.locator('[data-meeting-case]')).toBeVisible();
      const ids = await page.locator('article[data-case-study] > div > section')
        .evaluateAll((sections) => sections.map(({ id }) => id));

      expect(ids).toEqual(chapterIds);
      await expect(page.getByText(
        locale === 'zh' ? '独立负责产品设计' : 'Independent Product Designer',
        { exact: true },
      )).toBeVisible();
      await expect(page.getByText(
        locale === 'zh' ? '已上线' : 'Shipped',
        { exact: true },
      )).toBeVisible();
      await expect(page.locator('body')).not.toContainText(
        /提升了?\s*\d+%|increased by\s*\d+%/i,
      );
    });

    test('loads committed static evidence without missing recordings', async ({ page }) => {
      await expect(page.locator('article[data-case-study] > header video[src^="/videos/meeting/"]').first()).toBeVisible();
      await expect(page.locator('#adaptive-canvas video[src^="/videos/meeting/"]')).toHaveCount(6);
      await expect(page.locator('#visible-states video[src^="/videos/meeting/"]')).toHaveCount(4);
      await expect(page.locator('#chat-deep-dive video[src^="/videos/meeting/"]')).toHaveCount(2);
      await expect(page.getByRole('button', { name: locale === 'zh' ? '重播' : 'Replay' })).toBeVisible();
      await expect(page.getByText('Agora Meeting', { exact: true })).toBeVisible();
      await expect(
        page.locator('#adaptive-canvas').getByText(
          locale === 'zh' ? '手机横屏' : 'Mobile landscape',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.locator('#adaptive-canvas').getByText(
          locale === 'zh' ? '手机竖屏' : 'Mobile portrait',
          { exact: true },
        ).first(),
      ).toBeVisible();
      await expect(
        locale === 'zh'
          ? page.locator('#adaptive-canvas figure figcaption > strong').filter({
            hasText: '对话、共享与协作状态',
          }).first()
          : page.locator('#adaptive-canvas figure figcaption > span').filter({
            hasText: 'Web',
          }).first(),
      ).toBeVisible();
      await expect(
        locale === 'zh'
          ? page.locator('#adaptive-canvas figure figcaption > strong').filter({
            hasText: '白板占据主舞台，会议控制仍然可用',
          }).first()
          : page.locator('#adaptive-canvas figure figcaption > span').filter({
            hasText: 'Web',
          }).first(),
      ).toBeVisible();

      const layoutSection = page.locator('#adaptive-canvas');
      await expect(layoutSection.locator('figure')).toHaveCount(6);
      await expect(layoutSection).not.toContainText(/分组讨论|Breakout rooms/);
      await expect(layoutSection.locator('img[src*="capability-system"]')).toHaveCount(0);

      const breakoutSection = page.locator('#visible-states');
      await expect(breakoutSection).toContainText(
        locale === 'zh' ? '让会议状态始终可感知' : 'Keep users aware of what is happening',
      );
      await expect(breakoutSection.locator('img[src*="capability-system"]')).toHaveCount(1);
      await expect(page.locator('#visible-states figure figcaption > span').filter({
        hasText: locale === 'zh' ? '字幕反馈' : 'Live captions',
      }).first()).toBeVisible();
      await expect(page.locator('#visible-states figure figcaption > span').filter({
        hasText: locale === 'zh' ? '实时转写' : 'Live transcript',
      }).first()).toBeVisible();
      await expect(page.locator('[data-meeting-logic-summary]')).toBeVisible();
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
