# Homepage Project Media Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the homepage ConvoAI, STT Demo, AIDX, Xuelang, and Footer presentation while preserving responsive behavior, native vertical scrolling, reduced-motion behavior, and the GitHub Pages base path.

**Architecture:** Keep each change inside its current homepage ownership boundary. Add focused ConvoAI and Xuelang media components, extend `ProjectMeta` with an explicit company-only variant, adjust STT geometry without changing the embedded demo, and treat the existing shared Footer as canonical. Generate the mobile ConvoAI GIF through a reproducible Node/FFmpeg script and verify behavior with Vitest plus Playwright.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Motion, Vitest, Testing Library, Playwright, Node.js asset scripts, FFmpeg/FFprobe.

---

## File Map

- Create `scripts/prepare-convo-ai-home-media.mjs`: deterministic midpoint, acceleration, palette, GIF, and poster generation.
- Create `tests/export/convo-ai-home-media.test.mjs`: asset-script argument and validation coverage without processing the real video in CI.
- Create `components/home/convo-ai-media.tsx`: responsive desktop browser/phone composition and mobile GIF/static fallback.
- Create `components/home/xuelang-home-comparison.tsx`: homepage-specific accessible wipe with one-shot automatic motion.
- Create `components/home/xuelang-home-comparison.module.css`: clipping, labels, divider, touch-action, and reduced-motion presentation.
- Modify `components/home/flagship-projects.tsx`: delegate ConvoAI media rendering.
- Modify `components/home/featured-project.tsx`: accept a media React node while preserving current image callers.
- Modify `components/home/featured-work.tsx`: provide verified Xuelang before/after assets and localized labels.
- Modify `components/home/project-meta.tsx`: add the explicit AIDX company-only variant.
- Modify `components/home/live-website-project.tsx`: use the company-only metadata treatment.
- Modify `components/home/home.module.css`: ConvoAI gradient/browser geometry, STT height, and Xuelang media-host rules.
- Modify `components/home/build-lab-media.module.css`: expose the full STT stage and Dock.
- Modify `content/dictionaries/en.ts`: set AIDX company descriptor to `Singapore AI company`.
- Modify `content/dictionaries/zh.ts`: set AIDX company descriptor to `新加坡 AI 公司`.
- Modify `package.json`: add the reproducible ConvoAI homepage media command.
- Add `public/images/convo-ai/home-mobile-loop.gif`: generated latter-half mobile interaction loop.
- Add `public/images/convo-ai/home-mobile-loop-poster.webp`: generated reduced-motion/static fallback.
- Modify `tests/component/homepage.test.tsx`: DOM, copy, responsive-source, comparison, and Footer ownership contracts.
- Modify `tests/e2e/homepage.spec.ts`: geometry, Dock visibility, two-wipe completion, manual control, vertical scroll, reduced motion, and Footer regression.

### Task 1: Add A Reproducible ConvoAI Mobile Asset Pipeline

**Files:**
- Create: `scripts/prepare-convo-ai-home-media.mjs`
- Create: `tests/export/convo-ai-home-media.test.mjs`
- Modify: `package.json`
- Create: `public/images/convo-ai/home-mobile-loop.gif`
- Create: `public/images/convo-ai/home-mobile-loop-poster.webp`

- [ ] **Step 1: Write failing unit tests for midpoint and FFmpeg arguments**

Create `tests/export/convo-ai-home-media.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGifArgs,
  buildPosterArgs,
  parseDuration,
} from '../../scripts/prepare-convo-ai-home-media.mjs';

test('parses a positive ffprobe duration', () => {
  assert.equal(parseDuration('18.4\n'), 18.4);
  assert.throws(() => parseDuration('0'), /positive duration/);
});

test('starts at the midpoint and accelerates the complete latter half', () => {
  const args = buildGifArgs({ source: '/tmp/source.mp4', duration: 18.4, speed: 1.35 });
  assert.deepEqual(args.slice(0, 4), ['-y', '-ss', '9.200', '-i']);
  assert.ok(args.join(' ').includes('setpts=PTS/1.35'));
  assert.ok(args.join(' ').includes('palettegen'));
  assert.ok(args.join(' ').includes('-loop 0'));
  assert.equal(args.at(-1), 'public/images/convo-ai/home-mobile-loop.gif');
});

test('captures the reduced-motion poster at the midpoint', () => {
  const args = buildPosterArgs({ source: '/tmp/source.mp4', duration: 18.4 });
  assert.deepEqual(args.slice(0, 4), ['-y', '-ss', '9.200', '-i']);
  assert.equal(args.at(-1), 'public/images/convo-ai/home-mobile-loop-poster.webp');
});
```

