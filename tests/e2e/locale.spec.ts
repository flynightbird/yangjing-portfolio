import { expect, test } from '@playwright/test';

test('renders the English and Simplified Chinese homepages directly', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { name: 'Yang Jing' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toContainText('Product Designer');

  await page.goto('/zh/');
  await expect(page.getByRole('heading', { name: 'Yang Jing' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('main')).toContainText('产品设计师');
});

test('defaults a fresh root visit to English', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.getByRole('heading', { name: 'Yang Jing' })).toBeVisible();
});

test('resolves a stored Chinese preference from the root page', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('yj-locale', 'zh');
  });

  await page.goto('/');

  await expect(page).toHaveURL(/\/zh\/$/);
  await expect(page.locator('main')).toContainText('产品设计师');
});

test('switches locale while preserving the homepage identity', async ({ page }) => {
  await page.goto('/en/');

  await page.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();

  await expect(page).toHaveURL(/\/zh\/$/);
  await expect(page.locator('main')).toContainText('产品设计师');
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('yj-locale')))
    .toBe('zh');
});
