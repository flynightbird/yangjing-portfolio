import { expect, test, type Locator, type Page } from '@playwright/test';

const chapterIds = {
  en: [
    'context-thesis', 'ready', 'interrupt', 'trusted-participant',
    'avatar', 'realtime-system', 'delivery',
  ],
  zh: [
    'context-challenge', 'app-product-structure', 'start-conversation',
    'conversation-control', 'digital-human', 'realtime-chain', 'delivery',
  ],
} as const;

const showcaseIds = ['app-login', 'app-structure', 'app-profile-settings', 'app-hardware-device'] as const;
const startConversationIds = ['app-conversation-start', 'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'] as const;

const playlistIds = {
  en: [
    ['app-login', 'app-structure', 'app-conversation-start', 'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'],
    ['app-caption-camera', 'web-conversation', 'web-interrupt'],
    ['app-profile-settings', 'app-voiceprint-lock', 'app-hardware-device'],
    ['app-avatar-select', 'app-avatar-interaction'],
    ['web-realtime-data'],
  ],
  zh: [
    ['app-caption-camera', 'web-conversation', 'web-interrupt', 'app-voiceprint-lock'],
    ['web-realtime-data'],
  ],
} as const;

async function sourceOf(video: Locator) {
  const source = await video.getAttribute('src');
  expect(source).toMatch(/^\/videos\/convo-ai\/.+\.mp4$/);
  return source as string;
}

async function expectCompleteVideo(video: Locator) {
  await expect(video).toHaveAttribute('src', /\/videos\/convo-ai\/.+\.mp4/);
  await expect(video).toHaveAttribute('poster', /\/images\/convo-ai\/posters\/.+\.webp/);
  await expect(video).toHaveAttribute('aria-label', /.+/);
  await expect(video).toHaveAttribute('aria-describedby', /.+/);
}

async function expectSourcesReachable(page: Page, sources: ReadonlySet<string>) {
  expect(sources.size).toBe(16);
  for (const source of sources) {
    const response = await page.request.head(source, { timeout: 10_000 });
    expect(response.status(), `${source} should be reachable`).toBe(200);
  }
}

function sourcesFor(ids: readonly string[]) {
  return new Set(ids.map((id) => `/videos/convo-ai/${id}.mp4`));
}

async function revealSequentialSections(page: Page) {
  const sections = page.locator('article[data-case-study] section[id]');
  for (let index = 0; index < await sections.count(); index += 1) {
    const section = sections.nth(index);
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator(':scope > *').first()).toHaveCSS('opacity', '1');
  }
}

async function collectPlaylistSources(page: Page, expectedPlaylists: readonly (readonly string[])[]) {
  const playlists = page.locator('[data-convo-ai-playlist]');
  await expect(playlists).toHaveCount(expectedPlaylists.length);
  const sources = new Set<string>();

  for (let playlistIndex = 0; playlistIndex < expectedPlaylists.length; playlistIndex += 1) {
    const playlist = playlists.nth(playlistIndex);
    await playlist.scrollIntoViewIfNeeded();
    const buttons = playlist.locator('[data-playlist-navigation] button[aria-pressed]');
    const expectedIds = expectedPlaylists[playlistIndex];

    if (expectedIds.length === 1) {
      await expect(buttons).toHaveCount(0);
      const video = playlist.locator('video');
      await expect(video).toHaveAttribute('src', `/videos/convo-ai/${expectedIds[0]}.mp4`);
      await expectCompleteVideo(video);
      sources.add(await sourceOf(video));
      continue;
    }

    await expect(buttons).toHaveCount(expectedIds.length);
    for (let index = 0; index < expectedIds.length; index += 1) {
      await buttons.nth(index).click();
      await expect(buttons.nth(index)).toHaveAttribute('aria-pressed', 'true');
      const video = playlist.locator('video');
      await expect(video).toHaveAttribute('src', `/videos/convo-ai/${expectedIds[index]}.mp4`);
      await expectCompleteVideo(video);
      sources.add(await sourceOf(video));
    }
  }
  return sources;
}