- [ ] **Step 2: Run the asset-script test and verify it fails**

Run:

```bash
node --test tests/export/convo-ai-home-media.test.mjs
```

Expected: FAIL because `scripts/prepare-convo-ai-home-media.mjs` does not exist.

- [ ] **Step 3: Implement the deterministic generator**

Create `scripts/prepare-convo-ai-home-media.mjs` with exported pure helpers and a CLI. The core argument builders must be:

```js
const GIF_OUTPUT = 'public/images/convo-ai/home-mobile-loop.gif';
const POSTER_OUTPUT = 'public/images/convo-ai/home-mobile-loop-poster.webp';

export function parseDuration(value) {
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('ffprobe must return a positive duration');
  }
  return duration;
}

export function buildGifArgs({ source, duration, speed }) {
  const midpoint = (duration / 2).toFixed(3);
  const filter = [
    `[0:v]setpts=PTS/${speed},fps=12,scale='min(540,iw)':-2:flags=lanczos,split[s0][s1]`,
    '[s0]palettegen=max_colors=160:stats_mode=diff[p]',
    '[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
  ].join(';');
  return ['-y', '-ss', midpoint, '-i', source, '-filter_complex', filter, '-loop', '0', GIF_OUTPUT];
}

export function buildPosterArgs({ source, duration }) {
  return [
    '-y', '-ss', (duration / 2).toFixed(3), '-i', source,
    '-frames:v', '1', '-vf', "scale='min(1080,iw)':-2:flags=lanczos", POSTER_OUTPUT,
  ];
}
```

The CLI must accept `--source` and optional `--speed` (default `1.35`), resolve `FFMPEG_BIN`/`FFPROBE_BIN` before falling back to `ffmpeg`/`ffprobe`, create the output directory, probe duration, run both commands with inherited stderr, and exit non-zero with a direct installation/configuration message when either binary is unavailable.

- [ ] **Step 4: Add the package command and verify unit tests pass**

Add to `package.json`:

```json
"prepare:convo-ai:home": "node scripts/prepare-convo-ai-home-media.mjs"
```

Run:

```bash
node --test tests/export/convo-ai-home-media.test.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 5: Generate and inspect the real GIF and poster**

Ensure FFmpeg is available on `PATH`, or set `FFMPEG_BIN` and `FFPROBE_BIN`, then run:

```bash
npm run prepare:convo-ai:home -- --source "/Users/admin/Desktop/声网 作品集 整理/convo ai demo/对话交互启动.mp4" --speed 1.35
```

Verify:

```bash
file public/images/convo-ai/home-mobile-loop.gif public/images/convo-ai/home-mobile-loop-poster.webp
du -h public/images/convo-ai/home-mobile-loop.gif
```

Expected: valid GIF and WebP files; inspect the GIF visually to confirm it begins at the source midpoint, contains every remaining interaction step, loops cleanly, and remains practical for homepage loading. If it exceeds 12 MB, reduce width to 480 or FPS to 10 without shortening the selected time range.

- [ ] **Step 6: Commit the asset pipeline**

```bash
git add package.json scripts/prepare-convo-ai-home-media.mjs tests/export/convo-ai-home-media.test.mjs public/images/convo-ai/home-mobile-loop.gif public/images/convo-ai/home-mobile-loop-poster.webp
git commit -m "feat: prepare ConvoAI homepage mobile loop"
```

### Task 2: Build The Responsive ConvoAI Media Composition

**Files:**
- Create: `components/home/convo-ai-media.tsx`
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/home.module.css`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing component assertions for both media modes**

Extend the existing `FeaturedWork` media test:

