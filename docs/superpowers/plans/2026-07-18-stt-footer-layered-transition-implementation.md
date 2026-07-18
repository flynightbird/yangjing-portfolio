# STT Responsive Fill And Layered Footer Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live STT stage fill its virtual browser and reveal the purple homepage Footer beneath a rounded black upper surface with bounded reverse parallax.

**Architecture:** Keep the STT source snapshot immutable and change only its local embed adapter, then regenerate the protected publication copy and checksum contract. Mark the localized homepage explicitly, keep the Footer content server-rendered, and add one small client controller that writes bounded reveal progress to a CSS variable without taking over scrolling.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, CSS Modules, same-origin iframe messaging, Vitest, Testing Library, Playwright.

---

## File Map

- `integrations/stt-demo/stage-embed.css`: responsive geometry applied only to `?embed=stage`.
- `integrations/stt-demo/stage-embed.js`: existing playback timer adapter with obsolete fixed-stage scaling removed.
- `public/demos/stt-demo/stage-embed.css`: generated publication copy of the CSS adapter.
- `public/demos/stt-demo/stage-embed.js`: generated publication copy of the JavaScript adapter.
- `evidence/stt-demo/publication-checksums.json`: generated checksum contract for the updated publication adapter.
- `tests/e2e/stt-demo.spec.ts`: direct embed geometry and composition contract.
- `tests/e2e/stt-homepage-media.spec.ts`: complete-fill contract inside the homepage browser window.
- `app/(localized)/[locale]/page.tsx`: explicit homepage marker used to scope the Footer reveal.
- `components/shell/footer-reveal-motion.tsx`: request-animation-frame-throttled reveal-progress controller.
- `components/shell/site-footer.tsx`: stable Footer markup plus reveal layer and controller.
- `components/shell/site-footer.module.css`: homepage-only sticky underlay, 32px upper boundary, and 8%/4% parallax.
- `tests/component/footer-reveal-motion.test.tsx`: controller progress, route gate, and cleanup contract.
- `tests/component/site-footer.test.tsx`: semantic Footer content and reveal wrapper contract.
- `tests/e2e/footer-reveal.spec.ts`: homepage layering, mobile distance, reduced motion, and non-homepage isolation.

### Task 1: Replace Fixed STT Contain Scaling With Responsive Fill

**Files:**
- Modify: `tests/e2e/stt-demo.spec.ts`
- Modify: `integrations/stt-demo/stage-embed.css`
- Modify: `integrations/stt-demo/stage-embed.js`
- Generate: `public/demos/stt-demo/stage-embed.css`
- Generate: `public/demos/stt-demo/stage-embed.js`
- Generate: `evidence/stt-demo/publication-checksums.json`

- [ ] **Step 1: Rewrite the direct embed test as a full-viewport contract**

Replace the fixed inset and `--stt-stage-scale` assertions in `the direct stage embed is centered and preserves the complete composition` with:

```ts
test('the direct stage embed fills its viewport and preserves the complete composition', async ({
  page,
}, testInfo) => {
  const runtime = observeRuntime(page, testInfo.project.use.baseURL);
  const response = await page.goto('/demos/stt-demo/index.html?embed=stage', {
    waitUntil: 'networkidle',
  });

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('data-stt-embed', 'stage');
  const stage = page.locator('.land-visual');
  const snip = page.locator('.snip');
  const content = [
    page.locator('.snip-speaker'),
    page.locator('.snip-original'),
    page.locator('.snip-translation'),
    page.locator('.snip-side'),
    page.locator('.snip-dock'),
  ];
  for (const locator of [stage, snip, ...content]) await expect(locator).toBeVisible();
  await expect(page.locator('.land-bar')).toBeHidden();
  await expect(page.locator('.land-copy')).toBeHidden();
  await expect(page.locator('#pageProduct')).toBeHidden();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  const viewport = page.viewportSize();
  const stageBox = await stage.boundingBox();
  const snipBox = await snip.boundingBox();
  const contentBoxes = await Promise.all(content.map((locator) => locator.boundingBox()));
  expect(viewport).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(snipBox).not.toBeNull();
  expect(contentBoxes).not.toContain(null);
  if (!viewport || !stageBox || !snipBox || contentBoxes.includes(null)) return;

  expect(stageBox.x).toBeCloseTo(0, 0);
  expect(stageBox.y).toBeCloseTo(0, 0);
  expect(stageBox.width).toBeCloseTo(viewport.width, 0);
  expect(stageBox.height).toBeCloseTo(viewport.height, 0);
  expect(snipBox).toEqual(stageBox);
  for (const childBox of contentBoxes) {
    if (!childBox) continue;
    expect(childBox.x).toBeGreaterThanOrEqual(snipBox.x - 1);
    expect(childBox.y).toBeGreaterThanOrEqual(snipBox.y - 1);
    expect(childBox.x + childBox.width).toBeLessThanOrEqual(snipBox.x + snipBox.width + 1);
    expect(childBox.y + childBox.height).toBeLessThanOrEqual(snipBox.y + snipBox.height + 1);
  }
  expect(await page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--stt-stage-scale').trim(),
  )).toBe('');
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )).toBeLessThanOrEqual(1);
  expect(runtime.failedLocalRequests).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});
```

