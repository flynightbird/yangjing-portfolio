import { expect, test } from '@playwright/test';

test.describe('portfolio homepage framework', () => {
  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} keeps the approved hierarchy and destinations`, async ({ page }) => {
      await page.goto(`/${locale}/`, { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeVisible();
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: locale === 'zh' ? '产品设计师' : 'Product Designer',
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: locale === 'zh' ? 'AI 原生构建者' : 'AI-native Builder',
        }),
      ).toBeVisible();

      const projectIds = await page
        .locator('[data-project-id]')
        .evaluateAll((projects) =>
          projects.map((project) => project.getAttribute('data-project-id')),
        );
      expect(projectIds).toEqual([
        'bytedance',
        'call-agent',
        'meeting',
        'aidx',
        'stt-demo',
      ]);

      await expect(page.locator('[data-project-kind="build-lab"]')).toHaveCount(1);
      await expect(page.locator('[data-archive-slot]')).toHaveCount(8);
      await expect(page.locator('[data-project-id="bytedance"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/bytedance/`,
      );
      await expect(page.locator('[data-project-id="meeting"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/meeting/`,
      );

      const aidx = page.locator('[data-project-id="aidx"] a');
      await expect(aidx).toHaveAttribute('href', 'https://aidxtech.com/');
      await expect(aidx).toHaveAttribute('target', '_blank');
      await expect(aidx).toHaveAttribute('rel', /noopener.*noreferrer|noreferrer.*noopener/);
    });
  }

  test('keeps both identities and the ByteDance edge in the first viewport', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    const designer = await page.getByRole('heading', { name: 'Product Designer' }).boundingBox();
    const builder = await page.getByRole('heading', { name: 'AI-native Builder' }).boundingBox();
    const bytedance = await page.locator('[data-project-id="bytedance"]').boundingBox();
    const bytedanceHeading = await page
      .locator('[data-project-id="bytedance"] h2')
      .boundingBox();
    const identityLineCounts = await page
      .getByRole('heading', { level: 2 })
      .filter({ hasText: /Product Designer|AI-native Builder/ })
      .evaluateAll((headings) =>
        headings.map((heading) => {
          const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);
          return Math.round(heading.getBoundingClientRect().height / lineHeight);
        }),
      );

    expect(designer).not.toBeNull();
    expect(builder).not.toBeNull();
    expect(bytedance).not.toBeNull();
    expect(bytedanceHeading).not.toBeNull();
    expect(identityLineCounts).toEqual([2, 2]);
    expect((designer?.y ?? viewport.height) + (designer?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect((builder?.y ?? viewport.height) + (builder?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect(bytedance?.y ?? viewport.height).toBeLessThan(viewport.height);
    expect(bytedanceHeading?.y ?? viewport.height).toBeLessThan(
      viewport.height - 32,
    );
  });

  test('loads every real homepage image and has no horizontal overflow', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const images = page.locator('main img');
    await expect(images).toHaveCount(3);
    for (let index = 0; index < await images.count(); index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      const dimensions = await image.evaluate((node) => {
        const rendered = node as HTMLImageElement;
        return {
          complete: rendered.complete,
          naturalWidth: rendered.naturalWidth,
          naturalHeight: rendered.naturalHeight,
        };
      });
      expect(dimensions.complete).toBe(true);
      expect(dimensions.naturalWidth).toBeGreaterThan(0);
      expect(dimensions.naturalHeight).toBeGreaterThan(0);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('keeps reduced-motion output static and readable', async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on('console', (message) => {
      if (/hydration|hydrated/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: 'Product Designer' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI-native Builder' })).toBeVisible();
    await expect(page.locator('[data-media="portrait"]')).toBeVisible();
    expect(
      await page.getByRole('heading', { name: 'Product Designer' }).evaluate(
        (heading) => getComputedStyle(heading.parentElement as HTMLElement).transform,
      ),
    ).toBe('none');
    expect(hydrationErrors).toEqual([]);
  });

  test('keeps draft work routes keyboard reachable and explicitly marked', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Route keyboard behavior needs one viewport; responsive coverage runs separately.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const byteDanceLink = page.getByRole('link', {
      name: 'Open draft case ByteDance',
    });
    await byteDanceLink.focus();
    await expect(byteDanceLink).toBeFocused();
    await byteDanceLink.press('Enter');

    await expect(page).toHaveURL(/\/en\/work\/bytedance\/$/);
    await expect(page.locator('[data-publication-state="draft"]')).toBeVisible();
    await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible();
  });
});