async function collectStartConversationSources(page: Page) {
  const stage = page.locator('[data-convo-start-stage]');
  const navigation = page.locator('[data-convo-start-navigation]');
  const buttons = navigation.locator('button[aria-pressed]');
  const sources = new Set<string>();
  const appVideo = stage.locator('[data-convo-start-app] video');

  await expect(stage.locator('video')).toHaveCount(2);
  await expect(buttons).toHaveCount(4);
  await expectCompleteVideo(appVideo);
  sources.add(await sourceOf(appVideo));

  for (let index = 0; index < startConversationIds.length - 1; index += 1) {
    const expectedId = startConversationIds[index + 1];
    await buttons.nth(index).click();
    await expect(buttons.nth(index)).toHaveAttribute('aria-pressed', 'true');
    const webVideo = stage.locator('[data-convo-start-web] video');
    await expect(webVideo).toHaveAttribute('src', `/videos/convo-ai/${expectedId}.mp4`);
    await expectCompleteVideo(webVideo);
    sources.add(await sourceOf(webVideo));
  }

  return sources;
}

async function activateMobileShowcaseScene(showcase: Locator, id: typeof showcaseIds[number]) {
  const step = showcase.locator(`[data-app-showcase-step="${id}"]`);
  await step.locator(':scope > button').click();
  await expect(showcase).toHaveAttribute('data-active-id', id);
  const card = step.locator('[data-app-showcase-placement="mobile"]');
  await expect(card).toHaveAttribute('data-media-card', id);
  const video = card.locator('video');
  await expect(video).toHaveAttribute('src', `/videos/convo-ai/${id}.mp4`);
  await expectCompleteVideo(video);
  return sourceOf(video);
}