- [ ] **Step 2: Run the focused test and verify the fixed canvas fails**

Run:

```bash
npx playwright test tests/e2e/stt-demo.spec.ts --project=desktop --grep "fills its viewport"
```

Expected: FAIL because `.land-visual` still has non-zero insets and does not match the iframe viewport.

- [ ] **Step 3: Make the embed stage responsive and remove obsolete scaling**

In `integrations/stt-demo/stage-embed.css`, replace the fixed `.land-visual` rule with:

```css
html[data-stt-embed='stage'] .land-visual {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: none;
  transform: none;
}
```

Keep `.snip` at `width: 100%`, `height: 100%`, with the flexible main column and fixed participant rail.

In `integrations/stt-demo/stage-embed.js`, delete `updateStageScale()`, its initial call, and its resize listener. Do not change the timer shim, playback messages, or ready message.

- [ ] **Step 4: Install the adapter into the protected publication and refresh checksums**

Run:

```bash
node --input-type=module -e "import { installLocalSttAdaptation } from './scripts/sync-stt-demo.mjs'; await installLocalSttAdaptation({ demoRoot: './public/demos/stt-demo', integrationRoot: './integrations/stt-demo' });"
node scripts/write-stt-publication-checksums.mjs
```

Expected: the public adapter files exactly match `integrations/stt-demo`, upstream Demo files remain unchanged, and the publication checksum JSON contains updated hashes only for the approved publication set.

- [ ] **Step 5: Run source-provenance and direct-embed verification**

Run:

```bash
npx vitest run tests/unit/stt-source.test.ts
npx playwright test tests/e2e/stt-demo.spec.ts --project=desktop --grep "direct stage embed|normal demo primary action"
```

Expected: both commands PASS; the standalone Demo remains interactive and only `?embed=stage` uses responsive geometry.

- [ ] **Step 6: Commit the STT adapter change**

```bash
git add integrations/stt-demo/stage-embed.css integrations/stt-demo/stage-embed.js \
  public/demos/stt-demo/stage-embed.css public/demos/stt-demo/stage-embed.js \
  evidence/stt-demo/publication-checksums.json tests/e2e/stt-demo.spec.ts
git commit -m "fix: fill the STT homepage stage"
```

### Task 2: Verify Full Fill Inside The Homepage Browser Window

**Files:**
- Modify: `tests/e2e/stt-homepage-media.spec.ts`

- [ ] **Step 1: Add iframe-interior fill assertions after valid readiness**

In `reserves the stage and crossfades only after valid embed readiness`, after the frame becomes opaque, add:

```ts
const embed = page.frameLocator(
  'iframe[src="/demos/stt-demo/index.html?embed=stage"]',
);
const fill = await embed.locator('.land-visual').evaluate((element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    viewportWidth: document.documentElement.clientWidth,
    viewportHeight: document.documentElement.clientHeight,
  };
});
expect(fill.x).toBeCloseTo(0, 0);
expect(fill.y).toBeCloseTo(0, 0);
expect(fill.width).toBeCloseTo(fill.viewportWidth, 0);
expect(fill.height).toBeCloseTo(fill.viewportHeight, 0);
for (const selector of [
  '.snip-speaker',
  '.snip-original',
  '.snip-translation',
  '.snip-side',
  '.snip-dock',
]) {
  await expect(embed.locator(selector)).toBeInViewport();
}
```

