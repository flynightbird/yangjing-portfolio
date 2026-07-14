import { test, expect } from '@playwright/test';

test('presents the approved eight-chapter structure', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main > section')).toHaveCount(8);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI 呼叫能力');
  await expect(page.locator('#decision-preview')).toContainText('发布前可见、可测、可控');
  await expect(page.locator('#system-delivery')).toContainText('工程交付');
});

test('states role and evidence boundaries without claiming scaled results', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('唯一产品设计师')).toBeVisible();
  await expect(page.getByText('9 个月', { exact: true })).toBeVisible();
  await expect(page.getByText('约 8 次迭代', { exact: true })).toBeVisible();
  await expect(page.getByText(/少量企业客户.*有限灰度/)).toBeVisible();
  await expect(page.getByText(/尚未规模化推广/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/增长了|提升了\s*\d+%|转化率达到/);
  await expect(page.locator('body')).not.toContainText(/证据缺口|待补充/);
});

test('opens and dismisses evidence images with the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-lightbox]').first().click();
  await expect(page.getByRole('dialog', { name: '查看产品界面' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '查看产品界面' })).toBeHidden();
});

test('provides a compact chapter menu on mobile', async ({ page }, testInfo) => {
  test.skip(!['tablet', 'mobile'].includes(testInfo.project.name), 'compact navigation behavior');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: '打开章节目录' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator('#chapter-nav')).toBeVisible();
});

test('keeps tablet header controls in three non-overlapping columns', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet', 'tablet-only layout');
  await page.goto('/');

  const columns = await page.locator('.site-header').evaluate((header) =>
    getComputedStyle(header).gridTemplateColumns.split(' ').length
  );
  const toggleBox = await page.locator('.chapter-toggle').boundingBox();
  const printBox = await page.locator('.print-button').boundingBox();

  expect(columns).toBe(3);
  expect(toggleBox.x + toggleBox.width).toBeLessThanOrEqual(printBox.x);
});

test('has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('shows all evidence and hides web controls in print', async ({ page }) => {
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-print]')).toBeHidden();
  await expect(page.locator('.skip-link')).toBeHidden();
  await expect(page.locator('#system-delivery')).toBeVisible();
  await expect(page.locator('#chapter-nav')).toBeHidden();
  await expect(page.locator('#decision-preview')).toHaveCSS('break-before', 'auto');
  await expect(page.locator('.feedback-loop')).toHaveCSS('grid-template-columns', /^(\d+(?:\.\d+)?px ){3}\d+(?:\.\d+)?px$/);
});
