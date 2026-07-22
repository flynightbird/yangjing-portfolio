import { expect, test } from '@playwright/test';

const chapterIds = [
  'cold-open',
  'challenge',
  'stage-adapts',
  'content-takes-stage',
  'information-follows',
  'the-turn',
  'system-reveal',
  'shipped-evidence',
  'reflection',
];

const legacyAnchorIds = [
  'business-context',
  'design-challenge',
  'system-strategy',
  'capability-impact',
];

const requiredViewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 844, height: 390 },
  { width: 1440, height: 1000 },
  { width: 1728, height: 1117 },
] as const;

const viewportMatrixTitle = 'has stable geometry across required viewports';

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} Agora Meeting case`, () => {
    test.beforeEach(async ({ page }, testInfo) => {
      if (testInfo.title === viewportMatrixTitle) return;
      await page.goto(`/${locale}/work/meeting/`, { waitUntil: 'domcontentloaded' });
    });

    test('renders the concise product case inside the shared site shell', async ({ page }) => {
      await expect(page.locator('[data-meeting-case]')).toBeVisible();
      const ids = await page
        .locator('article[data-case-study] > div > section[data-showcase-band]')
        .evaluateAll((sections) => sections.map(({ id }) => id));

      expect(ids).toEqual(chapterIds);
      for (const id of legacyAnchorIds) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }
      await expect(page.locator('[data-showcase-proof]')).toHaveCount(1);
      const signatureExperiences = page.locator('[data-film-act]');
      await expect(signatureExperiences).toHaveCount(3);
      expect(
        await signatureExperiences.evaluateAll((sections) =>
          sections.every((section) => section.hasAttribute('data-signature-experience')),
        ),
      ).toBe(true);

      await expect(page.locator('[data-meeting-deep-dive]')).toHaveCount(0);
      await expect(page.locator('[data-meeting-disclosure]')).toHaveCount(0);
      await expect(page.locator('[data-orientation-evidence]')).toHaveCount(0);
      await expect(page.locator('[data-project-previous], [data-project-next]')).toHaveCount(0);
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('footer')).toContainText('© 2026 Yang Jing');

      const scopeLine = page.getByTestId('meeting-scope-line');
      await expect(scopeLine).toContainText(
        locale === 'zh' ? '唯一产品设计师' : 'Sole Product Designer',
      );
      await expect(scopeLine).toContainText(locale === 'zh' ? '已上线' : 'Shipped');
      await expect(page.locator('body')).not.toContainText(
        /提升了?\s*\d+%|increased by\s*\d+%/i,
      );
    });

    test('matches Product Film media to the server readiness marker', async ({ page }) => {
      const meeting = page.locator('[data-meeting-film-ready]');
      await expect(meeting).toHaveCount(1);
      const ready = await meeting.getAttribute('data-meeting-film-ready');
      expect(ready).toMatch(/^(?:true|false)$/);

      const nativeVideos = meeting.locator('video[src^="/videos/meeting/"]');
      const staticFallbacks = meeting.locator('[data-film-static-fallback]');

      if (ready === 'false') {
        await expect(nativeVideos).toHaveCount(0);
        await expect(staticFallbacks).toHaveCount(4);
        expect(
          await staticFallbacks.locator('img').evaluateAll((images) =>
            images.map((image) => image.getAttribute('src')).sort(),
          ),
        ).toEqual([
          '/images/meeting/adaptive-layout-poster.webp',
          '/images/meeting/device-comparison.webp',
          '/images/meeting/meeting-hero.webp',
          '/images/meeting/whiteboard-multidevice.webp',
        ]);
        return;
      }

      await expect(staticFallbacks).toHaveCount(0);
      await expect(nativeVideos).toHaveCount(5);
      expect(
        await nativeVideos.evaluateAll((videos) =>
          videos.map((video) => video.getAttribute('src')).sort(),
        ),
      ).toEqual([
        '/videos/meeting/meeting-stage-landscape.mp4',
        '/videos/meeting/meeting-stage-portrait.mp4',
        '/videos/meeting/meeting-web-layout.mp4',
        '/videos/meeting/meeting-web-transcription.mp4',
        '/videos/meeting/meeting-whiteboard-portrait.mp4',
      ]);
      await expect(nativeVideos.locator('track')).toHaveCount(0);

      for (let index = 0; index < 5; index += 1) {
        const video = nativeVideos.nth(index);
        await expect(video).toHaveAttribute('poster', /\/images\/meeting\/.+\.webp$/);
        expect(
          await video.evaluate((element) => {
            const videoElement = element as HTMLVideoElement;
            return {
              autoPlay: videoElement.autoplay,
              muted: videoElement.muted,
              playsInline: videoElement.playsInline,
            };
          }),
        ).toEqual({ autoPlay: true, muted: true, playsInline: true });
        await expect(video.locator('track')).toHaveCount(0);
      }
    });

    test('keeps static Product Film fallbacks at the intended media ratio', async ({
      page,
    }) => {
      const meeting = page.locator('[data-meeting-film-ready]');
      test.skip(
        await meeting.getAttribute('data-meeting-film-ready') === 'true',
        'Pending fallback geometry only applies before inspected recordings are published',
      );

      await expect(meeting.locator('[data-film-static-fallback]')).toHaveCount(4);
      const filmFallbacks = page.locator(
        '[data-film-act] [data-film-static-fallback]',
      );
      await expect(filmFallbacks).toHaveCount(3);

      for (const viewport of [
        { width: 1440, height: 1000 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);

        const images = filmFallbacks.locator('img');
        for (let index = 0; index < 3; index += 1) {
          const image = images.nth(index);
          await image.scrollIntoViewIfNeeded();
          await expect.poll(
            () => image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
          ).toBeGreaterThan(0);
        }

        const geometry = await filmFallbacks.evaluateAll((figures) =>
          figures.map((figure) => {
            const image = figure.querySelector<HTMLImageElement>('img');
            const caption = figure.querySelector<HTMLElement>('figcaption');
            if (!image || !caption) throw new Error('Incomplete static film fallback');

            const imageBounds = image.getBoundingClientRect();
            const captionBounds = caption.getBoundingClientRect();
            const figureBounds = figure.getBoundingClientRect();
            return {
              ratio: imageBounds.width / imageBounds.height,
              imageHeight: imageBounds.height,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              captionHeight: captionBounds.height,
              captionGap: captionBounds.top - imageBounds.bottom,
              trailingGap: figureBounds.bottom - captionBounds.bottom,
            };
          }),
        );

        for (const fallback of geometry) {
          expect(fallback.ratio).toBeCloseTo(16 / 9, 2);
          expect(fallback.imageHeight).toBeGreaterThan(0);
          expect(fallback.imageHeight).toBeLessThan(viewport.height);
          expect(fallback.naturalWidth).toBeGreaterThan(0);
          expect(fallback.naturalHeight).toBeGreaterThan(0);
          expect(fallback.captionHeight).toBeGreaterThan(0);
          expect(fallback.captionGap).toBeGreaterThanOrEqual(0);
          expect(fallback.captionGap).toBeLessThanOrEqual(16);
          expect(Math.abs(fallback.trailingGap)).toBeLessThanOrEqual(1);
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      }
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('uses standard project navigation across expanded and compact widths', async ({
      page,
    }) => {
      const chapterControl = page.locator('[data-meeting-rail] [data-case-web-control]');
      const navigation = page.getByRole('navigation', {
        name: locale === 'zh' ? '案例章节' : 'Case study chapters',
      });

      for (const width of [901, 1000, 1100]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(chapterControl).toHaveAttribute('data-compact-at', 'default');
        await expect(navigation).toBeVisible();
        await expect(navigation.getByText('01', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', {
          name: locale === 'zh' ? '打开章节目录' : 'Open chapter index',
        })).toBeHidden();
        await expect(navigation.getByRole('link').first()).toHaveCSS(
          'grid-template-columns',
          /32px\s+\d+(?:\.\d+)?px/,
        );

        const sticky = await chapterControl.evaluate((control) => {
          const probe = document.createElement('div');
          probe.style.position = 'fixed';
          probe.style.insetBlockStart = 'calc(var(--header-height) + var(--space-5))';
          document.body.append(probe);
          const expectedTop = getComputedStyle(probe).insetBlockStart;
          probe.remove();

          const style = getComputedStyle(control);
          return {
            position: style.position,
            top: style.insetBlockStart,
            expectedTop,
          };
        });
        expect(sticky.position).toBe('sticky');
        expect(sticky.top).not.toBe('auto');
        expect(sticky.top).toBe(sticky.expectedTop);
      }

      await page.setViewportSize({ width: 900, height: 900 });
      const toggle = chapterControl.getByRole('button');
      await expect(toggle).toHaveAccessibleName(
        locale === 'zh' ? '打开章节目录' : 'Open chapter index',
      );
      await expect(toggle).toHaveAttribute('data-hydrated', 'true');
      await expect(toggle).toBeVisible();
      await expect(navigation).toBeHidden();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navigation).toBeVisible();
      await expect(navigation.getByText('01', { exact: true })).toBeVisible();

      const contrast = await toggle.evaluate((button) => {
        const rgb = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
        const luminance = (value: string) => {
          const [red = 0, green = 0, blue = 0] = rgb(value).map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        };
        const style = getComputedStyle(button);
        const lighter = Math.max(luminance(style.color), luminance(style.backgroundColor));
        const darker = Math.min(luminance(style.color), luminance(style.backgroundColor));
        return (lighter + 0.05) / (darker + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    test(viewportMatrixTitle, async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      test.skip(
        testInfo.project.name !== 'desktop',
        'Required viewport matrix runs once in the desktop project',
      );

      for (const viewport of requiredViewports) {
        await page.setViewportSize(viewport);
        await page.goto(`/${locale}/work/meeting/`, { waitUntil: 'domcontentloaded' });

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        await expect(page.getByRole('heading', { level: 1, name: 'Agora Meeting' })).toBeVisible();
        await expect(page.locator('#reflection')).toBeVisible();
        await expect(page.locator('[data-product-film-chapter]')).toHaveCount(9);
      }
    });

    test('keeps compact chapter controls readable on their light surface', async ({
      page,
    }) => {
      test.skip((page.viewportSize()?.width ?? 0) > 900, 'Compact navigation only');

      const toggle = page.getByRole('button', {
        name: locale === 'zh' ? '打开章节目录' : 'Open chapter index',
      });
      await expect(toggle).toHaveAttribute('data-hydrated', 'true');
      await toggle.click();
      await expect(page.locator('[data-case-web-control] button')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      const firstLink = page.getByRole('navigation', {
        name: locale === 'zh' ? '案例章节' : 'Case study chapters',
      }).getByRole('link').first();

      const contrast = await firstLink.evaluate((link) => {
        const parseRgb = (value: string) =>
          value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
        const luminance = (value: string) => {
          const [red = 0, green = 0, blue = 0] = parseRgb(value).map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        };
        const linkStyle = getComputedStyle(link);
        const control = link.closest('[data-case-web-control]');
        const toggle = control?.querySelector('button');
        if (!control || !toggle) {
          throw new Error('Compact chapter navigation is missing');
        }
        const background = getComputedStyle(control).backgroundColor;
        const lighter = Math.max(luminance(linkStyle.color), luminance(background));
        const darker = Math.min(luminance(linkStyle.color), luminance(background));
        const toggleStyle = getComputedStyle(toggle);
        const toggleLighter = Math.max(
          luminance(toggleStyle.color),
          luminance(toggleStyle.backgroundColor),
        );
        const toggleDarker = Math.min(
          luminance(toggleStyle.color),
          luminance(toggleStyle.backgroundColor),
        );
        return {
          ratio: (lighter + 0.05) / (darker + 0.05),
          toggleRatio: (toggleLighter + 0.05) / (toggleDarker + 0.05),
          background,
        };
      });

      expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
      expect(contrast.toggleRatio).toBeGreaterThanOrEqual(4.5);
      expect(contrast.background).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('uses stable Product Film posters when reduced motion is requested', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const meeting = page.locator('[data-meeting-film-ready]');
      const ready = await meeting.getAttribute('data-meeting-film-ready');

      await expect(meeting.locator('video[autoplay]')).toHaveCount(0);
      if (ready === 'true') {
        await expect(meeting.locator('[data-product-film-clip]')).toHaveCount(3);
        await expect(meeting.locator('[data-product-film-clip] img:not([hidden])')).toHaveCount(3);
        await expect(meeting.locator('[data-film-replay-row] button')).toHaveCount(0);
        await expect(meeting.locator('[data-orientation-static-comparison]')).toHaveCount(1);
      } else {
        await expect(meeting.locator('[data-film-static-fallback]')).toHaveCount(4);
      }
    });

    test('spans film fields across the viewport while keeping content bounded', async ({
      page,
    }) => {
      const geometry = await page.evaluate(() => {
        const bounds = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Missing ${selector}`);
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width };
        };
        const chapterControl = document.querySelector<HTMLElement>(
          '[data-meeting-rail] [data-case-web-control]',
        );
        if (!chapterControl) throw new Error('Missing Meeting chapter control');

        return {
          viewportWidth: window.innerWidth,
          overflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          film: bounds('#stage-adapts'),
          filmContent: bounds('#stage-adapts > [data-film-title]'),
          turn: bounds('#the-turn'),
          turnContent: bounds('#the-turn > [data-film-turn]'),
          filmBackground: getComputedStyle(
            document.querySelector<HTMLElement>('#stage-adapts')!,
          ).backgroundColor,
          turnBackground: getComputedStyle(
            document.querySelector<HTMLElement>('#the-turn')!,
          ).backgroundColor,
          chapterPosition: getComputedStyle(chapterControl).position,
        };
      });

      for (const band of [geometry.film, geometry.turn]) {
        expect(Math.abs(band.left)).toBeLessThanOrEqual(1);
        expect(Math.abs(band.right - geometry.viewportWidth)).toBeLessThanOrEqual(1);
        expect(Math.abs(band.width - geometry.viewportWidth)).toBeLessThanOrEqual(1);
      }
      for (const content of [geometry.filmContent, geometry.turnContent]) {
        expect(content.left).toBeGreaterThanOrEqual(15);
        expect(content.right).toBeLessThanOrEqual(geometry.viewportWidth - 15);
      }
      expect(geometry.filmBackground).toBe('rgb(8, 10, 12)');
      expect(geometry.turnBackground).toBe('rgb(228, 88, 62)');
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.chapterPosition).toBe(
        geometry.viewportWidth > 900 ? 'sticky' : 'relative',
      );
    });

    test('keeps the product hero intact in a short landscape viewport', async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 });

      const geometry = await page.evaluate(() => {
        const rect = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Missing ${selector}`);
          const bounds = element.getBoundingClientRect();
          return { top: bounds.top, bottom: bounds.bottom, height: bounds.height };
        };
        const meeting = document.querySelector<HTMLElement>('[data-meeting-film-ready]');
        if (!meeting) throw new Error('Missing Meeting film readiness marker');
        const ready = meeting.dataset.meetingFilmReady === 'true';
        const mediaSelector = ready
          ? '[data-meeting-hero] video:not([hidden])'
          : '[data-meeting-hero] [data-film-static-fallback] img';
        const media = document.querySelector<HTMLElement>(mediaSelector);
        if (!media) throw new Error(`Missing visible hero media: ${mediaSelector}`);

        return {
          ready,
          mediaTag: media.tagName,
          hero: rect('[data-meeting-hero]'),
          media: rect(mediaSelector),
          overview: rect('#product-overview'),
          overflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      expect(geometry.media.height).toBeGreaterThan(100);
      expect(geometry.mediaTag).toBe(geometry.ready ? 'VIDEO' : 'IMG');
      expect(geometry.media.top).toBeGreaterThanOrEqual(geometry.hero.top - 1);
      expect(geometry.media.bottom).toBeLessThanOrEqual(geometry.hero.bottom + 1);
      expect(geometry.hero.bottom).toBeLessThanOrEqual(geometry.overview.top + 1);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
    });

    test('expands the case study into a readable print layout', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });

      const printLayout = await page.evaluate(() => {
        const frame = document.querySelector<HTMLElement>('[data-meeting-frame]');
        const rail = document.querySelector<HTMLElement>('[data-meeting-rail]');
        const hero = document.querySelector<HTMLElement>('[data-meeting-hero]');
        const videos = Array.from(
          document.querySelectorAll<HTMLElement>('[data-meeting-case] video'),
        );
        const buttons = Array.from(
          document.querySelectorAll<HTMLElement>('[data-meeting-case] button'),
        );
        const chapters = Array.from(
          document.querySelectorAll<HTMLElement>('[data-product-film-chapter]'),
        );
        const printText = {
          trigger: document.querySelector<HTMLElement>('[data-challenge-trigger]'),
          filmCaption: document.querySelector<HTMLElement>(
            '#content-takes-stage [data-film-static-fallback] figcaption strong, #content-takes-stage [data-product-film-clip] figcaption',
          ),
        };
        if (
          !frame ||
          !rail ||
          !hero ||
          Object.values(printText).some((element) => !element)
        ) {
          throw new Error('Meeting print structure is incomplete');
        }

        const frameBounds = frame.getBoundingClientRect();

        return {
          frameRatio: frameBounds.width / window.innerWidth,
          frameLeft: frameBounds.left,
          frameRight: frameBounds.right,
          viewportWidth: window.innerWidth,
          overflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          railDisplay: getComputedStyle(rail).display,
          heroHeight: hero.getBoundingClientRect().height,
          heroScrollHeight: hero.scrollHeight,
          heroMaxHeight: getComputedStyle(hero).maxHeight,
          videosHidden: videos.every((video) => getComputedStyle(video).display === 'none'),
          buttonsHidden: buttons.every((button) => getComputedStyle(button).display === 'none'),
          chapterSurfaces: chapters.map((chapter) => {
            const style = getComputedStyle(chapter);
            return {
              id: chapter.id,
              minHeight: style.minHeight,
              color: style.color,
              backgroundColor: style.backgroundColor,
            };
          }),
          printTextColors: Object.fromEntries(
            Object.entries(printText).map(([key, element]) => [
              key,
              getComputedStyle(element!).color,
            ]),
          ),
        };
      });

      expect(printLayout.frameRatio).toBeGreaterThanOrEqual(0.8);
      expect(printLayout.frameRatio).toBeLessThanOrEqual(1);
      expect(printLayout.frameLeft).toBeGreaterThanOrEqual(-1);
      expect(printLayout.frameRight).toBeLessThanOrEqual(printLayout.viewportWidth + 1);
      expect(printLayout.overflow).toBeLessThanOrEqual(1);
      expect(printLayout.railDisplay).toBe('none');
      expect(printLayout.heroHeight).toBeGreaterThan(300);
      expect(Math.abs(printLayout.heroHeight - printLayout.heroScrollHeight)).toBeLessThanOrEqual(1);
      expect(printLayout.heroMaxHeight).toBe('none');
      expect(printLayout.videosHidden).toBe(true);
      expect(printLayout.buttonsHidden).toBe(true);
      expect(printLayout.chapterSurfaces).toEqual(
        chapterIds.map((id) => ({
          id,
          minHeight: '0px',
          color: 'rgb(23, 23, 23)',
          backgroundColor: 'rgb(255, 255, 255)',
        })),
      );
      expect(printLayout.printTextColors).toEqual({
        trigger: 'rgb(23, 23, 23)',
        filmCaption: 'rgb(23, 23, 23)',
      });
    });
  });
}
