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
        'call-agent',
        'convo-ai',
        'aidx',
        'meeting',
        'xuelang',
        'stt-demo',
      ]);

      await expect(page.locator('[data-project-kind="build-lab"]')).toHaveCount(1);
      await expect(page.locator('[data-archive-slot]')).toHaveCount(8);
      await expect(page.locator('[data-project-id="xuelang"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/xuelang/`,
      );
      await expect(page.locator('[data-project-id="meeting"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/meeting/`,
      );
      await expect(page.locator('[data-project-id="stt-demo"] a')).toHaveAttribute(
        'href',
        '/demos/stt-demo/index.html',
      );
      await expect(page.locator('[data-project-id="convo-ai"]')).toHaveAttribute(
        'data-publication-state',
        'temporary-media',
      );

      for (const projectId of projectIds) {
        const projectLinks = page.locator(`[data-project-id="${projectId}"] a`);
        for (let index = 0; index < await projectLinks.count(); index += 1) {
          await expect(projectLinks.nth(index)).toHaveAttribute('target', '_blank');
          await expect(projectLinks.nth(index)).toHaveAttribute(
            'rel',
            /noopener.*noreferrer|noreferrer.*noopener/,
          );
        }
      }

      const aidx = page.locator('[data-project-id="aidx"] a');
      await expect(aidx).toHaveAttribute('href', 'https://aidxtech.com/');
      await expect(aidx).toHaveAttribute('target', '_blank');
      await expect(aidx).toHaveAttribute('rel', /noopener.*noreferrer|noreferrer.*noopener/);
    });
  }

  test('keeps both identities readable in the first viewport', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    const designer = await page.getByRole('heading', { name: 'Product Designer' }).boundingBox();
    const builder = await page.getByRole('heading', { name: 'AI-native Builder' }).boundingBox();
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
    expect(identityLineCounts).toEqual([2, 2]);
    expect((designer?.y ?? viewport.height) + (designer?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect((builder?.y ?? viewport.height) + (builder?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
  });

  test('renders the approved flagship materials and desktop focus motion', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Desktop expansion is disabled for compact viewports.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const stage = page.locator('[data-flagship-focus]');
    const callMedia = page.locator('[data-project-id="call-agent"] [data-media-radius="20"]');
    const convoMedia = page.locator('[data-project-id="convo-ai"] [data-media-radius="20"]');

    await callMedia.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-flagship-focus', 'call-agent');
    await expect(callMedia).toHaveCSS('border-radius', '20px');
    await expect(convoMedia).toHaveCSS('border-radius', '20px');
    await expect(callMedia).toHaveCSS('background-color', 'rgb(86, 91, 85)');
    await expect(convoMedia).toHaveCSS('background-color', 'rgb(73, 79, 88)');
    await expect(callMedia).toHaveCSS('background-image', 'none');
    await expect(convoMedia).toHaveCSS('background-image', 'none');

    await convoMedia.hover();
    await expect(stage).toHaveAttribute('data-flagship-focus', 'convo-ai');
    await expect(callMedia).toHaveCSS('opacity', '0.55');

    await page.locator('[data-project-id="aidx"] h2').hover();
    await expect(stage).toHaveAttribute('data-flagship-focus', 'call-agent');
  });

  test('stacks flagship media without transforms on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only fallback contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const call = page.locator('[data-project-id="call-agent"]');
    const convo = page.locator('[data-project-id="convo-ai"]');
    const callMedia = call.locator('[data-media-radius="20"]');
    const convoMedia = convo.locator('[data-media-radius="20"]');
    const callBox = await call.boundingBox();
    const convoBox = await convo.boundingBox();

    expect(callBox).not.toBeNull();
    expect(convoBox).not.toBeNull();
    expect(convoBox?.y ?? 0).toBeGreaterThan((callBox?.y ?? 0) + (callBox?.height ?? 0));
    await expect(callMedia).toHaveCSS('transform', 'none');
    await expect(convoMedia).toHaveCSS('transform', 'none');
  });

  test('loads every real homepage image and has no horizontal overflow', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const images = page.locator('main img');
    await expect(images).toHaveCount(8);
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
    await expect(page.locator('[data-hero-code-canvas]')).toHaveAttribute('data-scan-runs', '0');
    await expect(page.locator('[data-designer-art="material-blueprint"]')).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });

  test('supports keyboard and pointer control with a scan after drag release', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Hero pointer behavior needs one viewport; responsive coverage runs separately.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const divider = page.getByRole('separator', { name: 'Adjust identity reveal' });
    const canvas = page.locator('[data-hero-code-canvas]');
    await expect(divider).toHaveAttribute('aria-valuenow', '48');

    await divider.focus();
    await divider.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '52');

    const dividerBox = await divider.boundingBox();
    if (!dividerBox) throw new Error('Missing Hero divider bounds');
    const scanRunsBeforeDrag = Number(await canvas.getAttribute('data-scan-runs'));
    await page.mouse.move(
      dividerBox.x + dividerBox.width / 2,
      dividerBox.y + Math.min(180, dividerBox.height / 2),
    );
    await page.mouse.down();
    await page.mouse.move(dividerBox.x + 180, dividerBox.y + 180, { steps: 5 });
    await page.mouse.up();

    expect(Number(await divider.getAttribute('aria-valuenow'))).toBeGreaterThan(52);
    expect(Number(await canvas.getAttribute('data-scan-runs'))).toBeGreaterThan(
      scanRunsBeforeDrag,
    );
  });

  test('keeps the remaining draft work route keyboard reachable and explicitly marked', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Route keyboard behavior needs one viewport; responsive coverage runs separately.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const meetingLink = page.getByRole('link', {
      name: 'Open draft case Meeting',
    });
    await meetingLink.focus();
    await expect(meetingLink).toBeFocused();
    const [meetingPage] = await Promise.all([
      page.context().waitForEvent('page'),
      meetingLink.press('Enter'),
    ]);
    await meetingPage.waitForLoadState('networkidle');

    await expect(meetingPage).toHaveURL(/\/en\/work\/meeting\/$/);
    await expect(meetingPage.locator('[data-publication-state="draft"]')).toBeVisible();
    await expect(meetingPage.getByText('Draft', { exact: true }).first()).toBeVisible();
  });
});
