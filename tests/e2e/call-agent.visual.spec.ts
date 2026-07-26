import { expect, test } from '@playwright/test';

test.describe('Call Agent responsive system story', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh/work/call-agent/', { waitUntil: 'networkidle' });
  });

  test('keeps six stable tabs above one responsive media stage', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: '产品阶段', includeHidden: true });
    const media = page.locator('[data-call-agent-media-stage]');
    await tablist.scrollIntoViewIfNeeded();
    await expect(tablist).toBeVisible();
    await expect(media).toBeVisible();

    const tabs = tablist.getByRole('tab');
    await expect(tabs).toHaveCount(6);
    expect(await tabs.evaluateAll((items) => items.map((item) => getComputedStyle(item).height))).toEqual(
      Array(6).fill('38px'),
    );

    const tablistBox = await tablist.boundingBox();
    const initialMediaBox = await media.boundingBox();
    expect(tablistBox).not.toBeNull();
    expect(initialMediaBox).not.toBeNull();
    expect(tablistBox!.y + tablistBox!.height).toBeLessThanOrEqual(initialMediaBox!.y + 1);

    await tablist.getByRole('tab', { name: '发布', exact: true }).click();
    const publishPanel = page.getByRole('tabpanel', { name: '发布', exact: true });
    await expect(publishPanel).toHaveAttribute('data-active', 'true');
    const nextMediaBox = await media.boundingBox();
    expect(nextMediaBox).not.toBeNull();
    expect(Math.abs(nextMediaBox!.width - initialMediaBox!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(nextMediaBox!.height - initialMediaBox!.height)).toBeLessThanOrEqual(1);
  });

  test('keeps bilingual hero copy and titles strictly above hero media', async ({ page }) => {
    for (const locale of ['zh', 'en'] as const) {
      await page.goto(`/${locale}/work/call-agent/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const heroTop = page.locator('[data-call-agent-hero-top]');
      const heroTitle = heroTop.locator('h1');
      const heroMedia = page.locator('[data-call-agent-hero-media]');
      await expect(heroMedia).toBeVisible();
      await expect.poll(async () => {
        const [topBox, titleBox, mediaBox] = await Promise.all([
          heroTop.boundingBox(),
          heroTitle.boundingBox(),
          heroMedia.boundingBox(),
        ]);
        if (!topBox || !titleBox || !mediaBox) throw new Error(`Expected ${locale} hero geometry`);
        return Math.max(
          topBox.y + topBox.height - mediaBox.y,
          titleBox.y + titleBox.height - mediaBox.y,
        );
      }).toBeLessThanOrEqual(0);

      const [topBox, titleBox, mediaBox] = await Promise.all([
        heroTop.boundingBox(),
        heroTitle.boundingBox(),
        heroMedia.boundingBox(),
      ]);
      expect(topBox).not.toBeNull();
      expect(titleBox).not.toBeNull();
      expect(mediaBox).not.toBeNull();
      expect(topBox!.y + topBox!.height).toBeLessThanOrEqual(mediaBox!.y);
      expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(mediaBox!.y);
    }
  });

  test('compact keyboard navigation keeps bilingual edge tabs and focus rings visible', async ({ page }, testInfo) => {
    test.skip(!['mobile', 'tablet'].includes(testInfo.project.name));

    for (const locale of ['zh', 'en'] as const) {
      await page.goto(`/${locale}/work/call-agent/`, { waitUntil: 'networkidle' });
      const tablist = page.getByRole('tablist', {
        name: locale === 'zh' ? '产品阶段' : 'Product stages',
        includeHidden: true,
      });
      await tablist.scrollIntoViewIfNeeded();
      await expect(tablist).toBeVisible();

      const tabs = tablist.getByRole('tab');
      const firstTab = tabs.first();
      const lastTab = tabs.last();
      await firstTab.focus();

      for (const { key, tab } of [{ key: 'End', tab: lastTab }, { key: 'Home', tab: firstTab }]) {
        await page.keyboard.press(key);
        await expect(tab).toBeFocused();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        const focusStyle = await tab.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            color: style.outlineColor,
            style: style.outlineStyle,
            width: Number.parseFloat(style.outlineWidth),
          };
        });
        expect(focusStyle.style).not.toBe('none');
        expect(focusStyle.width).toBeGreaterThanOrEqual(2);
        expect(focusStyle.color).toBe('rgb(72, 102, 0)');
        await expect.poll(async () => tab.evaluate((element) => {
          const tabRect = element.getBoundingClientRect();
          const listRect = element.closest('[role="tablist"]')?.getBoundingClientRect();
          if (!listRect) throw new Error('Expected compact tablist geometry');
          const style = getComputedStyle(element);
          const outlineExtent = Math.max(
            0,
            Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset),
          );
          return Math.min(
            tabRect.left - outlineExtent - listRect.left,
            listRect.right - tabRect.right - outlineExtent,
          );
        })).toBeGreaterThanOrEqual(-1);
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test('uses the approved responsive type scale', async ({ page }) => {
    const type = await page.locator('[data-call-agent-case]').evaluate((root) => {
      const metrics = (element: Element) => {
        const style = getComputedStyle(element);
        return {
          fontSize: Number.parseFloat(style.fontSize),
          lineHeight: Number.parseFloat(style.lineHeight),
          fontWeight: style.fontWeight,
        };
      };
      const h1 = root.querySelector('[data-call-agent-hero] h1');
      const h2 = root.querySelector('article[data-case-study] > section > h2');
      const lead = root.querySelector('article[data-case-study] > section .call-reading--lead');
      const body = root.querySelector('article[data-case-study] > section .call-reading:not(.call-reading--lead)');
      const factsLabel = root.querySelector('dl dt');
      if (!h1 || !h2 || !lead || !body || !factsLabel) throw new Error('Expected Call Agent typography samples');
      return { h1: metrics(h1), h2: metrics(h2), lead: metrics(lead), body: metrics(body), factsLabel: metrics(factsLabel) };
    });

    expect(type.h1.lineHeight / type.h1.fontSize).toBeCloseTo(1.06, 2);
    expect(type.h2.fontWeight).toBe('600');
    expect(type.lead.fontSize).toBe(19);
    expect(type.body.fontSize).toBe(16);
    expect(type.factsLabel.fontSize).toBe(11);
  });

  test('desktop hero title stays within three lines', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    const lines = await page.locator('[data-call-agent-hero] h1').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const tops = [...range.getClientRects()].map((rect) => Math.round(rect.top));
      return new Set(tops).size;
    });
    expect(lines).toBeLessThanOrEqual(3);
  });

  test('selects approved operational clips with contained video geometry', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: '产品阶段', includeHidden: true });
    const cases = [
      { title: '内呼连接', source: '/videos/call-agent/agent-connect.mp4' },
      { title: '外呼运营', source: '/videos/call-agent/agent-operate.mp4' },
    ] as const;

    await tablist.scrollIntoViewIfNeeded();
    for (const item of cases) {
      await tablist.getByRole('tab', { name: item.title, exact: true }).click();
      const panel = page.getByRole('tabpanel', { name: item.title, exact: true });
      await expect(panel).toHaveAttribute('data-active', 'true');
      const video = panel.locator('[data-call-agent-video-viewport] video');
      await expect(video).toHaveAttribute('src', item.source);
      await expect(video).toHaveCSS('object-fit', 'contain');
      const boxes = await panel.locator('[data-call-agent-video-viewport]').evaluate((viewport) => {
        const media = viewport.querySelector('video');
        if (!media) throw new Error('Expected a video in the active stage');
        const viewportBox = viewport.getBoundingClientRect();
        const mediaBox = media.getBoundingClientRect();
        return { viewport: { width: viewportBox.width, height: viewportBox.height }, media: { width: mediaBox.width, height: mediaBox.height } };
      });
      expect(Math.abs(boxes.media.width - boxes.viewport.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(boxes.media.height - boxes.viewport.height)).toBeLessThanOrEqual(1);
    }
  });

  test('advances hero evidence and preserves detail media treatment', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    const hero = page.locator('[data-call-agent-hero-sequence]');
    const clips = hero.locator('[data-hero-clip]');
    await expect(clips).toHaveCount(3);
    expect(await clips.evaluateAll((items) => items.map((item) => item.getAttribute('data-hero-clip')))).toEqual([
      'create',
      'preview',
      'operate',
    ]);
    await expect(clips.nth(0)).toHaveAttribute('data-active', 'true');
    await clips.nth(0).locator('video').dispatchEvent('ended');
    await expect(clips.nth(1)).toHaveAttribute('data-active', 'true');

    const validateRelease = page.locator('#validate-release');
    await validateRelease.scrollIntoViewIfNeeded();
    await expect.poll(() => validateRelease.locator('video').first().evaluate(
      (video: HTMLVideoElement) => video.duration,
    )).toBeGreaterThan(26.2);

    const browserRadius = await validateRelease.locator('[data-call-agent-browser]').first().evaluate(
      (browser) => getComputedStyle(browser.firstElementChild as Element).borderRadius,
    );
    expect(browserRadius).toBe('12px');
    await expect(validateRelease).toHaveCSS('border-radius', '0px');

    for (const sectionId of ['validate-release', 'operationalize']) {
      const section = page.locator(`#${sectionId}`);
      await section.scrollIntoViewIfNeeded();
      await expect.poll(() => section.evaluate((element) => {
        const media = [...element.querySelectorAll(':scope > [data-call-agent-browser]')];
        if (media.length !== 2) throw new Error(`Expected two media figures in ${element.id}`);
        const first = media[0].getBoundingClientRect();
        const second = media[1].getBoundingClientRect();
        return second.top - first.bottom;
      })).toBeCloseTo(32, 0);
    }
  });

  test('reduced motion keeps the tab interface and poster evidence', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    const videoRequests: string[] = [];
    page.on('request', (request) => {
      if (/\.mp4(?:$|\?)/.test(request.url())) videoRequests.push(request.url());
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });

    const tablist = page.getByRole('tablist', { name: '产品阶段', includeHidden: true });
    await expect(tablist).toBeVisible();
    await expect(tablist.getByRole('tab')).toHaveCount(6);
    const activePanel = page.getByRole('tabpanel', { name: '创建', exact: true });
    await expect(activePanel.locator('img')).toBeVisible();
    await expect(activePanel.locator('video')).toHaveCount(0);
    await expect(page.locator('[data-static-sequence] video')).toHaveCount(0);
    expect(videoRequests).toEqual([]);
  });
});