```tsx
const convoAi = container.querySelector<HTMLElement>('[data-project-id="convo-ai"]');
expect(convoAi?.querySelector('[data-convo-home-media]')).toBeInTheDocument();
expect(convoAi?.querySelector('[data-convo-web-browser]')).toBeInTheDocument();
expect(convoAi?.querySelector('[data-convo-web-browser] img')).toHaveAttribute(
  'src',
  '/images/convo-ai/figma/web-ready.png',
);
expect(convoAi?.querySelector('[data-convo-mobile-loop]')).toHaveAttribute(
  'src',
  '/images/convo-ai/home-mobile-loop.gif',
);
expect(convoAi?.querySelector('[data-convo-mobile-poster]')).toHaveAttribute(
  'src',
  '/images/convo-ai/home-mobile-loop-poster.webp',
);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because the new ConvoAI data hooks and assets are not rendered.

- [ ] **Step 3: Create `ConvoAiMedia` and replace the two raw images**

Implement `components/home/convo-ai-media.tsx` as a decorative media body inside the existing project link:

```tsx
import { withBasePath } from '@/lib/i18n/locales';
import styles from './home.module.css';

export function ConvoAiMedia() {
  return (
    <div className={styles.convoHomeMedia} data-convo-home-media>
      <div className={styles.convoWebBrowser} data-convo-web-browser>
        <span className={styles.convoBrowserChrome} aria-hidden="true">
          <span><i /><i /><i /></span><b>convoai.agora.io</b><span />
        </span>
        <img src={withBasePath('/images/convo-ai/figma/web-ready.png')} alt="ConvoAI web conversation ready state" />
      </div>
      <div className={styles.convoPhonePreview} aria-hidden="true">
        <img src={withBasePath('/images/convo-ai/figma/avatar-video.png')} alt="" />
      </div>
      <img className={styles.convoMobileLoop} data-convo-mobile-loop src={withBasePath('/images/convo-ai/home-mobile-loop.gif')} alt="ConvoAI mobile conversation starting and continuing with the AI" />
      <img className={styles.convoMobilePoster} data-convo-mobile-poster src={withBasePath('/images/convo-ai/home-mobile-loop-poster.webp')} alt="ConvoAI mobile conversation ready state" />
    </div>
  );
}
```

Import it in `flagship-projects.tsx`, remove its unused `withBasePath` import, and replace the two current ConvoAI `<img>` elements with `<ConvoAiMedia />`.

- [ ] **Step 4: Add stable desktop and mobile geometry**

In `home.module.css`:

- set `.flagshipConvoMedia` to the approved low-saturation purple/grey-green/warm-grey gradient;
- position `.convoWebBrowser` from the upper-left with `left: clamp(1rem, 3vw, 1.75rem)`, `right: clamp(1rem, 3vw, 1.75rem)`, and a negative bottom inset so only the browser bottom can be clipped;
- use the existing 38px chrome geometry and `15px 15px 18px 18px` browser radii;
- set the web screenshot to `width: 100%`, `height: auto`, `object-fit: contain`, and `object-position: left top`;
- place the phone inside a stable `aspect-ratio`, keep all edges inset, and use matching outer/inner radii so no square or black corner leaks;
- hide `.convoMobileLoop` and `.convoMobilePoster` on desktop;
- below `767px`, hide the browser and phone, show the GIF as the sole media with `object-fit: contain`, and keep the current media-card height stable;
- under reduced motion, hide the GIF and show the poster.

- [ ] **Step 5: Add browser geometry and reduced-motion E2E assertions**

Add tests to `tests/e2e/homepage.spec.ts` that assert:

```ts
const browser = page.locator('[data-project-id="convo-ai"] [data-convo-web-browser]');
const screenshot = browser.locator('img');
await expect(screenshot).toHaveCSS('object-position', '0% 0%');
const [browserBox, imageBox] = await Promise.all([browser.boundingBox(), screenshot.boundingBox()]);
expect(browserBox).not.toBeNull();
expect(imageBox).not.toBeNull();
expect(Math.abs((browserBox?.x ?? 0) - (imageBox?.x ?? 0))).toBeLessThanOrEqual(2);
```

For the mobile project, assert the browser is hidden and GIF visible. In a reduced-motion test, assert the GIF is hidden and poster visible.

- [ ] **Step 6: Run focused component and browser tests**

```bash
npm test -- tests/component/homepage.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "ConvoAI"
npx playwright test tests/e2e/homepage.spec.ts --project=mobile --grep "ConvoAI"
```

Expected: all focused tests PASS and desktop/mobile screenshots show correct radii and no left crop.

- [ ] **Step 7: Commit the ConvoAI card**

```bash
git add components/home/convo-ai-media.tsx components/home/flagship-projects.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: refresh ConvoAI homepage media"
```

### Task 3: Reveal The Complete STT Demo Dock

**Files:**
- Modify: `components/home/home.module.css`
- Modify: `components/home/build-lab-media.module.css`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add a failing Dock visibility assertion**

Extend the existing desktop STT test. Resolve `[data-stt-stage-viewport]`, then use its iframe when ready or fallback image geometry before ready. The browser-window bottom must remain inside the media card and the embedded viewport must use the product capture ratio:

```ts
await expect
  .poll(() => stt.locator('[data-stt-browser-window]').evaluate((element) => {
    const media = element.closest<HTMLElement>('[data-stt-media-stage]');
    if (!media) return false;
    return element.getBoundingClientRect().bottom <= media.getBoundingClientRect().bottom + 1;
  }))
  .toBe(true);
