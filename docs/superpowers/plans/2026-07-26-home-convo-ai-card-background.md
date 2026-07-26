# Homepage ConvoAI Card Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage ConvoAI media card gradient with the supplied full-bleed image on desktop and mobile without changing foreground product media or card behavior.

**Architecture:** Publish the supplied PNG under the existing ConvoAI public asset directory and render one decorative image as the first child of `ConvoAiMedia`. CSS owns the full-card `cover` geometry and explicit stacking beneath the existing desktop browser/phone and mobile loop/poster; the outer flagship card retains only a neutral fallback color.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Create `public/images/convo-ai/home-card-background.png`: approved `803 x 460` background copied without recompression from the supplied source.
- Modify `components/home/convo-ai-media.tsx`: render one base-path-aware decorative background image.
- Modify `components/home/home.module.css`: remove the gradient, make the image full bleed, and preserve foreground stacking.
- Modify `tests/component/homepage.test.tsx`: lock the background image count, source, and decorative semantics.
- Modify `tests/e2e/homepage.spec.ts`: lock asset loading, `cover` behavior, exact card bounds, and responsive presence.

### Task 1: Lock The Background Contract

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add the failing component assertions**

In `publishes the responsive ConvoAI homepage media sources`, add immediately after `expect(media).toBeInTheDocument()`:

```tsx
const backgrounds = media?.querySelectorAll<HTMLImageElement>(
  '[data-convo-card-background]',
);
expect(backgrounds).toHaveLength(1);
expect(backgrounds?.[0]).toHaveAttribute(
  'src',
  '/images/convo-ai/home-card-background.png',
);
expect(backgrounds?.[0]).toHaveAttribute('alt', '');
expect(backgrounds?.[0]).toHaveAttribute('aria-hidden', 'true');
```

- [ ] **Step 2: Run the focused component test and verify RED**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx -t "publishes the responsive ConvoAI homepage media sources"
```

Expected: FAIL because `[data-convo-card-background]` does not exist.

- [ ] **Step 3: Extend the desktop E2E contract**

In `renders the approved flagship materials and desktop focus motion`:

1. Add `/images/convo-ai/home-card-background.png` to the expected ConvoAI request list.
2. Locate the background after `convoMedia`:

```tsx
const convoBackground = convoMedia.locator('[data-convo-card-background]');
```

3. Replace the current gradient assertion with:

```tsx
await expect(convoMedia).toHaveCSS('background-image', 'none');
await expect(convoBackground).toBeVisible();
await expect(convoBackground).toHaveCSS('object-fit', 'cover');
await expect(convoBackground).toHaveCSS('object-position', '50% 50%');
```

4. After reading `mediaBox`, also read and compare the background bounds:

```tsx
const backgroundBox = await convoBackground.boundingBox();
expect(backgroundBox).not.toBeNull();
expect(backgroundBox?.x).toBeCloseTo(mediaBox?.x ?? 0, 0);
expect(backgroundBox?.y).toBeCloseTo(mediaBox?.y ?? 0, 0);
expect(backgroundBox?.width).toBeCloseTo(mediaBox?.width ?? 0, 0);
expect(backgroundBox?.height).toBeCloseTo(mediaBox?.height ?? 0, 0);
```

- [ ] **Step 4: Extend the mobile E2E contract**

In both `stacks flagship media without transforms on mobile` and `uses the static ConvoAI poster on mobile with reduced motion`:

1. Assert the request list contains `/images/convo-ai/home-card-background.png`.
2. Locate `[data-convo-card-background]` inside `convoMedia`.
3. Assert it is visible and has `object-fit: cover`.

In the normal-motion mobile test, compare its bounding box to `convoMediaBox` with the same four `toBeCloseTo(..., 0)` assertions used by the desktop test.

- [ ] **Step 5: Run the focused browser tests and verify RED**

Run against an available local server port:

```bash
PW_PORT=4584 PW_REUSE_SERVER=1 npx playwright test tests/e2e/homepage.spec.ts \
  --project=desktop --project=mobile \
  --grep "approved flagship materials|stacks flagship media|static ConvoAI poster"
```

Expected: FAIL because the approved background asset and element do not exist and the card still uses a gradient.

### Task 2: Publish And Render The Full-Bleed Background

**Files:**
- Create: `public/images/convo-ai/home-card-background.png`
- Modify: `components/home/convo-ai-media.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Copy the approved asset without recompression**

Run:

```bash
cp "/Users/admin/Desktop/声网 作品集 整理/作品集配图/convo/封面背景.jpg" \
  public/images/convo-ai/home-card-background.png
file public/images/convo-ai/home-card-background.png
sips -g pixelWidth -g pixelHeight public/images/convo-ai/home-card-background.png
```

Expected: PNG image data, `803 x 460`.

- [ ] **Step 2: Render the decorative background first**

In `ConvoAiMedia`, add this as the first child of `[data-convo-home-media]`:

```tsx
<img
  className={styles.convoCardBackground}
  data-convo-card-background
  src={withBasePath('/images/convo-ai/home-card-background.png')}
  alt=""
  aria-hidden="true"
/>
```

- [ ] **Step 3: Replace the gradient and define the image layer**

Change `.flagshipConvoMedia` to:

```css
.flagshipConvoMedia {
  z-index: 1;
  background-color: #c7c7c1;
  background-image: none;
  transform-origin: right center;
}
```

Add after `.convoHomeMedia`:

```css
.convoCardBackground {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
}
```

Add `z-index: 1` to `.convoWebBrowser`. Extend the mobile foreground rule so both mobile pictures establish a foreground layer:

```css
.convoMobileLoop,
.convoMobilePoster {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 4: Run component and browser tests and verify GREEN**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx -t "publishes the responsive ConvoAI homepage media sources"
PW_PORT=4584 PW_REUSE_SERVER=1 npx playwright test tests/e2e/homepage.spec.ts \
  --project=desktop --project=mobile \
  --grep "approved flagship materials|stacks flagship media|static ConvoAI poster"
```

Expected: focused component and applicable desktop/mobile browser tests PASS; device-specific cases remain skipped by their existing guards.

### Task 3: Regression, Visual Verification, And Commit

**Files:**
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Run the complete homepage component suite**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx
```

Expected: all homepage component tests PASS. Existing jsdom Canvas warnings remain non-failing output.

- [ ] **Step 2: Run focused lint and diff checks**

Run:

```bash
npx eslint components/home/convo-ai-media.tsx tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git diff --check
```

Expected: no lint or whitespace errors.

- [ ] **Step 3: Capture desktop and mobile screenshots**

Capture `/en/` at `1440 x 900` and `390 x 844`. Confirm:

- the supplied blue image reaches all four media-card edges;
- no previous gray-purple gradient remains;
- desktop browser and phone evidence remain readable above the image;
- mobile loop and reduced-motion poster remain contained above the image;
- card radius clips the background cleanly;
- no horizontal overflow or layout shift appears.

- [ ] **Step 4: Inspect the scoped diff**

Run:

```bash
git status --short
git diff -- components/home/convo-ai-media.tsx components/home/home.module.css \
  tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
```

Expected: implementation changes are limited to the four planned source/test files plus the approved image asset. Existing unrelated Meeting changes remain outside the isolated worktree.

- [ ] **Step 5: Commit the implementation**

Run:

```bash
git add public/images/convo-ai/home-card-background.png \
  components/home/convo-ai-media.tsx components/home/home.module.css \
  tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: replace ConvoAI card background"
```

Expected: one implementation commit containing only the approved ConvoAI background replacement.
