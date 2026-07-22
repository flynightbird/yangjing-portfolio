# Xuelang Opening Cover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the supplied 16:9 Xuelang artwork as the case study's first-screen cover, move the existing product panorama to the second stage, and align the bilingual project duration with the artwork.

**Architecture:** Add one semantic Xuelang asset record and generated WebP, then restructure only `XuelangLayout` so the first header owns the cover and compact HTML metadata while the existing panorama becomes a sibling immediately after it. Reuse existing tokens and motion infrastructure; update print and visual tests to reflect the new two-stage opening.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, GSAP, Sharp, Vitest, Testing Library, Playwright, agent-browser

---

### Task 1: Register and generate the supplied cover asset

**Files:**
- Modify: `tests/unit/xuelang-assets.test.ts`
- Modify: `evidence/xuelang/manifest.json`
- Create: `evidence/xuelang/source/20220693.png`
- Create: `public/images/xuelang/opening-cover.webp`

- [ ] **Step 1: Add the failing asset assertion**

Add an assertion that the manifest contains:

```ts
{
  id: 'opening-cover',
  sourcePaths: ['evidence/xuelang/source/20220693.png'],
  output: 'public/images/xuelang/opening-cover.webp',
  intrinsic: { width: 1920, height: 1080 },
}
```

- [ ] **Step 2: Run the asset test and verify it fails**

Run:

```bash
npx vitest run tests/unit/xuelang-assets.test.ts --testTimeout=30000
```

Expected: FAIL because `opening-cover` is not in the manifest.

- [ ] **Step 3: Add the semantic asset record and source file**

Add this chapter-00 manifest record:

```json
{
  "id": "opening-cover",
  "chapter": "00",
  "sourceFrames": ["20220693"],
  "sourcePaths": ["evidence/xuelang/source/20220693.png"],
  "output": "public/images/xuelang/opening-cover.webp",
  "format": "webp",
  "crop": { "left": 0, "top": 0, "width": 1920, "height": 1080 },
  "intrinsic": { "width": 1920, "height": 1080 },
  "purpose": "Establish the Xuelang project identity before product evidence.",
  "alt": {
    "zh": "学浪体验升级项目封面，使用实验性中文字体构成展示学习与兴趣主题",
    "en": "Xuelang experience-upgrade cover using experimental Chinese typography around learning and interests"
  },
  "replacementPath": "figma://portfolio-supplied/xuelang-opening-cover-20220693"
}
```

Copy the supplied PNG bytes to `evidence/xuelang/source/20220693.png`.

- [ ] **Step 4: Generate the publication asset**

Run:

```bash
node scripts/prepare-xuelang-assets.mjs
```

Expected: `public/images/xuelang/opening-cover.webp` exists at 1920×1080 and unrelated generated assets retain their Git hashes.

- [ ] **Step 5: Re-run the asset test**

Run:

```bash
npx vitest run tests/unit/xuelang-assets.test.ts --testTimeout=30000
```

Expected: PASS.

### Task 2: Build the cover-first opening and correct the duration

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/unit/xuelang-content.test.ts`
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Add failing layout and content assertions**

Add `coverAlt` to each locale fixture and require the layout to render:

```tsx
const cover = container.querySelector('[data-xuelang-cover]');
expect(cover).toContainElement(
  screen.getByRole('img', { name: coverAlt }),
);
expect(cover?.querySelector('img')).toHaveAttribute(
  'src',
  '/images/xuelang/opening-cover.webp',
);
expect(container.querySelector('[data-xuelang-hero]')).toContainElement(cover);
expect(container.querySelector('[data-xuelang-hero]')).not.toContainElement(
  container.querySelector('[data-hero-panorama]'),
);
```

Update the locale fixture expectations to `2022.03–04 · 2 个月` and `Mar–Apr 2022 · 2 months`. Update content tests to require the same metadata values.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
npx vitest run tests/component/xuelang-layout.test.tsx tests/unit/xuelang-content.test.ts --testTimeout=30000
```

Expected: FAIL because the cover is absent, the panorama is still inside the Hero, and duration values still end in May.

- [ ] **Step 3: Correct the bilingual duration metadata**

Set:

```ts
duration: '2022.03–04 · 2 个月'
```

