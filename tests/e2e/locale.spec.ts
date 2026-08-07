import { expect, test } from '@playwright/test';

const zhHomepageIdentity = '专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。';

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
  await expect(page.locator('main')).toContainText(zhHomepageIdentity);
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
  await expect(page.locator('main')).toContainText(zhHomepageIdentity);
});

test('switches locale while preserving the homepage identity', async ({ page }) => {
  await page.goto('/en/');

  await page.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();

  await expect(page).toHaveURL(/\/zh\/$/);
  await expect(page.locator('main')).toContainText(zhHomepageIdentity);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('yj-locale')))
    .toBe('zh');
});

test('switches Growth Base locale without returning to the homepage', async ({ page }) => {
  await page.goto('/zh/work/growth-base/');

  await page.getByRole('button', { name: '切换至英语' }).click();

  await expect(page).toHaveURL(/\/en\/work\/growth-base\/$/);
  await expect(page.getByRole('heading', { name: 'AI Coach · Emotional IP Companionship' })).toBeVisible();
});
