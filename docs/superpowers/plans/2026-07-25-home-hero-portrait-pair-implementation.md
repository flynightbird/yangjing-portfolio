# Home Hero Portrait Pair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage Hero placeholder with the approved hand-drawn designer portrait and lightly desaturated photographic builder portrait.

**Architecture:** Keep the existing `HeroMotion` two-layer interaction and give each layer its own immutable public asset constant. Both source images have identical dimensions, so the component can share one positioning rule while preserving face alignment across the draggable divider. Component tests lock the role-to-asset mapping; existing browser tests cover image loading and interaction behavior.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Create `public/images/profile/yang-jing-designer.png`: approved `2.png` hand-drawn portrait.
- Create `public/images/profile/yang-jing-builder.png`: approved `1.png` photographic portrait.
- Modify `components/home/hero-motion.tsx`: assign a dedicated asset to each Hero layer and preserve source aspect ratio.
- Modify `components/home/home.module.css`: replace the builder's full grayscale filter with the approved partial desaturation.
- Modify `tests/component/homepage.test.tsx`: lock the role-to-asset mapping and accessible/decorative image behavior.

### Task 1: Lock The Portrait Contract With A Failing Test

**Files:**
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Replace the placeholder assertion with role-specific assertions**

```tsx
const designerPortrait = portraitScene?.querySelector<HTMLImageElement>(
  '[data-portrait-role="designer"]',
);
const builderPortrait = portraitScene?.querySelector<HTMLImageElement>(
  '[data-portrait-role="builder"]',
);

expect(designerPortrait).toHaveAttribute(
  'src',
  expect.stringContaining('yang-jing-designer.png'),
);
expect(designerPortrait).toHaveAttribute('alt', 'Yang Jing portrait frame');
expect(builderPortrait).toHaveAttribute(
  'src',
  expect.stringContaining('yang-jing-builder.png'),
);
expect(builderPortrait).toHaveAttribute('alt', '');
```

- [ ] **Step 2: Run the focused component test and verify it fails**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx -t "gives both identities equal semantic weight"
```

Expected: FAIL because neither `data-portrait-role` selector exists yet.

### Task 2: Add Approved Assets And Implement The Mapping

**Files:**
- Create: `public/images/profile/yang-jing-designer.png`
- Create: `public/images/profile/yang-jing-builder.png`
- Modify: `components/home/hero-motion.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Copy the approved source images without recompression**

Run:

```bash
cp '/Users/admin/Desktop/声网 作品集 整理/照片/2.png' public/images/profile/yang-jing-designer.png
cp '/Users/admin/Desktop/声网 作品集 整理/照片/1.png' public/images/profile/yang-jing-builder.png
```

Expected: both destination files exist at `990x1055` with alpha transparency.

- [ ] **Step 2: Define dedicated role-based asset constants**

Replace the shared portrait constant in `components/home/hero-motion.tsx` with:

```tsx
const DESIGNER_PORTRAIT_SRC = withBasePath('/images/profile/yang-jing-designer.png');
const BUILDER_PORTRAIT_SRC = withBasePath('/images/profile/yang-jing-builder.png');
```

- [ ] **Step 3: Map the builder layer to the photographic asset**

Update the image inside `.builderField`:

```tsx
<Image
  className={styles.heroPortrait}
  data-portrait-role="builder"
  src={BUILDER_PORTRAIT_SRC}
  width={990}
  height={1055}
  alt=""
  priority
/>
```

- [ ] **Step 4: Map the designer layer to the hand-drawn asset**

Update the image inside `.designerField`:

```tsx
<Image
  className={styles.heroPortrait}
  data-portrait-role="designer"
  src={DESIGNER_PORTRAIT_SRC}
  width={990}
  height={1055}
  alt={portraitLabel}
  priority
/>
```

- [ ] **Step 5: Apply the approved builder treatment**

Update `components/home/home.module.css`:

```css
.builderField .heroPortrait {
  filter: grayscale(0.28) saturate(0.82) contrast(1.08) brightness(0.9);
}
```

- [ ] **Step 6: Verify source asset dimensions and run the focused test**

Run:

```bash
sips -g pixelWidth -g pixelHeight -g hasAlpha \
  public/images/profile/yang-jing-designer.png \
  public/images/profile/yang-jing-builder.png
npx vitest run tests/component/homepage.test.tsx -t "gives both identities equal semantic weight"
```

Expected: both images report `990x1055` and alpha; the focused test PASSes.

### Task 3: Regression And Visual Verification

**Files:**
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Run the complete homepage component suite**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx
```

Expected: PASS with no snapshot or accessibility regression.

- [ ] **Step 2: Run homepage browser tests on desktop and mobile**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile
```

Expected: PASS; both portrait images load, the divider remains interactive, and the page has no horizontal overflow.

- [ ] **Step 3: Capture and inspect both breakpoints**

Capture `/en/` at `1440x900` and `390x844`. Confirm:

- the two faces share the same center and vertical anchor;
- the builder portrait retains visible skin tone instead of reading as fully gray;
- the head and shoulders remain inside the Hero on both breakpoints;
- role headings and the divider do not overlap facial features incoherently;
- neither viewport has blank media or horizontal overflow.

- [ ] **Step 4: Run formatting and diff checks**

Run:

```bash
git diff --check
git diff -- components/home/hero-motion.tsx components/home/home.module.css tests/component/homepage.test.tsx
git status --short
```

Expected: no whitespace errors; only the two new profile assets and three planned source/test files are part of this implementation. Existing unrelated modifications remain unstaged.

- [ ] **Step 5: Commit the implementation**

Run:

```bash
git add \
  public/images/profile/yang-jing-designer.png \
  public/images/profile/yang-jing-builder.png \
  components/home/hero-motion.tsx \
  components/home/home.module.css \
  tests/component/homepage.test.tsx
git commit -m "feat: update home hero portraits"
```

Expected: one implementation commit containing only the approved Hero portrait change.