and:

```ts
duration: 'Mar–Apr 2022 · 2 months'
```

- [ ] **Step 4: Restructure the opening markup**

Inside `[data-xuelang-hero]`, render the full-image figure first:

```tsx
<figure className={styles.cover} data-xuelang-cover>
  <img src="/images/xuelang/opening-cover.webp" alt={text.coverAlt} />
</figure>
```

Keep the coded title, proposition, and facts in a compact `.heroCopy` information band after the figure. Move the unchanged `[data-hero-panorama]` figure outside the closing `</header>` so it remains the next sibling inside the case article.

- [ ] **Step 5: Implement the cover-first responsive CSS**

Use an uncropped image and a restrained information band:

```css
.hero {
  display: grid;
  min-height: calc(100vh - var(--header-height));
  grid-template-columns: repeat(10, minmax(0, 1fr));
  align-content: start;
}

.cover {
  overflow: hidden;
  grid-column: 1 / -1;
  margin: 0;
  border: 1px solid var(--xuelang-line);
  aspect-ratio: 16 / 9;
}

.cover img {
  display: block;
  width: 100%;
  height: auto;
}

.heroCopy {
  grid-column: 1 / -1;
  border-block-end: 1px solid var(--xuelang-line);
}
```

At desktop, lay out title/proposition and facts in a compact multi-column band. At mobile, stack the coded title area and preserve the existing two-column facts behavior. Keep the cover uncropped at every breakpoint.

- [ ] **Step 6: Re-run the focused tests**

Run:

```bash
npx vitest run tests/component/xuelang-layout.test.tsx tests/unit/xuelang-content.test.ts --testTimeout=30000
```

Expected: PASS.

### Task 3: Align motion, print, and viewport regression coverage

**Files:**
- Modify: `components/xuelang/xuelang-motion.tsx`
- Modify: `components/xuelang/xuelang-print.css`
- Modify: `tests/e2e/xuelang.visual.spec.ts`

- [ ] **Step 1: Update the visual contract**

For every viewport, require `[data-xuelang-cover]` and its coded `h1` to be visible in the first viewport. Remove the assertion that the panorama is visible in the first viewport. At desktop widths, assert the panorama top is below the cover bottom and that the cover image uses its natural 16:9 ratio without horizontal overflow.

- [ ] **Step 2: Update the motion sequence**

Animate the cover and coded metadata in the initial desktop timeline. Give the separate panorama its own one-time `ScrollTrigger` starting near `top 86%`. Preserve the existing reduced-motion media queries and section animation behavior.

- [ ] **Step 3: Update print layout**

Keep `[data-xuelang-hero]` as the first PDF page. Constrain `[data-xuelang-cover] img` with `object-fit: contain`, use a smaller coded heading beneath it, and give `[data-hero-panorama]` `break-before: page` so it remains available after the cover.

- [ ] **Step 4: Run browser and PDF checks**

At `1440×1000`, `1280×800`, and `390×844`, verify cover visibility, cover ratio, title and fact wrapping, panorama order, image loading, and zero horizontal overflow. Generate the Chinese PDF and visually inspect page one and the panorama page.

- [ ] **Step 5: Run final verification**

Run:

```bash
npx vitest run tests/unit/xuelang-assets.test.ts tests/unit/xuelang-content.test.ts tests/component/xuelang-layout.test.tsx --testTimeout=30000
npm test -- --testTimeout=30000
npm run lint
npm run build:framework
git diff --check
```

Expected: all tests pass, ESLint reports zero errors, all static pages build, and the diff check is empty.

- [ ] **Step 6: Commit the implementation**

```bash
git add evidence/xuelang/manifest.json evidence/xuelang/source/20220693.png public/images/xuelang/opening-cover.webp content/work/xuelang.zh.mdx content/work/xuelang.en.mdx components/xuelang/xuelang-layout.tsx components/xuelang/xuelang-layout.module.css components/xuelang/xuelang-motion.tsx components/xuelang/xuelang-print.css tests/unit/xuelang-assets.test.ts tests/unit/xuelang-content.test.ts tests/component/xuelang-layout.test.tsx tests/e2e/xuelang.visual.spec.ts
git commit -m "feat: add Xuelang opening cover"
```
