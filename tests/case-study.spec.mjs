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
});
