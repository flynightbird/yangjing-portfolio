import { expect, test } from '@playwright/test';

test('extensionless locale directories resolve to their index', async ({
  page,
}) => {
  const response = await page.goto('/en');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Yang Jing' })).toBeVisible();
});

test('malformed URL escapes use the custom 404 response', async ({ request }) => {
  const response = await request.get('/%ZZ');

  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('Page not found');
});

test('exported image assets use their correct content type', async ({
  request,
}) => {
  const response = await request.get(
    '/images/call-agent/after-resource-management.png',
  );

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
});

test('unknown routes show bilingual recovery navigation', async ({ page }) => {
  const response = await page.goto('/missing-portfolio-page/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByText('Page not found')).toBeVisible();
  await expect(page.getByText('页面未找到')).toBeVisible();
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute(
    'href',
    '/en/',
  );
  const chineseRecovery = page.getByRole('link', { name: '中文' });
  await expect(chineseRecovery).toHaveAttribute('href', '/zh/');
  await expect(chineseRecovery).toHaveAttribute('lang', 'zh-CN');
});

test('unregistered work routes return the real static 404 response', async ({
  request,
}) => {
  for (const locale of ['en', 'zh']) {
    for (const slug of ['bytedance', 'meeting']) {
      const response = await request.get(`/${locale}/work/${slug}/`);
      expect(response.status(), `${locale}/work/${slug}`).toBe(404);
      expect(await response.text()).toContain('Page not found');
    }
  }
});

test('unregistered Build Lab routes return the real static 404 response', async ({
  request,
}) => {
  for (const locale of ['en', 'zh']) {
    const response = await request.get(`/${locale}/build/another-demo/`);
    expect(response.status(), `${locale}/build/another-demo`).toBe(404);
    expect(await response.text()).toContain('Page not found');
  }
});