await expect(stt.locator('[data-stt-stage-viewport]')).toHaveCSS('aspect-ratio', '633 / 560');
```

- [ ] **Step 2: Run the focused STT test and verify it fails**

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "media-dominant STT"
```

Expected: FAIL because the viewport currently reports `2 / 1` and crops the Dock.

- [ ] **Step 3: Update the outer and inner geometry without touching demo behavior**

In `build-lab-media.module.css`, change `.stageViewport` from `aspect-ratio: 2 / 1` to `aspect-ratio: 633 / 560`. Keep iframe and fallback absolutely filling the viewport, and change fallback to `object-fit: contain; object-position: center top`.

In `home.module.css`, remove the obsolete `aspect-ratio: 2 / 1` from `.buildBrowserWindow img`, set `.buildMedia { aspect-ratio: 1.05 / 1; }`, and set `.buildBrowserWindow { top: 4%; right: 4%; width: 92%; }`. The resulting width, `633 / 560` stage, and browser chrome remain within the card at desktop and mobile sizes. Preserve 20px card radii, lazy loading, playback messages, and pointer parallax.

- [ ] **Step 4: Run desktop and mobile STT tests**

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "STT"
npx playwright test tests/e2e/homepage.spec.ts --project=mobile --grep "STT"
```

Expected: PASS; the Dock is fully visible and the media remains before copy on mobile.

- [ ] **Step 5: Commit the STT geometry fix**

```bash
git add components/home/home.module.css components/home/build-lab-media.module.css tests/e2e/homepage.spec.ts
git commit -m "fix: reveal complete STT Demo dock"
```

### Task 4: Simplify The AIDX Identity Row

**Files:**
- Modify: `components/home/project-meta.tsx`
- Modify: `components/home/live-website-project.tsx`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Write failing localized metadata tests**

Add a table test:

```tsx
it.each([
  { locale: 'en' as const, descriptor: 'Singapore AI company' },
  { locale: 'zh' as const, descriptor: '新加坡 AI 公司' },
])('uses the company-only AIDX identity row in $locale', ({ locale, descriptor }) => {
  const { container } = render(<FeaturedWork locale={locale} />);
  const meta = container.querySelector<HTMLElement>('[data-project-id="aidx"] [data-project-meta]');
  expect(meta).toHaveAttribute('data-meta-variant', 'company-only');
  expect(meta).toHaveTextContent(descriptor);
  expect(meta?.querySelector('[data-project-meta-separator]')).not.toBeInTheDocument();
  expect(meta?.querySelector('[data-project-kind-label]')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused component test and verify it fails**

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because AIDX still renders company, slash, and project kind.

- [ ] **Step 3: Add an explicit `company-only` variant**

Change `ProjectMeta` to accept `variant?: 'default' | 'company-only'`. Always render `CompanyMark`; render the separator and kind only for `default`. Add `data-meta-variant={variant}`, `data-project-meta-separator` to the separator, and `data-project-kind-label` to the kind paragraph. Do not use CSS-only hiding.

In `live-website-project.tsx`, call:

```tsx
<ProjectMeta
  companyId="aidx"
  company={copy.kind}
  kind={copy.kind}
  variant="company-only"
/>
```

Set the AIDX `kind` strings to exactly `Singapore AI company` and `新加坡 AI 公司`. Keep title, proposition, scope, status, and action unchanged.

- [ ] **Step 4: Run the component suite**

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: PASS for both locales and all six projects still contain exactly one metadata row.

- [ ] **Step 5: Commit the AIDX metadata change**

```bash
git add components/home/project-meta.tsx components/home/live-website-project.tsx content/dictionaries/en.ts content/dictionaries/zh.ts tests/component/homepage.test.tsx
git commit -m "refactor: simplify AIDX homepage identity"
```

### Task 5: Add The Xuelang One-Shot Wipe Without Blocking Scroll

**Files:**
- Create: `components/home/xuelang-home-comparison.tsx`
- Create: `components/home/xuelang-home-comparison.module.css`
- Modify: `components/home/featured-project.tsx`
- Modify: `components/home/featured-work.tsx`
- Modify: `components/home/home.module.css`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing component tests for comparison semantics**

Assert the Xuelang media contains:

```tsx
const xuelang = container.querySelector<HTMLElement>('[data-project-id="xuelang"]');
expect(xuelang?.querySelector('[data-xuelang-home-comparison]')).toBeInTheDocument();
expect(within(xuelang as HTMLElement).getByRole('slider')).toHaveAttribute('min', '4');
expect(within(xuelang as HTMLElement).getByRole('slider')).toHaveAttribute('max', '96');
expect(within(xuelang as HTMLElement).getAllByRole('img')).toHaveLength(2);
expect(xuelang).toHaveTextContent('Before');
expect(xuelang).toHaveTextContent('After');
```

Use `旧版` and `新版` for the Chinese render.

- [ ] **Step 2: Run the component test and verify it fails**

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because Xuelang currently renders one panorama image.

- [ ] **Step 3: Let `FeaturedProject` accept a focused media node**

Add `mediaContent?: ReactNode` to `FeaturedProjectProps`. Inside `[data-project-media-frame]`, render `mediaContent` first, then the existing `media` image, then the draft fallback. Preserve all existing callers and destination behavior.

- [ ] **Step 4: Implement the accessible one-shot comparison**

Create `XuelangHomeComparison` with constants:

```ts
const MIN_POSITION = 4;
const MAX_POSITION = 96;
const INITIAL_POSITION = 38;
const AUTO_KEYFRAMES = [38, 82, 18, 82, 38] as const;
const LEG_DURATION_MS = 650;
```

Use `useReducedMotion`, a root ref, one `IntersectionObserver` with `rootMargin: '-30% 0px -30% 0px'` and threshold `0.01`, and one `requestAnimationFrame` loop. Interpolate each keyframe leg with `0.5 - Math.cos(progress * Math.PI) / 2`. When all four legs complete, set `data-auto-state="complete"` and never observe again. Cancel the frame and disconnect the observer on unmount.

Manual ownership must be implemented by a single `cancelAutomaticMotion()` called from `onPointerDown`, `onChange`, and `onKeyDown`. Keyboard behavior matches the detail component: arrows move 3, Home moves to 4, End moves to 96.

Render the verified assets:

```tsx
before={{ src: '/images/xuelang/learning-before-board.webp', width: 1662, height: 1080 }}
after={{ src: '/images/xuelang/learning-after-board.webp', width: 1662, height: 1080 }}
```

Use localized visible labels `Before` / `After` and `旧版` / `新版`, plus a localized slider aria-label.

- [ ] **Step 5: Add scroll-safe comparison CSS**

In `xuelang-home-comparison.module.css`:

- use the detail comparison's layered full-size images and CSS custom property `--wipe-position`;
- preserve `object-fit: cover` because both verified boards share the exact `1662 / 1080` ratio;
- use `clip-path` for the before image and position divider/handle from the custom property;
- set `.control { touch-action: pan-y; }` and do not set `touch-action: none` anywhere;
- keep the invisible range input over the full visual for mouse/pen access;
- use a 44–48px handle target and visible focus outline;
- do not add wheel, touchmove, or document-level pointer handlers;
- remove automatic transition under reduced motion.

Update `home.module.css` so `.evidence .projectMedia` hosts the comparison without applying the generic image hover scale to its layered images.

- [ ] **Step 6: Wire the localized comparison into `FeaturedWork`**

Pass `<XuelangHomeComparison locale={locale} />` as `mediaContent` and remove the panorama `media` prop. Keep the existing 20px media-card radius and Xuelang link/CTA behavior.

- [ ] **Step 7: Add Playwright coverage for two wipes, manual control, and native scrolling**

Add a desktop test that scrolls the card into the viewport's central band and polls:

```ts
const comparison = page.locator('[data-xuelang-home-comparison]');
await comparison.evaluate((element) => {
  const top = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: top - window.innerHeight * 0.45, behavior: 'instant' });
});
await expect.poll(() => comparison.getAttribute('data-auto-state'), { timeout: 5000 }).toBe('complete');
await expect(comparison.getByRole('slider')).toHaveValue('38');
```

Count direction extrema through a test-only `data-auto-leg` attribute updated from `0` through `4`, asserting the final value is `4`. Then drag the slider and assert the value changes while `data-auto-state` remains `cancelled` or `complete`.

Add a mobile test that positions a touch point over the comparison, performs a vertical swipe with Playwright touchscreen events, and asserts `window.scrollY` increases while the slider value does not jump. Add a reduced-motion test asserting `data-auto-state="disabled"` and value `38` after waiting longer than the normal sequence.

- [ ] **Step 8: Run focused Xuelang tests**

```bash
npm test -- tests/component/homepage.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "Xuelang"
npx playwright test tests/e2e/homepage.spec.ts --project=mobile --grep "Xuelang"
```

Expected: PASS; the sequence runs once, ends at 38, manual input wins, and vertical page movement remains native.

- [ ] **Step 9: Commit the Xuelang comparison**

```bash
git add components/home/xuelang-home-comparison.tsx components/home/xuelang-home-comparison.module.css components/home/featured-project.tsx components/home/featured-work.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: add Xuelang homepage wipe comparison"
```

### Task 6: Lock The Shared Footer And Verify Publication

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add a focused shared-Footer regression test**

The homepage component test should not render the localized layout, so add the structural assertion at the E2E layer:

```ts
const footer = page.locator('[data-site-footer]');
await expect(footer).toHaveCount(1);
await expect(footer.locator('[data-footer-reveal-layer]')).toHaveCount(1);
await expect(footer.locator('[data-footer-email-actions]')).toHaveCount(1);
await expect(footer.locator('a[href="mailto:amanda.yangj@gmail.com"]')).toHaveCount(2);
await expect(page.locator('[data-homepage] footer')).toHaveCount(0);
```

Retain the existing Footer component tests; do not modify `site-footer.tsx` or its stylesheet unless the assertion exposes an actual integration defect.

- [ ] **Step 2: Run the Footer and homepage tests**

```bash
npm test -- tests/component/site-footer.test.tsx tests/component/homepage.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "Footer"
```

Expected: PASS, proving the localized layout supplies the latest shared Footer exactly once.

- [ ] **Step 3: Run static checks and the complete relevant suites**

```bash
npm run lint
npm test
npm run test:export
npx playwright test tests/e2e/homepage.spec.ts
```

Expected: all commands PASS.

- [ ] **Step 4: Build under the production base path**

```bash
npm run build
```

Expected: source validation, Next.js static build, and output validation PASS. Confirm generated HTML references `/yangjing-portfolio/images/convo-ai/home-mobile-loop.gif` and `/yangjing-portfolio/images/convo-ai/home-mobile-loop-poster.webp` through the configured base path.

- [ ] **Step 5: Perform desktop/mobile visual verification**

Start the development server and capture 1440×900 and 390×844 screenshots with Playwright. Verify:

- ConvoAI desktop web screenshot begins at its left edge; only browser bottom may be clipped.
- phone preview has correct outer and inner radii with no leaking black corners;
- mobile ConvoAI uses the loop, while reduced motion uses the poster;
- STT Dock is fully visible;
- AIDX row contains only logo and localized descriptor;
- Xuelang executes two wipes without affecting page scrolling and remains draggable;
- the latest shared Footer is visible after the homepage content.

- [ ] **Step 6: Commit regression coverage or final verification adjustments**

If Task 6 changes tests only:

```bash
git add tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "test: lock homepage media and footer behavior"
```

If no files changed after prior task commits, do not create an empty commit. Finish with `git status --short` and require a clean worktree.
