import { expect, test, type Locator } from '@playwright/test';

async function expectVideoToMeetViewportEdges(viewport: Locator) {
  const gaps = await viewport.evaluate((element) => {
    const video = element.querySelector('video');
    if (!video) throw new Error('Expected a video in the browser viewport');

    const viewportRect = element.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();
    return [
      Math.abs(videoRect.top - viewportRect.top),
      Math.abs(videoRect.right - viewportRect.right),
      Math.abs(videoRect.bottom - viewportRect.bottom),
      Math.abs(videoRect.left - viewportRect.left),
    ];
  });

  expect(Math.max(...gaps)).toBeLessThanOrEqual(1);
}

test.describe('Call Agent responsive system story', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh/work/call-agent/', { waitUntil: 'networkidle' });
  });

  test('desktop keeps one stable right-side browser while left selection changes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    const media = page.locator('[data-call-agent-media-stage]');
    await media.scrollIntoViewIfNeeded();
    const initial = await media.boundingBox();
    const publish = page.locator('ol [data-stage-id="publish"]');
    await publish.scrollIntoViewIfNeeded();
    await publish.locator('button').click();
    await expect(publish).toHaveAttribute('data-active', 'true');
    const next = await media.boundingBox();
    expect(initial).not.toBeNull();
    expect(next).not.toBeNull();
    expect(Math.abs(next!.width - initial!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(next!.height - initial!.height)).toBeLessThanOrEqual(1);
  });

  test('mobile and reduced motion expose all six static stages', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop');
    await expect(page.locator('[data-static-stage]')).toHaveCount(6);
    await expect(page.locator('[data-call-agent-media-stage]')).toBeHidden();
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

  test('videos fill their browser viewport and operational stages use the approved clips', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    const heroViewport = page.locator('[data-call-agent-hero] [data-call-agent-video-viewport]');
    await expectVideoToMeetViewportEdges(heroViewport);

    const system = page.locator('[data-system-mode]');
    await expect(system).toHaveAttribute('data-system-mode', 'cinematic');
    const media = system.locator('[data-call-agent-media-stage]');
    await media.scrollIntoViewIfNeeded();
    await expect(media).toBeVisible();

    const cases = [
      { id: 'connect', title: '内呼连接', source: '/videos/call-agent/agent-connect.mp4' },
      { id: 'operate', title: '外呼运营', source: '/videos/call-agent/agent-operate.mp4' },
    ] as const;

    for (const item of cases) {
      const stage = system.locator(`ol [data-stage-id="${item.id}"]`);
      await stage.locator('button').evaluate((button: HTMLButtonElement) => button.click());
      await expect(stage).toHaveAttribute('data-active', 'true');
      await expect(stage).toContainText(item.title);

      const activeMedia = media.locator('[data-active="true"]');
      await expect(activeMedia.locator('video')).toHaveAttribute('src', item.source);
      await expectVideoToMeetViewportEdges(activeMedia.locator('[data-call-agent-video-viewport]'));
    }
  });

  test('desktop gives the final stage dwell before the sticky media releases', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

    const system = page.locator('[data-system-mode]');
    await expect(system).toHaveAttribute('data-system-mode', 'cinematic');
    const finalStage = system.locator('ol [data-stage-id="operate"]');
    const media = system.locator('[data-call-agent-media-stage]');

    const activationScroll = await finalStage.evaluate((stage) => {
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      return stageTop - window.innerHeight * 0.52 + 4;
    });
    await page.evaluate((top) => window.scrollTo(0, top), activationScroll);
    await expect(finalStage).toHaveAttribute('data-active', 'true');
    const before = await media.boundingBox();

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.4));
    await expect(finalStage).toHaveAttribute('data-active', 'true');
    const after = await media.boundingBox();

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(16);
    expect(after!.y).toBeGreaterThanOrEqual(0);
    expect(after!.y + after!.height).toBeLessThanOrEqual(testInfo.project.use.viewport!.height + 1);
  });
});
