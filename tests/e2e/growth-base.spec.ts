import { expect, test } from '@playwright/test';

test.describe('Growth Base decision showcase', () => {
  test('keeps the five-part desktop narrative interactive and overflow-free', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.goto('/zh/work/growth-base/', { waitUntil: 'domcontentloaded' });

    const sections = await page.locator('article > div > section[id]').evaluateAll(
      (nodes) => nodes.map((node) => node.id),
    );
    expect(sections).toEqual([
      'showcase',
      'task-focus',
      'reward-loop',
      'emotional-language',
      'scene-films',
    ]);
    await expect(page.locator('[data-task-viewport]')).toBeVisible();
    await expect(page.locator('[data-film-shell]')).toHaveCount(2);
    await expect(page.getByTestId('growth-base-film')).toHaveCount(4);

    await page.getByRole('button', { name: '领取静心帐篷' }).click();
    await expect(page.locator('[data-tent-demo]')).toHaveAttribute('data-state', 'claimed');
    await page.getByRole('button', { name: '重新演示帐篷领取' }).click();
    await expect(page.locator('[data-tent-demo]')).toHaveAttribute('data-state', 'ready');

    expect(await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ))).toBe(0);
  });

  test('shows only the unscaled interactive prototype on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');
    await page.goto('/zh/work/growth-base/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-growth-base-case] header').first()).toBeHidden();
    await expect(page.locator('[class*="desktopDecision"]')).toHaveCount(4);
    for (const decision of await page.locator('[class*="desktopDecision"]').all()) {
      await expect(decision).toBeHidden();
    }
    await expect(page.locator('[data-comparison-role="before"]')).toBeHidden();

    const prototype = page.locator('[data-prototype-viewport]');
    await expect(prototype).toBeVisible();
    expect(await prototype.evaluate((node) => node.getBoundingClientRect().width)).toBe(390);
    await expect(page.locator('iframe[title*="成长基地"]')).toHaveCSS('transform', 'none');
  });
});