- [ ] **Step 2: Run the homepage media suite**

Run:

```bash
npx playwright test tests/e2e/stt-homepage-media.spec.ts --project=desktop
```

Expected: PASS, including fallback readiness, one-time scan, pause/resume, non-interactivity, and full iframe fill.

- [ ] **Step 3: Commit the homepage integration contract**

```bash
git add tests/e2e/stt-homepage-media.spec.ts
git commit -m "test: verify STT stage edge-to-edge fill"
```

### Task 3: Build The Homepage-Only Footer Reveal Controller

**Files:**
- Create: `components/shell/footer-reveal-motion.tsx`
- Modify: `components/shell/site-footer.tsx`
- Modify: `components/shell/site-footer.module.css`
- Modify: `app/(localized)/[locale]/page.tsx`
- Create: `tests/component/footer-reveal-motion.test.tsx`
- Modify: `tests/component/site-footer.test.tsx`

- [ ] **Step 1: Write controller and markup tests**

Create `tests/component/footer-reveal-motion.test.tsx`:

```tsx
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FooterRevealMotion } from '@/components/shell/footer-reveal-motion';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FooterRevealMotion', () => {
  it('writes bounded homepage reveal progress through requestAnimationFrame', () => {
    let top = 1000;
    Object.defineProperties(window, {
      innerHeight: { configurable: true, value: 1000 },
      innerWidth: { configurable: true, value: 1200 },
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if ((this as HTMLElement).matches('[data-site-footer]')) {
        return { x: 0, y: top, top, right: 1200, bottom: top + 800, left: 0, width: 1200, height: 800, toJSON: () => ({}) };
      }
      return { x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0, toJSON: () => ({}) };
    });
    const { container } = render(
      <><div data-homepage /><footer data-site-footer><FooterRevealMotion /></footer></>,
    );
    const footer = container.querySelector<HTMLElement>('[data-site-footer]');
    expect(footer?.style.getPropertyValue('--footer-reveal-progress')).toBe('0');
    expect(footer?.style.getPropertyValue('--footer-reveal-offset')).toBe('8%');
    top = 600;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(footer?.style.getPropertyValue('--footer-reveal-progress')).toBe('0.5');
    expect(footer?.style.getPropertyValue('--footer-reveal-offset')).toBe('4%');
    top = -200;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(footer?.style.getPropertyValue('--footer-reveal-progress')).toBe('1');
    expect(footer?.style.getPropertyValue('--footer-reveal-offset')).toBe('0%');
  });

  it('does not activate without the homepage marker', () => {
    const { container } = render(<footer data-site-footer><FooterRevealMotion /></footer>);
    expect(
      container.querySelector<HTMLElement>('[data-site-footer]')?.style
        .getPropertyValue('--footer-reveal-progress'),
    ).toBe('');
  });
});
```

Extend `tests/component/site-footer.test.tsx` with:

```ts
expect(container.firstElementChild).toHaveAttribute('data-site-footer');
expect(container.querySelector('[data-footer-reveal-layer]')).toBeInTheDocument();
```

- [ ] **Step 2: Run the component tests and verify missing components fail**

Run:

```bash
npx vitest run tests/component/footer-reveal-motion.test.tsx tests/component/site-footer.test.tsx
```

Expected: FAIL because `FooterRevealMotion`, the homepage marker, and reveal wrapper do not exist.

- [ ] **Step 3: Implement the scroll-progress controller**

Create `components/shell/footer-reveal-motion.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function FooterRevealMotion() {
  useEffect(() => {
    if (!document.querySelector('[data-homepage]')) return;
    const footer = document.querySelector<HTMLElement>('[data-site-footer]');
    if (!footer) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = footer.getBoundingClientRect();
      const distance = Math.min(window.innerHeight, bounds.height);
      const progress = distance > 0
        ? clamp((window.innerHeight - bounds.top) / distance)
        : 1;
      const maximumOffset = window.innerWidth <= 767 ? 4 : 8;
      footer.style.setProperty('--footer-reveal-progress', String(progress));
      footer.style.setProperty(
        '--footer-reveal-offset',
        `${(1 - progress) * maximumOffset}%`,
      );
    };
    const queueUpdate = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);
    return () => {
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      footer.style.removeProperty('--footer-reveal-progress');
      footer.style.removeProperty('--footer-reveal-offset');
    };
  }, []);

  return null;
}
```