async function activateDesktopShowcaseScene(showcase: Locator, id: typeof showcaseIds[number]) {
  const step = showcase.locator(`[data-app-showcase-step="${id}"]`);
  await step.evaluate((element) => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const targetTop = window.scrollY + element.getBoundingClientRect().top - window.innerHeight * 0.425;
    window.scrollTo({ behavior: 'auto', top: Math.max(0, targetTop) });
    root.style.scrollBehavior = previousScrollBehavior;
  });
  await expect(showcase).toHaveAttribute('data-active-id', id);
  const card = showcase.locator('[data-app-showcase-placement="desktop"]');
  await expect(card).toHaveAttribute('data-media-card', id);
  await expect(card).toHaveCSS('border-radius', '20px');
  const video = card.locator('video');
  await expect(video).toHaveAttribute('src', `/videos/convo-ai/${id}.mp4`);
  await expectCompleteVideo(video);
  return sourceOf(video);
}

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} ConvoAI case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/work/convo-ai/`, { waitUntil: 'domcontentloaded' });
    });

    test('renders the approved locale-specific chapter structure and shared surfaces', async ({ page }) => {
      const article = page.locator('article[data-case-study]');
      await expect(article).toBeVisible();
      expect(await article.locator('section[id]').evaluateAll((sections) => sections.map(({ id }) => id))).toEqual(chapterIds[locale]);
      await expect(article.getByRole('heading', { level: 1, name: 'ConvoAI' })).toBeVisible();
      await expect(article.getByRole('heading', { level: 1, name: 'ConvoAI' })).toHaveCount(1);
      await expect(page.locator('[data-stage-display-title]')).toHaveCount(locale === 'en' ? 3 : 1);
      await expect(page.locator('[data-stage-display-title]').first()).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('body > .section-index')).toHaveCount(0);
      await expect(page.locator('[data-convo-ai-case] .section-index')).toHaveCount(7);
      await expect(page.locator('[data-convo-ai-stage]').first()).toBeVisible();
      await expect(page.locator('[data-convo-web-plane]').first()).toBeVisible();
      await expect(page.locator('[data-convo-app-device]').first()).toBeVisible();
      await expect(page.locator('[data-convo-next-section-hint]')).toBeVisible();
      await expect(article).toContainText(locale === 'zh' ? '独立负责产品设计' : 'Sole product design ownership');
      await expect(article).not.toContainText(/designer-reported|现有证据|未经验证的业务指标/i);
      await expect(article).not.toContainText(/\d+(?:\.\d+)?%/);
      await expect(page.locator('[data-case-web-control]')).toHaveAttribute('data-surface', 'dark');

      if (locale === 'zh') {
        await expect(page.locator('nav[aria-label="案例章节"]')).toHaveCount(1);
        const startNavigation = page.locator('[data-convo-start-navigation]');
        await startNavigation.scrollIntoViewIfNeeded();
        await expect(startNavigation).toHaveAccessibleName('Web 启动路径');
        await expect(startNavigation).toBeVisible();

        const voiceprintHeading = page.getByRole('heading', { level: 3, name: '声纹如何定义“听谁说话”' });
        await page.locator('#conversation-control').scrollIntoViewIfNeeded();
        await expect(voiceprintHeading).toBeVisible();

        const profileStep = page.locator('[data-app-showcase-step="app-profile-settings"]');
        const hardwareStep = page.locator('[data-app-showcase-step="app-hardware-device"]');
        await page.locator('#app-product-structure').scrollIntoViewIfNeeded();
        await expect(profileStep).toBeVisible();
        await expect(hardwareStep).toBeVisible();

        const avatarSelect = page.locator('[data-convo-ai-avatar="app-avatar-select"]');
        const avatarInteraction = page.locator('[data-convo-ai-avatar="app-avatar-interaction"]');
        await page.locator('#digital-human').scrollIntoViewIfNeeded();
        await expect(avatarSelect).toBeVisible();
        await expect(avatarInteraction).toBeVisible();
      }
      await expect(page.locator('video[controls]')).toHaveCount(0);
    });

    test('exposes every complete recording with accessible media metadata', async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      const expectedIds = locale === 'en'
        ? playlistIds.en.flat()
        : [...showcaseIds, ...startConversationIds, 'app-avatar-select', 'app-avatar-interaction', ...playlistIds.zh.flat()];
      const expectedSources = sourcesFor(expectedIds);
      await expectSourcesReachable(page, expectedSources);
      const playlistSources = await collectPlaylistSources(page, playlistIds[locale]);

      if (locale === 'en') {
        expect(playlistSources).toEqual(expectedSources);
        return;
      }

      const showcase = page.locator('[data-convo-app-showcase]');
      const startSources = await collectStartConversationSources(page);
      const showcaseSources = new Set<string>();
      for (const id of showcaseIds) {
        showcaseSources.add(testInfo.project.name === 'desktop'
          ? await activateDesktopShowcaseScene(showcase, id)
          : await activateMobileShowcaseScene(showcase, id));
      }

      const avatars = page.locator('[data-convo-ai-avatar-pair] video');
      await expect(avatars).toHaveCount(2);
      const avatarSources = new Set<string>();
      for (let index = 0; index < 2; index += 1) {
        const avatar = avatars.nth(index);
        await expectCompleteVideo(avatar);
        avatarSources.add(await sourceOf(avatar));
      }

      expect(new Set([...showcaseSources, ...startSources, ...avatarSources, ...playlistSources])).toEqual(expectedSources);
    });

    test('ends without project navigation and preserves responsive bounds', async ({ page }, testInfo) => {
      await expect(page.locator('[data-project-previous], [data-project-next]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

      if (locale !== 'zh') return;

      const startStage = page.locator('[data-convo-start-stage]');
      const [startStageBox, startWebBox, startAppBox] = await Promise.all([
        startStage.boundingBox(),
        startStage.locator('[data-convo-start-web]').boundingBox(),
        startStage.locator('[data-convo-start-app]').boundingBox(),
      ]);
      expect(startStageBox).not.toBeNull();
      expect(startWebBox).not.toBeNull();
      expect(startAppBox).not.toBeNull();
      expect(startAppBox!.x).toBeGreaterThanOrEqual(startStageBox!.x);
      expect(startAppBox!.x + startAppBox!.width).toBeLessThanOrEqual(startStageBox!.x + startStageBox!.width + 1);

      if (testInfo.project.name === 'mobile') {
        expect(startAppBox!.y).toBeGreaterThanOrEqual(startWebBox!.y + startWebBox!.height);
      } else {
        expect(startAppBox!.x).toBeLessThan(startWebBox!.x + startWebBox!.width);
        expect(startAppBox!.y).toBeLessThan(startWebBox!.y + startWebBox!.height);
      }

      const avatarPair = page.locator('[data-convo-ai-avatar-pair]');
      const avatars = avatarPair.locator('[data-convo-ai-avatar]');
      const [first, second] = await Promise.all([avatars.nth(0).boundingBox(), avatars.nth(1).boundingBox()]);
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();

      if (testInfo.project.name !== 'desktop') {
        expect(Math.abs(first!.x - second!.x)).toBeLessThanOrEqual(1);
        expect(first!.y + first!.height).toBeLessThanOrEqual(second!.y + 1);
        await revealSequentialSections(page);
        await page.screenshot({ path: `test-results/convo-ai-zh-${testInfo.project.name}.png`, fullPage: true });
        return;
      }

      expect(Math.abs(first!.y - second!.y)).toBeLessThanOrEqual(1);
      expect(first!.x + first!.width).toBeLessThanOrEqual(second!.x + 1);

      const showcase = page.locator('[data-convo-app-showcase]');
      await expect(showcase).toHaveAttribute('data-active-id', 'app-login');
      const card = showcase.locator('[data-app-showcase-placement="desktop"]');
      const phone = card.locator('[class*="appShowcaseVideo"]');
      const [cardBox, phoneBox] = await Promise.all([card.boundingBox(), phone.boundingBox()]);
      expect(cardBox).not.toBeNull();
      expect(phoneBox).not.toBeNull();
      expect(phoneBox!.x).toBeGreaterThanOrEqual(cardBox!.x);
      expect(phoneBox!.x + phoneBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
      expect(phoneBox!.y).toBeGreaterThanOrEqual(cardBox!.y);
      expect(phoneBox!.y + phoneBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height + 1);
      await page.screenshot({ path: `test-results/convo-ai-zh-${testInfo.project.name}.png`, fullPage: true });
    });

    test('uses desktop scene commands to update the Chinese showcase forward and backward', async ({ page }, testInfo) => {
      test.skip(locale !== 'zh' || testInfo.project.name !== 'desktop', 'Showcase scroll commands are desktop-only.');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const showcase = page.locator('[data-convo-app-showcase]');
      const card = showcase.locator('[data-app-showcase-placement="desktop"]');

      await showcase.locator('[data-app-showcase-step="app-profile-settings"] button').click();
      await expect(showcase).toHaveAttribute('data-active-id', 'app-profile-settings');
      await expect(card).toHaveAttribute('data-media-card', 'app-profile-settings');
      await expect(card).toHaveCSS('border-radius', '20px');
      await expect(card.locator('video')).toHaveAttribute('src', '/videos/convo-ai/app-profile-settings.mp4');

      await showcase.locator('[data-app-showcase-step="app-structure"] button').click();
      await expect(showcase).toHaveAttribute('data-active-id', 'app-structure');
      await expect(card).toHaveAttribute('data-media-card', 'app-structure');
      await expect(card.locator('video')).toHaveAttribute('src', '/videos/convo-ai/app-structure.mp4');
    });

  });
}
