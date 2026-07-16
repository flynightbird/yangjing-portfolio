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

  test('keeps both identities and the Xuelang edge in the first viewport', async ({
    page,
  }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    const designer = await page.getByRole('heading', { name: 'Product Designer' }).boundingBox();
    const builder = await page.getByRole('heading', { name: 'AI-native Builder' }).boundingBox();
    const xuelang = await page.locator('[data-project-id="xuelang"]').boundingBox();
    const xuelangHeading = await page
      .locator('[data-project-id="xuelang"] h2')
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
    expect(xuelang).not.toBeNull();
    expect(xuelangHeading).not.toBeNull();
    expect(identityLineCounts).toEqual([2, 2]);
    expect((designer?.y ?? viewport.height) + (designer?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect((builder?.y ?? viewport.height) + (builder?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
    expect(xuelang?.y ?? viewport.height).toBeLessThan(viewport.height);
    expect(xuelangHeading?.y ?? viewport.height).toBeLessThan(
      viewport.height - 32,
    );
  });

  test('loads every real homepage image and has no horizontal overflow', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const images = page.locator('main img:not([data-placeholder-media])');
    await expect(images).toHaveCount(8);
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
    expect(
      await page.getByRole('heading', { name: 'Product Designer' }).evaluate(
        (heading) => getComputedStyle(heading.parentElement as HTMLElement).transform,
      ),
    ).toBe('none');
    expect(hydrationErrors).toEqual([]);
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
