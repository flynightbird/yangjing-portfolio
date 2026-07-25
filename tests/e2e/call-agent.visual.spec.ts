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

  test('keeps the complete hero top above hero media', async ({ page }) => {
    const heroTop = page.locator('[data-call-agent-hero-top]');
    const heroMedia = page.locator('[data-call-agent-hero-media]');
    const topBox = await heroTop.boundingBox();
    const mediaBox = await heroMedia.boundingBox();
    expect(topBox).not.toBeNull();
    expect(mediaBox).not.toBeNull();
    expect(topBox!.y + topBox!.height).toBeLessThanOrEqual(mediaBox!.y + 1);
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
      if (!h1 || !h2 || !lead || !body) throw new Error('Expected Call Agent typography samples');
      return { h1: metrics(h1), h2: metrics(h2), lead: metrics(lead), body: metrics(body) };
    });

    expect(type.h1.lineHeight / type.h1.fontSize).toBeCloseTo(1.06, 2);
    expect(type.h2.fontWeight).toBe('600');
    expect(type.lead.fontSize).toBe(19);
    expect(type.body.fontSize).toBe(16);
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
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });

    const tablist = page.getByRole('tablist', { name: '产品阶段', includeHidden: true });
    await expect(tablist).toBeVisible();
    await expect(tablist.getByRole('tab')).toHaveCount(6);
    const activePanel = page.getByRole('tabpanel', { name: '创建', exact: true });
    await expect(activePanel.locator('img')).toBeVisible();
    await expect(activePanel.locator('video')).toHaveCount(0);
  });
});
