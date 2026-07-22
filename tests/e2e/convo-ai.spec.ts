import { expect, test, type Locator, type Page } from '@playwright/test';

const chapterIds = {
  en: [
    'context-thesis', 'ready', 'interrupt', 'trusted-participant',
    'avatar', 'realtime-system', 'delivery-reflection',
  ],
  zh: [
    'context-challenge', 'app-product-structure', 'start-conversation',
    'conversation-control', 'digital-human', 'realtime-chain', 'delivery',
  ],
} as const;

const showcaseIds = ['app-login', 'app-structure', 'app-profile-settings', 'app-hardware-device'] as const;

const playlistIds = {
  en: [
    ['app-login', 'app-structure', 'app-conversation-start', 'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'],
    ['app-caption-camera', 'web-conversation', 'web-interrupt'],
    ['app-profile-settings', 'app-voiceprint-lock', 'app-hardware-device'],
    ['app-avatar-select', 'app-avatar-interaction'],
    ['web-realtime-data'],
  ],
  zh: [
    ['app-conversation-start', 'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'],
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

async function collectPlaylistSources(page: Page, expectedPlaylists: readonly (readonly string[])[]) {
  const playlists = page.locator('[data-convo-ai-playlist]');
  await expect(playlists).toHaveCount(expectedPlaylists.length);
  const sources = new Set<string>();

  for (let playlistIndex = 0; playlistIndex < expectedPlaylists.length; playlistIndex += 1) {
    const playlist = playlists.nth(playlistIndex);
    await playlist.scrollIntoViewIfNeeded();
    const buttons = playlist.locator('button[aria-pressed]');
    const expectedIds = expectedPlaylists[playlistIndex];
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

async function activateMobileShowcaseScene(showcase: Locator, id: typeof showcaseIds[number]) {
  const step = showcase.locator(`[data-app-showcase-step="${id}"]`);
  await step.getByRole('button').click();
  await expect(showcase).toHaveAttribute('data-active-id', id);
  const card = step.locator('[data-app-showcase-placement="mobile"]');
  await expect(card).toHaveAttribute('data-media-card', id);
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
      await expect(page.locator('[data-convo-ai-stage]').first()).toBeVisible();
      await expect(page.locator('[data-convo-web-plane]').first()).toBeVisible();
      await expect(page.locator('[data-convo-app-device]').first()).toBeVisible();
      await expect(page.locator('[data-convo-next-section-hint]')).toBeVisible();
      await expect(article).toContainText(locale === 'zh' ? '独立负责产品设计（Designer-reported）' : 'Sole product design ownership (designer-reported)');
      await expect(article).not.toContainText(/\d+(?:\.\d+)?%/);
      await expect(page.locator('[data-case-web-control]')).toHaveAttribute('data-surface', 'dark');

      if (locale === 'zh') {
        await expect(page.locator('nav[aria-label="案例章节"]')).toHaveCount(1);
      }
    });

    test('exposes every complete recording with accessible media metadata', async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      const expectedIds = locale === 'en'
        ? playlistIds.en.flat()
        : [...showcaseIds, 'app-avatar-select', 'app-avatar-interaction', ...playlistIds.zh.flat()];
      const expectedSources = sourcesFor(expectedIds);
      await expectSourcesReachable(page, expectedSources);
      const playlistSources = await collectPlaylistSources(page, playlistIds[locale]);

      if (locale === 'en') {
        expect(playlistSources).toEqual(expectedSources);
        return;
      }

      const showcase = page.locator('[data-convo-app-showcase]');
      const showcaseSources = testInfo.project.name === 'mobile'
        ? new Set(await Promise.all(showcaseIds.map((id) => activateMobileShowcaseScene(showcase, id))))
        : sourcesFor(showcaseIds);

      const avatars = page.locator('[data-convo-ai-avatar-pair] video');
      await expect(avatars).toHaveCount(2);
      const avatarSources = new Set<string>();
      for (let index = 0; index < 2; index += 1) {
        const avatar = avatars.nth(index);
        await expectCompleteVideo(avatar);
        avatarSources.add(await sourceOf(avatar));
      }

      expect(new Set([...showcaseSources, ...avatarSources, ...playlistSources])).toEqual(expectedSources);
    });

    test('preserves project navigation and responsive bounds', async ({ page }, testInfo) => {
      await expect(page.locator('[data-project-previous]')).toHaveAttribute('href', `/${locale}/work/call-agent/`);
      await expect(page.locator('[data-project-next]')).toHaveAttribute('href', `/${locale}/work/meeting/`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

      if (locale !== 'zh') return;

      const avatarPair = page.locator('[data-convo-ai-avatar-pair]');
      const avatars = avatarPair.locator('[data-convo-ai-avatar]');
      const [first, second] = await Promise.all([avatars.nth(0).boundingBox(), avatars.nth(1).boundingBox()]);
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();

      if (testInfo.project.name === 'mobile') {
        expect(Math.abs(first!.x - second!.x)).toBeLessThanOrEqual(1);
        expect(first!.y + first!.height).toBeLessThanOrEqual(second!.y + 1);
        await page.screenshot({ path: `test-results/convo-ai-zh-mobile.png`, fullPage: true });
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
      test.skip(locale !== 'zh' || testInfo.project.name === 'mobile', 'Showcase scroll commands are desktop-only.');
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
