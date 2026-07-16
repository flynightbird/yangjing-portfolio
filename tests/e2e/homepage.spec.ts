import { expect, test } from '@playwright/test';

test.describe('portfolio homepage framework', () => {
  test('uses the dark theme by default without exposing a theme switcher', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const theme = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      return { background: body.backgroundColor, color: body.color };
    });

    expect(theme).toEqual({
      background: 'rgb(17, 19, 17)',
      color: 'rgb(242, 244, 240)',
    });
    await expect(page.getByRole('button', { name: /theme|主题/i })).toHaveCount(0);
  });

  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} keeps the approved hierarchy and destinations`, async ({ page }) => {
      await page.goto(`/${locale}/`, { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeVisible();
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Product Designer',
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'AI-native Builder',
        }),
      ).toBeVisible();

      const sectionOrder = await page.locator(
        '[data-media="portrait"], [data-intro-story], #work, [data-archive-carousel]',
      ).evaluateAll((sections) => sections.map((section) => (
        section.hasAttribute('data-media')
          ? 'hero'
          : section.hasAttribute('data-intro-story')
            ? 'intro'
            : section.id || 'archive'
      )));
      expect(sectionOrder).toEqual(['hero', 'intro', 'work', 'archive']);

      const projectIds = await page
        .locator('[data-project-id]')
        .evaluateAll((projects) =>
          projects.map((project) => project.getAttribute('data-project-id')),
        );
      expect(projectIds).toEqual([
        'xuelang',
        'call-agent',
        'meeting',
        'aidx',
        'stt-demo',
      ]);

      await expect(page.locator('[data-project-kind="build-lab"]')).toHaveCount(1);
      await expect(page.locator('[data-archive-card]')).toHaveCount(4);
      await expect(page.locator('[data-archive-slot]')).toHaveCount(0);
      await expect(page.locator('[data-cover-variant]')).toHaveCount(4);
      await expect(page.locator('[data-project-id="xuelang"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/xuelang/`,
      );
      await expect(page.locator('[data-project-id="meeting"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/meeting/`,
      );

      for (const projectId of projectIds) {
        const projectLink = page.locator(`[data-project-id="${projectId}"] a`);
        await expect(projectLink).toHaveAttribute('target', '_blank');
        await expect(projectLink).toHaveAttribute(
          'rel',
          /noopener.*noreferrer|noreferrer.*noopener/,
        );
      }

      const aidx = page.locator('[data-project-id="aidx"] a');
      await expect(aidx).toHaveAttribute('href', 'https://aidxtech.com/');
      await expect(aidx).toHaveAttribute('target', '_blank');
      await expect(aidx).toHaveAttribute('rel', /noopener.*noreferrer|noreferrer.*noopener/);
    });
  }

  test('keeps both identities in the taller first viewport with weight 800', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    const designer = await page.getByRole('heading', { name: 'Product Designer' }).boundingBox();
    const builder = await page.getByRole('heading', { name: 'AI-native Builder' }).boundingBox();
    const hero = await page.locator('[data-media="portrait"]').boundingBox();
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
    expect(hero).not.toBeNull();
    expect(identityLineCounts).toEqual([2, 2]);
    expect((designer?.y ?? viewport.height) + (designer?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect((builder?.y ?? viewport.height) + (builder?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect(hero?.height ?? 0).toBeGreaterThanOrEqual(
      viewport.width < 768 ? 750 : 780,
    );
    await expect(page.getByRole('heading', { name: 'Product Designer' })).toHaveCSS(
      'font-weight',
      '800',
    );
    await expect(page.getByRole('heading', { name: 'AI-native Builder' })).toHaveCSS(
      'font-weight',
      '800',
    );
  });

  test('loads every real homepage image and has no horizontal overflow', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const images = page.locator('main img:not([data-placeholder-media])');
    await expect(images).toHaveCount(10);
    for (let index = 0; index < await images.count(); index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((node) => {
            const rendered = node as HTMLImageElement;
            return (
              rendered.complete &&
              rendered.naturalWidth > 0 &&
              rendered.naturalHeight > 0
            );
          }),
        )
        .toBe(true);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('keeps the Visual Archive compact while revealing the next project', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    const archive = page.locator('[data-archive-carousel]');
    const cards = archive.locator('[data-archive-card]');
    const scroller = archive.locator('[data-archive-scroller]');
    await archive.scrollIntoViewIfNeeded();

    await expect(cards).toHaveCount(4);
    const [archiveBox, firstBox, secondBox] = await Promise.all([
      archive.boundingBox(),
      cards.nth(0).boundingBox(),
      cards.nth(1).boundingBox(),
    ]);
    expect(archiveBox).not.toBeNull();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(archiveBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThan(
      viewport.height * 1.15,
    );
    expect(secondBox?.x ?? viewport.width).toBeLessThan(viewport.width);
    expect(
      await scroller.evaluate((element) => getComputedStyle(element).scrollSnapType),
    ).toContain('x');
  });

  test('moves the Visual Archive with explicit controls and reports position', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Carousel control behavior needs one viewport; responsive coverage runs separately.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const archive = page.locator('[data-archive-carousel]');
    const scroller = archive.locator('[data-archive-scroller]');
    const previous = archive.getByRole('button', {
      name: 'Previous archive project',
    });
    const next = archive.getByRole('button', { name: 'Next archive project' });
    await archive.scrollIntoViewIfNeeded();

    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    await expect(archive.locator('[data-archive-position]')).toContainText('01 / 04');
    const before = await scroller.evaluate((element) => element.scrollLeft);

    await next.click();
    await expect
      .poll(() => scroller.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(before + 20);
    await expect(archive.locator('[data-archive-position]')).toContainText('02 / 04');

    await previous.click();
    await expect(previous).toBeDisabled();
    await expect(archive.locator('[data-archive-position]')).toContainText('01 / 04');
  });

  test('keeps the final Visual Archive card active at the end of the track', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Carousel end-state behavior needs one viewport.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const archive = page.locator('[data-archive-carousel]');
    const next = archive.getByRole('button', { name: 'Next archive project' });
    await archive.scrollIntoViewIfNeeded();

    await next.click();
    await next.click();
    await next.click();

    await expect(archive.locator('[data-archive-position]')).toContainText('04 / 04');
    await expect(archive.locator('[data-archive-card]').last()).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(next).toBeDisabled();
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
    await expect(page.locator('[data-hero-code-canvas]')).toHaveAttribute(
      'data-scan-runs',
      '0',
    );
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