- [ ] **Step 4: Add the route marker and reveal layer**

Change the homepage root to:

```tsx
<div className={styles.home} data-homepage>
```

In `SiteFooter`, import `FooterRevealMotion`, add `data-site-footer` to `<footer>`, and wrap `LiquidField` plus `.inner` in:

```tsx
<div className={styles.revealLayer} data-footer-reveal-layer>
  <LiquidField variant="footer" interactive className={styles.liquid} />
  <div className={styles.inner}>{/* existing Footer content unchanged */}</div>
</div>
<FooterRevealMotion />
```

- [ ] **Step 5: Implement homepage-only layered CSS**

Add the following structure to `site-footer.module.css`, retaining current typography and content styles:

```css
.root {
  --footer-reveal-progress: 0;
  --footer-reveal-offset: 8%;
}

.revealLayer {
  position: relative;
  min-height: inherit;
  isolation: isolate;
}

:global(body:has([data-homepage]) #main-content) {
  position: relative;
  z-index: 1;
}

:global(body:has([data-homepage]) [data-homepage]) {
  overflow: clip;
  border-radius: 0 0 32px 32px;
  background: var(--theme-canvas);
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.28);
}

:global(body:has([data-homepage])) .root {
  position: sticky;
  z-index: 0;
  bottom: 0;
  margin-top: -32px;
  padding-top: 32px;
}

:global(body:has([data-homepage])) .revealLayer {
  transform: translate3d(0, var(--footer-reveal-offset), 0);
  will-change: transform;
}

@media (max-width: 767px) {
  .root { --footer-reveal-offset: 4%; }
}

@media (prefers-reduced-motion: reduce) {
  :global(body:has([data-homepage])) .revealLayer {
    transform: none;
  }
}
```

Keep the existing `.inner { min-height: inherit; }` rule unchanged; `.revealLayer` also inherits the Footer minimum height. Do not change copy, email, liquid colors, or metadata.

- [ ] **Step 6: Run component tests**

Run:

```bash
npx vitest run tests/component/footer-reveal-motion.test.tsx tests/component/site-footer.test.tsx tests/component/homepage.test.tsx
```

Expected: PASS for both locales, minimal Footer content, route-gated progress, and existing homepage content.

- [ ] **Step 7: Commit the Footer implementation**

```bash
git add 'app/(localized)/[locale]/page.tsx' \
  components/shell/footer-reveal-motion.tsx components/shell/site-footer.tsx \
  components/shell/site-footer.module.css tests/component/footer-reveal-motion.test.tsx \
  tests/component/site-footer.test.tsx
git commit -m "feat: reveal the footer beneath the homepage"
```

### Task 4: Verify Layering, Route Isolation, Motion Preferences, And Overflow

**Files:**
- Create: `tests/e2e/footer-reveal.spec.ts`

- [ ] **Step 1: Write the layered Footer E2E contract**

Create `tests/e2e/footer-reveal.spec.ts` with:

```ts
import { expect, test } from '@playwright/test';

test.describe('homepage Footer reveal', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !['desktop', 'mobile'].includes(testInfo.project.name),
      'Footer reveal is verified at desktop and 390px mobile bounds.',
    );
  });

  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} reveals the Footer as a lower layer`, async ({ page }, testInfo) => {
      await page.goto(`/${locale}/`, { waitUntil: 'networkidle' });
      const homepage = page.locator('[data-homepage]');
      const footer = page.locator('[data-site-footer]');
      const layer = footer.locator('[data-footer-reveal-layer]');

      await expect(homepage).toHaveCSS('border-bottom-left-radius', '32px');
      await expect(homepage).toHaveCSS('border-bottom-right-radius', '32px');
      await expect(footer).toHaveCSS('position', 'sticky');
      await expect(footer).toHaveCSS('bottom', '0px');
      expect(await footer.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--footer-reveal-offset').trim(),
      )).toBe(testInfo.project.name === 'mobile' ? '4%' : '8%');

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect.poll(() => footer.evaluate((element) =>
        Number(getComputedStyle(element).getPropertyValue('--footer-reveal-progress')),
      )).toBeCloseTo(1, 1);
      await expect(layer).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
      await expect(footer.getByRole('link', { name: /yangux@qq\.com/i })).toBeVisible();
      await expect(footer.getByText('© 2026 Yang Jing')).toBeVisible();

      expect(await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => ({
        body: getComputedStyle(document.body).scrollSnapType,
        html: getComputedStyle(document.documentElement).scrollSnapType,
      }))).toEqual({ body: 'none', html: 'none' });
    });
  }

  test('reduced motion keeps a static rounded layer', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-footer-reveal-layer]')).toHaveCSS('transform', 'none');
    await expect(page.locator('[data-homepage]')).toHaveCSS(
      'border-bottom-left-radius',
      '32px',
    );
  });

  test('non-homepage routes retain normal Footer flow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Route isolation is viewport-independent.');
    await page.goto('/en/about/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-homepage]')).toHaveCount(0);
    await expect(page.locator('[data-site-footer]')).toHaveCSS('position', 'relative');
    await expect(page.locator('#main-content')).toHaveCSS(
      'border-bottom-left-radius',
      '0px',
    );
  });
});
```

- [ ] **Step 2: Run the Footer E2E suite**

Run:

```bash
npx playwright test tests/e2e/footer-reveal.spec.ts --project=desktop --project=mobile
```

Expected: PASS on English and Chinese homepages, reduced motion, route isolation, and 390px overflow.

- [ ] **Step 3: Run the complete focused regression set**

Run:

```bash
npx vitest run tests/unit/stt-source.test.ts tests/component/build-lab-media.test.tsx \
  tests/component/footer-reveal-motion.test.tsx tests/component/site-footer.test.tsx \
  tests/component/homepage.test.tsx
npx playwright test tests/e2e/stt-demo.spec.ts tests/e2e/stt-homepage-media.spec.ts \
  tests/e2e/footer-reveal.spec.ts --project=desktop --project=mobile
npm run lint
npm run build:framework
```

Expected: all focused tests PASS, ESLint reports no errors, and Next.js completes the framework build. Existing unrelated warnings must be reported but not changed.

- [ ] **Step 4: Capture desktop and mobile visual evidence**

Run `npm run build:framework`, start `python3 -m http.server 45902 --directory out` in a persistent terminal, then capture:

```bash
agent-browser --session stt-footer-final open http://127.0.0.1:45902/en/
agent-browser --session stt-footer-final set viewport 1440 1000
agent-browser --session stt-footer-final scrollintoview '[data-project-id="stt-demo"]'
agent-browser --session stt-footer-final screenshot output/stt-fill-desktop.png
agent-browser --session stt-footer-final scrollintoview '[data-site-footer]'
agent-browser --session stt-footer-final screenshot output/footer-reveal-desktop.png
agent-browser --session stt-footer-final set viewport 390 844
agent-browser --session stt-footer-final screenshot output/footer-reveal-mobile.png
agent-browser --session stt-footer-final close
```

Expected: STT fills all four browser-interior edges with Dock and participant rail visible; the black upper sheet has a 32px curved lower edge; the Footer is unobstructed; no horizontal overflow or hard purple seam is visible.

- [ ] **Step 5: Commit the final E2E contract**

```bash
git add tests/e2e/footer-reveal.spec.ts
git commit -m "test: cover the layered footer reveal"
```

## Final Verification

- [ ] Run `git status --short` and confirm only unrelated pre-existing worktree changes remain.
- [ ] Run `git log -5 --oneline` and record the STT, Footer, and E2E commit hashes.
- [ ] Confirm `/en/` and `/zh/` load, the STT iframe cannot be clicked, and the Footer email remains keyboard accessible.
- [ ] Confirm no task changed Meeting implementation files, Visual Archive internals, project data, or non-homepage Footer flow.
