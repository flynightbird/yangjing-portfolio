import { expect, test } from '@playwright/test';

test.describe('portfolio homepage framework', () => {
  test('does not show field labels in the hero corners', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const fieldLabels = await page.evaluate(() => {
      const builder = document.querySelector('[data-hero-code-canvas]')?.parentElement;
      const designer = document.querySelector('[data-designer-art="material-blueprint"]')?.parentElement;

      return [builder, designer].map((field) =>
        field ? getComputedStyle(field, '::after').content : null,
      );
    });

    expect(fieldLabels).toEqual(['none', 'none']);
  });

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

      await expect(page.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeAttached();
      await expect(page.getByText('Designer / Builder', { exact: true })).toHaveCount(0);
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
        'call-agent',
        'convo-ai',
        'meeting',
        'stt-demo',
        'aidx',
        'xuelang',
      ]);

      const callAgent = page.locator('[data-project-id="call-agent"]');
      const convoAi = page.locator('[data-project-id="convo-ai"]');
      await expect(callAgent).not.toContainText(
        /Limited beta|Real product evidence|有限客户测试|真实产品证据/,
      );
      await expect(convoAi).not.toContainText(
        /temporary third-party|media replacement|temporary web and app|临时第三方|等待替换|临时 Web 与 App/i,
      );
      await expect(page.locator('[data-project-id="meeting"]')).toContainText(
        locale === 'zh' ? '已在四类终端上线' : 'Shipped across four platforms',
      );
      await expect(page.locator('[data-project-id="aidx"]')).toContainText(
        locale === 'zh' ? '网站已上线' : 'Live website',
      );
      await expect(page.locator('[data-project-id="stt-demo"]')).toContainText(
        locale === 'zh' ? 'Agora RTE 2026 大会发布' : 'Pinned static prototype',
      );

      await expect(page.locator('[data-company-mark]')).toHaveCount(6);
      await expect(page.locator('[data-project-meta]')).toHaveCount(6);
      await expect(page.locator('[data-cta-treatment="white"]')).toHaveCount(3);
      const projectCtas = page.locator('[data-home-project-cta]');
      await expect(projectCtas).toHaveCount(6);
      expect(await projectCtas.evaluateAll((ctas) => ctas.map((cta) => {
        const style = getComputedStyle(cta);
        return {
          height: style.height,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        };
      }))).toEqual(Array.from({ length: 6 }, () => ({
        height: '48px',
        fontSize: '14px',
        fontWeight: '500',
      })));
      await expect(
        page.locator('[data-project-id="convo-ai"] [data-home-project-cta] [data-remix-icon]'),
      ).toHaveCount(0);
      await expect(
        page.locator('[data-project-id="aidx"] [data-home-project-cta] [data-remix-icon]'),
      ).toHaveCount(1);
      await expect(
        page.locator('[data-project-id="stt-demo"] [data-home-project-cta] [data-remix-icon]'),
      ).toHaveCount(1);
      await expect(page.locator('[data-project-chapter]')).toHaveCount(4);
      await expect(page.locator('[data-aidx-showcase]')).toHaveCount(1);
      await expect(page.locator('[data-aidx-browser]')).toHaveAttribute(
        'data-browser-theme',
        'light',
      );
      await expect(
        page.locator('[data-project-id="xuelang"] [data-project-media-frame]'),
      ).toHaveCSS('border-radius', '20px');
      await expect(page.locator('[data-liquid-field="footer"]')).toHaveCount(1);
      await expect(page.locator('#archive')).toHaveCount(1);
      await expect(page.locator('[data-about-preview]')).toHaveCount(0);
      await expect(
        page.getByRole('heading', {
          name: locale === 'zh' ? 'More C 端产品作品' : 'More Consumer Product Work',
        }),
      ).toBeVisible();
      await expect(
        page.locator('footer a[href="mailto:amanda.yangj@gmail.com"]'),
      ).toHaveCount(2);

      await expect(page.locator('[data-project-kind="build-lab"]')).toHaveCount(1);
      await expect(page.locator('[data-archive-card]')).toHaveCount(4);
      await expect(page.locator('[data-archive-slot]')).toHaveCount(0);
      await expect(page.locator('[data-cover-variant]')).toHaveCount(4);
      await expect(
        page.locator('[data-archive-card]').first().getByRole('button', {
          name: locale === 'zh' ? /打开项目图片: 躺平/ : /Open project image: Tangping/,
        }),
      ).toBeVisible();
      await expect(page.locator('[data-project-id="xuelang"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/xuelang/`,
      );
      await expect(page.locator('[data-project-id="meeting"] a')).toHaveAttribute(
        'href',
        `/${locale}/work/meeting/`,
      );
      await expect(page.locator('[data-project-id="convo-ai"] a').first()).toHaveAttribute(
        'href',
        `/${locale}/work/convo-ai/`,
      );

      for (const [projectId, tone] of Object.entries({
        xuelang: 'light',
        'call-agent': 'dark',
        'convo-ai': 'dark',
        meeting: 'dark',
      })) {
        const projectLinks = page.locator(`[data-project-id="${projectId}"] a`);
        for (let index = 0; index < await projectLinks.count(); index += 1) {
          await expect(projectLinks.nth(index)).toHaveAttribute(
            'data-page-transition-tone',
            tone,
          );
          await expect(projectLinks.nth(index)).not.toHaveAttribute('target');
        }
      }

      for (const projectId of ['aidx', 'stt-demo']) {
        const projectLinks = page.locator(`[data-project-id="${projectId}"] a`);
        for (let index = 0; index < await projectLinks.count(); index += 1) {
          await expect(projectLinks.nth(index)).not.toHaveAttribute(
            'data-page-transition-tone',
          );
          await expect(projectLinks.nth(index)).toHaveAttribute('target', '_blank');
          await expect(projectLinks.nth(index)).toHaveAttribute(
            'rel',
            /noopener.*noreferrer|noreferrer.*noopener/,
          );
        }
      }

      const aidxLinks = page.locator('[data-project-id="aidx"] a');
      await expect(aidxLinks).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        await expect(aidxLinks.nth(index)).toHaveAttribute('href', 'https://aidxtech.com/');
        await expect(aidxLinks.nth(index)).toHaveAttribute('target', '_blank');
        await expect(aidxLinks.nth(index)).toHaveAttribute(
          'rel',
          /noopener.*noreferrer|noreferrer.*noopener/,
        );
      }
    });
  }

  test('finishes the destination-toned sweep before same-tab navigation', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One canonical motion viewport is sufficient.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    await page
      .getByRole('link', {
        name: 'View case study Xuelang Commercial Experience Upgrade',
      })
      .click();

    const overlay = page.locator('[data-testid="page-transition-layer"]');
    await expect(overlay).toHaveAttribute('data-state', 'running');
    await expect(overlay).toHaveAttribute('data-tone', 'light');
    await page.waitForTimeout(600);
    expect(new URL(page.url()).pathname).toBe('/en/');
    await page.waitForURL('**/en/work/xuelang/');

    await page.goto('/en/', { waitUntil: 'networkidle' });
    await page
      .locator('[data-project-id="call-agent"] [data-page-transition-tone="dark"]')
      .first()
      .click();
    await expect(page.locator('[data-testid="page-transition-layer"]')).toHaveAttribute(
      'data-tone',
      'dark',
    );
    await page.waitForURL('**/en/work/call-agent/');
  });

  test('opens the latest Xuelang evidence case from the homepage', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One canonical entry path is sufficient.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    await page
      .getByRole('link', {
        name: 'View case study Xuelang Commercial Experience Upgrade',
      })
      .click();
    await page.waitForURL('**/en/work/xuelang/');

    await expect(page.locator('[data-hero-product-state]')).toHaveCount(4);
    await expect(page.locator('[data-course-entry-interactive]')).toHaveCount(1);
    await expect(page.locator('[data-interaction-board]')).toHaveCount(1);
  });

  test('has no page-level horizontal overflow', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  });

  test('morphs the full-width header into a centered capsule', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop navigation geometry contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const header = page.getByRole('banner');
    const home = page.getByRole('link', { name: 'Yang Jing home' });
    const topWidth = await header.locator('> div').evaluate(
      (element) => element.getBoundingClientRect().width,
    );

    await expect(home).toHaveText('Yang Jing');
    await expect(header).toHaveAttribute('data-scrolled', 'false');
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await expect(header).toHaveAttribute('data-scrolled', 'true');
    await expect
      .poll(() =>
        header.locator('> div').evaluate(
          (element) => element.getBoundingClientRect().width,
        ),
      )
      .toBeLessThan(topWidth);
  });

  test('keeps capsule actions and anchored sections clear of the floating header', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop navigation overlap contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    await expect(
      page.locator('[data-project-id="aidx"] [data-action-variant="signal"]'),
    ).toHaveCSS('border-radius', '999px');

    await page.getByRole('link', { name: 'Archive' }).click();
    await expect(page).toHaveURL(/#archive$/);
    const header = await page.getByRole('banner').boundingBox();
    const title = await page.getByRole('heading', {
      name: 'More Consumer Product Work',
    }).boundingBox();
    expect(header).not.toBeNull();
    expect(title).not.toBeNull();
    expect(title?.y ?? 0).toBeGreaterThan((header?.y ?? 0) + (header?.height ?? 0));
  });

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
    const convoBrowser = convoMedia.locator('[data-convo-web-browser]');
    const convoViewport = convoBrowser.locator('[data-convo-web-viewport]');
    const convoWebImage = convoViewport.locator('img');
    const convoPhone = convoMedia.locator('[data-convo-phone]');
    const convoPhoneImage = convoPhone.locator('img');

    await callMedia.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-flagship-focus', 'call-agent');
    await expect(callMedia).toHaveCSS('border-radius', '20px');
    await expect(convoMedia).toHaveCSS('border-radius', '20px');
    await expect(callMedia).toHaveCSS('background-color', 'rgb(232, 221, 187)');
    await expect(convoMedia).toHaveCSS('background-color', 'rgb(199, 199, 193)');
    await expect(callMedia).toHaveCSS('background-image', 'none');
    await expect(convoMedia).not.toHaveCSS('background-image', 'none');
    await expect(convoBrowser).toBeVisible();
    await expect(convoWebImage).toHaveCSS('object-position', '0% 0%');
    await expect(convoPhone).toBeVisible();

    const mediaBox = await convoMedia.boundingBox();
    const viewportBox = await convoViewport.boundingBox();
    const webImageBox = await convoWebImage.boundingBox();
    const phoneBox = await convoPhone.boundingBox();
    expect(mediaBox).not.toBeNull();
    expect(viewportBox).not.toBeNull();
    expect(webImageBox).not.toBeNull();
    expect(phoneBox).not.toBeNull();
    expect(Math.abs((webImageBox?.x ?? 0) - (viewportBox?.x ?? 0))).toBeLessThanOrEqual(1);
    expect(phoneBox?.x ?? 0).toBeGreaterThan(mediaBox?.x ?? 0);
    expect((phoneBox?.x ?? 0) + (phoneBox?.width ?? 0)).toBeLessThanOrEqual(
      (mediaBox?.x ?? 0) + (mediaBox?.width ?? 0),
    );
    expect((phoneBox?.y ?? 0) + (phoneBox?.height ?? 0)).toBeLessThanOrEqual(
      (mediaBox?.y ?? 0) + (mediaBox?.height ?? 0),
    );
    const [phoneRadius, phoneImageRadius] = await Promise.all([
      convoPhone.evaluate((element) => getComputedStyle(element).borderRadius),
      convoPhoneImage.evaluate((element) => getComputedStyle(element).borderRadius),
    ]);
    expect(phoneRadius).not.toBe('0px');
    expect(phoneImageRadius).toBe(phoneRadius);

    const studioFrame = callMedia.locator('[data-convo-studio-frame]');
    await expect(studioFrame).toHaveAttribute(
      'src',
      '/demos/convo-ai-studio/en/index.html',
    );
    await expect(studioFrame).toHaveAttribute('tabindex', '-1');
    await expect(studioFrame).toHaveCSS('pointer-events', 'none');
    await expect(callMedia.locator('a')).toHaveCount(1);

    const callBox = await callMedia.boundingBox();
    expect(callBox).not.toBeNull();
    await page.mouse.move(
      (callBox?.x ?? 0) + (callBox?.width ?? 0) * 0.8,
      (callBox?.y ?? 0) + (callBox?.height ?? 0) * 0.3,
    );
    await expect
      .poll(() =>
        callMedia.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--studio-drift-x').trim(),
        ),
      )
      .not.toBe('0px');

    const studioDocument = studioFrame.contentFrame();
    const studioSidebar = studioDocument.locator('[data-studio-sidebar]');
    const studioScrollPanel = studioDocument.locator('[data-studio-scroll-panel]');
    const sidebarStart = await studioSidebar.evaluate(
      (element) => element.getBoundingClientRect().y,
    );
    const panelTransformStart = await studioScrollPanel.evaluate(
      (element) => getComputedStyle(element).transform,
    );

    await page.waitForTimeout(2400);

    const sidebarEnd = await studioSidebar.evaluate(
      (element) => element.getBoundingClientRect().y,
    );
    const panelTransformEnd = await studioScrollPanel.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    expect(sidebarEnd).toBeCloseTo(sidebarStart, 4);
    expect(panelTransformEnd).not.toBe(panelTransformStart);

    await convoMedia.hover();
    await expect(stage).toHaveAttribute('data-flagship-focus', 'convo-ai');
    await expect(callMedia).toHaveCSS('opacity', '0.55');

    await page.locator('[data-project-id="meeting"] h2').hover();
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
    await expect(convoMedia.locator('[data-convo-web-browser]')).toBeHidden();
    await expect(convoMedia.locator('[data-convo-phone]')).toBeHidden();
    await expect(convoMedia.locator('[data-convo-mobile-loop]')).toBeVisible();
    await expect(convoMedia.locator('[data-convo-mobile-poster]')).toBeHidden();
    await expect(callMedia.locator('[data-convo-studio-window]')).toHaveCSS(
      'transform',
      'none',
    );
    const studioFrame = callMedia.locator('[data-convo-studio-frame]');
    const scrollPanel = studioFrame.contentFrame().locator('[data-studio-scroll-panel]');
    const transformStart = await scrollPanel.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    await page.waitForTimeout(1200);
    await expect
      .poll(() => scrollPanel.evaluate((element) => getComputedStyle(element).transform))
      .toBe(transformStart);
  });

  test('uses the static ConvoAI poster on mobile with reduced motion', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile reduced-motion contract.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const convoMedia = page.locator('[data-project-id="convo-ai"] [data-convo-home-media]');
    await convoMedia.scrollIntoViewIfNeeded();
    await expect(convoMedia.locator('[data-convo-mobile-loop]')).toBeHidden();
    await expect(convoMedia.locator('[data-convo-mobile-poster]')).toBeVisible();
  });

  test('uses a media-dominant STT stage with direct prototype actions', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop STT composition contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const stt = page.locator('[data-project-id="stt-demo"]');
    const copy = stt.locator('[data-stt-copy]');
    const media = stt.locator('[data-stt-media-stage]');
    const browserWindow = stt.locator('[data-stt-browser-window]');
    const copyBox = await copy.boundingBox();
    const mediaBox = await media.boundingBox();

    expect(copyBox).not.toBeNull();
    expect(mediaBox).not.toBeNull();
    expect((mediaBox?.width ?? 0) / (copyBox?.width ?? 1)).toBeGreaterThan(1.7);
    await expect(media).toHaveCSS('border-radius', '20px');
    await expect(stt.locator('iframe')).toHaveCount(0);
    await expect(stt.locator('img')).toHaveAttribute(
      'src',
      '/images/stt-demo/stt-product-stage@2x.png',
    );

    const links = stt.locator('a');
    await expect(links).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(links.nth(index)).toHaveAttribute(
        'href',
        '/demos/stt-demo/index.html',
      );
    }

    const restingTransform = await browserWindow.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    await media.hover({ position: { x: (mediaBox?.width ?? 400) - 24, y: 36 } });
    await expect
      .poll(() => browserWindow.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(restingTransform);

    await page.mouse.move(24, 24);
    await expect
      .poll(() => browserWindow.evaluate((element) => getComputedStyle(element).transform))
      .toBe(restingTransform);
  });

  test('keeps the STT window static for reduced motion and stacks media first on mobile', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['desktop', 'mobile'].includes(testInfo.project.name),
      'STT fallback contract only needs desktop and mobile coverage.',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const stt = page.locator('[data-project-id="stt-demo"]');
    const copy = stt.locator('[data-stt-copy]');
    const media = stt.locator('[data-stt-media-stage]');
    const browserWindow = stt.locator('[data-stt-browser-window]');
    await stt.scrollIntoViewIfNeeded();
    const mediaBox = await media.boundingBox();

    expect(mediaBox).not.toBeNull();
    const restingTransform = await browserWindow.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    await media.hover({ position: { x: (mediaBox?.width ?? 320) - 16, y: 24 } });
    await expect(browserWindow).toHaveCSS('transform', restingTransform);

    if (testInfo.project.name === 'mobile') {
      const copyBox = await copy.boundingBox();
      expect(copyBox).not.toBeNull();
      expect(mediaBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(
        copyBox?.y ?? Number.NEGATIVE_INFINITY,
      );
    }
  });

  test('loads every real homepage image and has no horizontal overflow', async ({ page }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const images = page.locator('main img:not([data-placeholder-media])');
    await expect(images).toHaveCount(11);
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
    await expect(archive).toHaveCSS('border-bottom-width', '0px');
  });

  test('keeps AIDX navigation visible and centers the Xuelang media', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project geometry contract.');
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const aidx = page.locator('[data-aidx-showcase]');
    await aidx.scrollIntoViewIfNeeded();
    const frame = aidx.locator('iframe');
    await expect(frame).toBeAttached();
    await expect
      .poll(() =>
        frame.evaluate((element: HTMLIFrameElement) => {
          const video = element.contentDocument?.querySelector('video');
          return video ? getComputedStyle(video).objectPosition : null;
        }),
      )
      .toBe('50% 0%');

    const xuelang = page.locator('[data-project-id="xuelang"]');
    const inner = xuelang.locator('> div');
    const media = xuelang.locator('[data-project-media-frame]');
    const [innerBox, mediaBox] = await Promise.all([
      inner.boundingBox(),
      media.boundingBox(),
    ]);
    if (!innerBox || !mediaBox) throw new Error('Missing Xuelang project geometry');
    const topSpace = mediaBox.y - innerBox.y;
    const bottomSpace = innerBox.y + innerBox.height - mediaBox.y - mediaBox.height;
    expect(Math.abs(topSpace - bottomSpace)).toBeLessThanOrEqual(4);
  });

  test('keeps vertical page scrolling active over the Visual Archive', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Fine-pointer wheel behavior is verified at the desktop viewport.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const scroller = page.locator('[data-archive-scroller]');
    await scroller.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - 120), behavior: 'instant' });
    });
    const box = await scroller.boundingBox();
    if (!box) throw new Error('Missing Visual Archive scroller bounds');

    await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 160));
    const before = await page.evaluate(() => ({
      pageY: window.scrollY,
      archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
        ?.scrollLeft ?? 0,
      inlineScrollBehavior: document.documentElement.style.scrollBehavior,
    }));
    const maximum = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    expect(maximum - before.pageY).toBeGreaterThan(550);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);

    const after = await page.evaluate(() => ({
      pageY: window.scrollY,
      archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
        ?.scrollLeft ?? 0,
      inlineScrollBehavior: document.documentElement.style.scrollBehavior,
    }));
    expect(after.pageY - before.pageY).toBeGreaterThanOrEqual(450);
    expect(after.pageY - before.pageY).toBeLessThanOrEqual(550);
    expect(Math.abs(after.archiveX - before.archiveX)).toBeLessThanOrEqual(1);
    expect(after.inlineScrollBehavior).toBe(before.inlineScrollBehavior);
  });

  test('leaves horizontal-dominant archive wheel input on the carousel', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Fine-pointer wheel behavior is verified at the desktop viewport.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const scroller = page.locator('[data-archive-scroller]');
    await scroller.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - 120), behavior: 'instant' });
    });
    const box = await scroller.boundingBox();
    if (!box) throw new Error('Missing Visual Archive scroller bounds');

    await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 160));
    const before = await page.evaluate(() => ({
      pageY: window.scrollY,
      archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
        ?.scrollLeft ?? 0,
    }));
    await page.mouse.wheel(400, 0);
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => ({
      pageY: window.scrollY,
      archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
        ?.scrollLeft ?? 0,
    }));

    expect(Math.abs(after.pageY - before.pageY)).toBeLessThanOrEqual(1);
    expect(after.archiveX).toBeGreaterThan(before.archiveX + 1);
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

  test('archive gallery restores desktop position and focus after keyboard navigation', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop gallery behavior is hidden below the desktop gallery breakpoint.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const archive = page.locator('[data-archive-carousel]');
    const alibabaTrigger = archive.getByRole('button', {
      name: 'Open project image: Tangping',
    });
    const pathnameBeforeOpen = new URL(page.url()).pathname;
    await alibabaTrigger.scrollIntoViewIfNeeded();
    await alibabaTrigger.click();
    const alibabaDialog = page.getByRole('dialog', { name: /Tangping/ });
    await expect(alibabaDialog).toBeVisible();
    await expect(alibabaDialog).toHaveAttribute('data-lightbox-variant', 'archive');
    expect(new URL(page.url()).pathname).toBe(pathnameBeforeOpen);
    await page.getByRole('button', { name: 'Close image' }).click();
    await expect(alibabaDialog).toHaveCount(0);

    const trigger = archive.getByRole('button', {
      name: 'Open project image: Doudou Fox',
    });
    await trigger.evaluate((element) => {
      element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    });
    await expect(trigger).toBeVisible();
    await page.evaluate(async () => {
      const nextFrame = () => new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      let previous = window.scrollY;

      for (let attempt = 0; attempt < 10; attempt += 1) {
        await nextFrame();
        const current = window.scrollY;
        await nextFrame();
        if (current === previous && window.scrollY === current) return;
        previous = window.scrollY;
      }

      throw new Error('Page scroll did not settle before opening the archive gallery');
    });

    const scrollBeforeOpen = await page.evaluate(() => window.scrollY);

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: /Doudou Fox/ });
    const desktopGallery = page.locator('[data-gallery-desktop]');
    const mobileGallery = page.locator('[data-gallery-mobile]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-lightbox-variant', 'archive');
    await expect(dialog.locator('[data-gallery-stage="true"]')).toHaveCSS(
      'border-radius',
      '24px',
    );
    await expect(dialog.locator('[data-lightbox-rail]')).toBeVisible();
    await expect(desktopGallery).toBeVisible();
    await expect(mobileGallery).toBeHidden();
    await expect(desktopGallery.locator('img')).toHaveCount(1);
    const rail = dialog.locator('[data-lightbox-rail]');
    const canvasControls = dialog.locator('[data-lightbox-canvas-controls]');
    const counter = rail.locator('[data-lightbox-counter]');
    const title = rail.getByRole('heading');
    await expect(canvasControls).toBeVisible();
    await expect(rail.locator('[data-lightbox-canvas-controls]')).toHaveCount(0);
    await expect(title).toHaveCSS('writing-mode', 'vertical-rl');
    expect(await title.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d };
    })).toEqual({ a: 1, b: 0, c: 0, d: 1 });
    await expect(counter).toHaveText('01 / 07');
    await expect(desktopGallery.locator('img')).toHaveCSS('border-radius', '18px');
    const [controlsBox, counterBox] = await Promise.all([
      canvasControls.boundingBox(),
      counter.boundingBox(),
    ]);
    expect(controlsBox).not.toBeNull();
    expect(counterBox).not.toBeNull();
    expect(Math.abs(
      (controlsBox?.y ?? 0) + (controlsBox?.height ?? 0) / 2
      - ((counterBox?.y ?? 0) + (counterBox?.height ?? 0) / 2),
    )).toBeLessThanOrEqual(2);
    const previous = page.getByRole('button', { name: 'Previous gallery image' });
    const next = page.getByRole('button', { name: 'Next gallery image' });
    await expect(previous).toBeVisible();
    await expect(next).toBeVisible();
    await expect(next).toHaveCSS('border-radius', '999px');
    await expect(next).toHaveCSS('outline-style', 'none');
    await next.hover();
    await expect(next).toHaveCSS('background-color', 'rgb(244, 244, 241)');
    await expect(next).toHaveCSS('color', 'rgb(13, 13, 15)');
    await expect(next).toHaveCSS('outline-style', 'none');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(next).toBeFocused();
    await expect(next).toHaveCSS('background-color', 'rgb(244, 244, 241)');
    await expect(next).toHaveCSS('color', 'rgb(13, 13, 15)');
    await expect(next).toHaveCSS('outline-style', 'solid');
    await expect(next).toHaveCSS('outline-width', '2px');

    if (testInfo.project.name === 'tablet') {
      const viewport = page.viewportSize();
      if (!viewport) throw new Error('Missing tablet viewport');
      const [surfaceBox, mediaBox] = await Promise.all([
        dialog.locator(':scope > div').boundingBox(),
        desktopGallery.locator('img').boundingBox(),
      ]);
      expect(surfaceBox).not.toBeNull();
      expect(mediaBox).not.toBeNull();
      for (const box of [surfaceBox, mediaBox]) {
        expect(box?.x ?? Number.NEGATIVE_INFINITY).toBeGreaterThanOrEqual(-1);
        expect(box?.y ?? Number.NEGATIVE_INFINITY).toBeGreaterThanOrEqual(-1);
        expect((box?.x ?? Number.POSITIVE_INFINITY) + (box?.width ?? 0)).toBeLessThanOrEqual(
          viewport.width + 1,
        );
        expect((box?.y ?? Number.POSITIVE_INFINITY) + (box?.height ?? 0)).toBeLessThanOrEqual(
          viewport.height + 1,
        );
      }
    }

    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('02 / 07', { exact: true })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const scrollAfterClose = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scrollAfterClose - scrollBeforeOpen)).toBeLessThanOrEqual(2);
    await expect(trigger).toBeFocused();
  });

  test('archive gallery stacks MR CHONG media in its mobile backdrop without overflow', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'The vertical gallery stack needs the canonical mobile viewport.',
    );
    expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
    await page.goto('/en/', { waitUntil: 'networkidle' });

    const archive = page.locator('[data-archive-carousel]');
    await expect(
      archive.getByRole('button', { name: /^Open project image:/ }),
    ).toHaveCount(4);
    const trigger = archive.getByRole('button', {
      name: 'Open project image: MR CHONG',
    });
    await archive.scrollIntoViewIfNeeded();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: /MR CHONG/ });
    const mobileGallery = page.locator('[data-gallery-mobile]');
    const close = page.getByRole('button', { name: 'Close image' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-lightbox-variant', 'archive');
    await expect(mobileGallery).toBeVisible();
    await expect(page.locator('[data-gallery-desktop]')).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Previous gallery image' }),
    ).toBeHidden();
    await expect(page.getByRole('button', { name: 'Next gallery image' })).toBeHidden();
    await expect(dialog.locator('[data-lightbox-canvas-controls]')).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(390);
    const mobileImages = mobileGallery.locator('img');
    await expect(mobileImages).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) {
      await expect(mobileImages.nth(index)).toHaveCSS('border-radius', '20px');
    }
    await expect
      .poll(() => page.evaluate(() => {
        const images = Array.from(
          document.querySelectorAll<HTMLImageElement>('[data-gallery-mobile] img'),
        );
        return images.length === 4 && images.every(
          (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        );
      }))
      .toBe(true);
    await expect
      .poll(() => mobileImages.evaluateAll((images) => (
        images.every((image) => image.getBoundingClientRect().height > 0)
      )))
      .toBe(true);

    const imageBoxes = await mobileImages.evaluateAll((images) => (
      images.map((image) => {
        const { top, bottom, left, right } = image.getBoundingClientRect();
        return { top, bottom, left, right };
      })
    ));
    for (let index = 1; index < imageBoxes.length; index += 1) {
      expect(imageBoxes[index].top).toBeGreaterThanOrEqual(imageBoxes[index - 1].bottom - 1);
    }

    const horizontalState = await dialog.evaluate((element) => {
      const gallery = element.querySelector<HTMLElement>('[data-gallery-mobile]');
      if (!gallery) throw new Error('Missing mobile gallery');

      gallery.scrollLeft = 100;
      element.scrollLeft = 100;
      return {
        dialog: {
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          scrollLeft: element.scrollLeft,
        },
        gallery: {
          scrollWidth: gallery.scrollWidth,
          clientWidth: gallery.clientWidth,
          scrollLeft: gallery.scrollLeft,
        },
      };
    });
    expect(horizontalState.dialog.scrollWidth).toBeLessThanOrEqual(
      horizontalState.dialog.clientWidth,
    );
    expect(horizontalState.gallery.scrollWidth).toBeLessThanOrEqual(
      horizontalState.gallery.clientWidth,
    );
    expect(horizontalState.dialog.scrollLeft).toBe(0);
    expect(horizontalState.gallery.scrollLeft).toBe(0);

    await dialog.evaluate((element) => {
      element.scrollTo({ top: element.scrollHeight, behavior: 'auto' });
    });
    await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(mobileGallery.locator('img').last()).toBeInViewport();
    await expect(close).toBeVisible();
    await expect(close).toBeInViewport();

    const openDimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(openDimensions.scrollWidth).toBeLessThanOrEqual(openDimensions.clientWidth);

    await close.click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const closedDimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(closedDimensions.scrollWidth).toBeLessThanOrEqual(closedDimensions.clientWidth);
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

  test('keeps the published Meeting route keyboard reachable and explicitly marked', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'Route keyboard behavior needs one viewport; responsive coverage runs separately.',
    );
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const meeting = page.locator('[data-project-id="meeting"]');
    await expect(meeting).toHaveAttribute('data-publication-state', 'complete');
    const meetingLink = page.getByRole('link', {
      name: 'View case study Agora Meeting',
    });
    await meetingLink.focus();
    await expect(meetingLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="page-transition-layer"]')).toHaveAttribute(
      'data-tone',
      'dark',
    );
    await page.waitForURL('**/en/work/meeting/');

    await expect(page).toHaveURL(/\/en\/work\/meeting\/$/);
    await expect(page.locator('article[data-case-study]')).toBeVisible();
    await expect(page.getByText('Shipped', { exact: true }).first()).toBeVisible();
  });
});
