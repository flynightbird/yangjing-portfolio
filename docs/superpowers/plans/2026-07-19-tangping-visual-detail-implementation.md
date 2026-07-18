# Tangping Visual Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a bilingual Tangping visual-detail page and connect it to the homepage Visual Archive card for Mei Ping Mei Wu.

**Architecture:** Register Tangping in the existing typed content registry with a dedicated layout. A numeric frame manifest owns ordering, localized copy, text-free production media, and layout variants; the frame component renders desktop overlays and accessible mobile reflow without loading text-bearing references in the public page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, MDX, CSS Modules, Zod, Vitest, Testing Library, Playwright.

---

## File Map

- Create `content/tangping.ts`: numeric frame manifest, localized copy, asset contract, and ascending-order validation.
- Create `content/work/tangping.zh.mdx`: Chinese route metadata and story mount.
- Create `content/work/tangping.en.mdx`: English route metadata and story mount.
- Create `components/tangping/tangping-layout.tsx`: cover hero and detail-page shell.
- Create `components/tangping/tangping-layout.module.css`: cover and shell styles.
- Create `components/tangping/tangping-frame-reveal.tsx`: one-shot IntersectionObserver state for each frame.
- Create `components/tangping/tangping-story.tsx`: semantic frame rendering and reveal attributes.
- Create `components/tangping/tangping-story.module.css`: desktop overlay coordinates, contiguous frames, mobile reflow, and reduced-motion behavior.
- Create `tests/unit/tangping-content.test.ts`: manifest ordering, localization, and production-image rules.
- Create `tests/component/tangping-layout.test.tsx`: hero, frame order, image sources, and semantic copy.
- Create `tests/e2e/tangping.spec.ts`: localized route, homepage entry, frame width, separators, overflow, and motion checks.
- Modify `content/types.ts`: add the `tangping` work slug.
- Modify `content/registry.ts`: register both localized MDX entries and the dedicated layout.
- Modify `lib/content/validate.ts`: include Tangping in canonical work navigation.
- Modify `content/home.ts`: give the Mei Ping Mei Wu archive entry an internal Tangping destination.
- Modify `components/home/visual-archive.tsx`: render internal archive entries as localized links while preserving other lightboxes.
- Modify focused registry, homepage, and publication tests for the new route and destination contract.
- Add `/public/images/tangping/frame-{06,10,11,20}.png`: copies of `6-1`, `10-1`, `11-1`, and `20-1`.
- Add `/evidence/tangping/reference-{06,10,11,20}.png`: copies of the text-bearing reference images.

### Task 1: Add The Numeric Frame Contract And Assets

**Files:**
- Create: `content/tangping.ts`
- Create: `tests/unit/tangping-content.test.ts`
- Create: `public/images/tangping/frame-06.png`
- Create: `public/images/tangping/frame-10.png`
- Create: `public/images/tangping/frame-11.png`
- Create: `public/images/tangping/frame-20.png`
- Create: `evidence/tangping/reference-06.png`
- Create: `evidence/tangping/reference-10.png`
- Create: `evidence/tangping/reference-11.png`
- Create: `evidence/tangping/reference-20.png`

- [ ] **Step 1: Write the failing manifest tests**

```ts
import { describe, expect, it } from 'vitest';

import { tangpingFrames } from '@/content/tangping';

describe('Tangping frame manifest', () => {
  it('sorts frame IDs numerically and preserves the approved initial order', () => {
    expect(tangpingFrames.map(({ id }) => id)).toEqual([6, 10, 11, 20]);
  });

  it('uses text-free public artwork and complete bilingual copy', () => {
    for (const frame of tangpingFrames) {
      expect(frame.image.src).toMatch(/^\/images\/tangping\/frame-\d{2}\.png$/);
      expect(frame.image.src).not.toContain('reference');
      expect(frame.copy.zh.title).toBeTruthy();
      expect(frame.copy.en.title).toBeTruthy();
      expect(frame.layout).toMatch(/^(background|research|personas|needs-matrix)$/);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because the manifest does not exist**

Run: `npx vitest run tests/unit/tangping-content.test.ts`

Expected: FAIL with an unresolved `@/content/tangping` import.

- [ ] **Step 3: Copy paired assets into evidence and public locations**

Run the exact source-to-destination mapping:

```bash
mkdir -p public/images/tangping evidence/tangping
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平6-1.png' public/images/tangping/frame-06.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平10-1.png' public/images/tangping/frame-10.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平11-1.png' public/images/tangping/frame-11.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平20-1.png' public/images/tangping/frame-20.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平6.png' evidence/tangping/reference-06.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平10.png' evidence/tangping/reference-10.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平11.png' evidence/tangping/reference-11.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平/躺平20.png' evidence/tangping/reference-20.png
```

Expected: eight PNG files exist; only the four `frame-*` assets are under `public/`.

- [ ] **Step 4: Implement the typed, numerically sorted manifest**

Define `TangpingFrame` with `id`, `layout`, `image`, and `copy` fields. Store the four approved entries in a private unsorted-safe array, then export:

```ts
export const tangpingFrames = [...frameDefinitions].sort((a, b) => a.id - b.id);
```

Use `2880 × 1620` for every image. Each locale contains the exact reference title and semantic groups for its layout: `stats` and `summary` for frame 6; `intro` and `methods` for frame 10; `dimensions` and `personas` for frame 11; `legend`, `columns`, `rows`, and `cells` for frame 20. English copy is a direct translation of the same groups.

- [ ] **Step 5: Run the focused test**

Run: `npx vitest run tests/unit/tangping-content.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the frame contract and assets**

```bash
git add content/tangping.ts tests/unit/tangping-content.test.ts public/images/tangping evidence/tangping
git commit -m "feat: add Tangping visual frame contract"
```

### Task 2: Register The Bilingual Work Routes

**Files:**
- Modify: `content/types.ts`
- Modify: `content/registry.ts`
- Modify: `lib/content/validate.ts`
- Create: `components/tangping/tangping-layout.tsx`
- Create: `components/tangping/tangping-layout.module.css`
- Create: `components/tangping/tangping-story.tsx`
- Create: `content/work/tangping.zh.mdx`
- Create: `content/work/tangping.en.mdx`
- Modify: `tests/unit/content-schema.test.ts`
- Modify: `tests/unit/work-metadata.test.ts`
- Modify: `tests/unit/publication-validation.test.ts`

- [ ] **Step 1: Extend tests with Tangping bilingual registry expectations**

Add `work/tangping:en` and `work/tangping:zh` to the registry sequence and update the canonical route definitions so Tangping follows Meeting. Assert both entries use translation key `work.tangping` and hero media `/images/archive/alibaba-meipingmeiwu.jpg`.

- [ ] **Step 2: Run focused metadata and validation tests**

Run: `npx vitest run tests/unit/content-schema.test.ts tests/unit/work-metadata.test.ts tests/unit/publication-validation.test.ts`

Expected: FAIL because `tangping` is not a valid slug or registered route.

- [ ] **Step 3: Add the work slug and canonical sequence**

Change the work slug tuple to:

```ts
export const workSlugs = ['xuelang', 'call-agent', 'meeting', 'tangping'] as const;
```

Update canonical navigation validation to place `tangping` after `meeting`, without changing the Build Lab route contract.

- [ ] **Step 4: Add both MDX entries**

Each file exports complete metadata. Chinese uses title `每平每屋设计家`, proposition `从用户研究到设计师赋能的产品机会画布`; English uses `Mei Ping Mei Wu Designer` and `From user research to a product opportunity map for empowering designers`. Both use `evidenceLevel: 'retrospective'`, a unique `featuredOrder`, and `<TangpingStory locale="zh" />` or `<TangpingStory locale="en" />` as their only body content.

- [ ] **Step 5: Add a compiling layout shell and register both MDX entries**

Create a minimal `TangpingLayout` that renders `<main data-tangping-case>{children}</main>` and accepts `ContentLayoutProps`. Create a minimal `TangpingStory({ locale }: { readonly locale: Locale })` that renders `<div data-tangping-story data-locale={locale} />`, allowing both MDX modules to import it immediately. Import both MDX modules and add two `ContentEntry` records using `Layout: TangpingLayout`. Preserve the established English-before-Chinese pair order. Task 4 replaces the shell markup and story body without changing either exported contract.

- [ ] **Step 6: Run focused tests**

Run: `npx vitest run tests/unit/content-schema.test.ts tests/unit/work-metadata.test.ts tests/unit/publication-validation.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the route contract**

```bash
git add content/types.ts content/registry.ts lib/content/validate.ts content/work/tangping.*.mdx components/tangping/tangping-layout.tsx components/tangping/tangping-layout.module.css components/tangping/tangping-story.tsx tests/unit/content-schema.test.ts tests/unit/work-metadata.test.ts tests/unit/publication-validation.test.ts
git commit -m "feat: register Tangping work routes"
```

### Task 3: Connect The Homepage Mei Ping Mei Wu Card

**Files:**
- Modify: `content/home.ts`
- Modify: `components/home/visual-archive.tsx`
- Modify: `tests/unit/home-content.test.ts`
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Write the failing destination and link tests**

Assert that `alibaba-meipingmeiwu` has `destination: 'internal-case'` and `href: 'work/tangping/'`. Render `VisualArchive locale="zh"` and expect a link named with `每平每屋` to have `/zh/work/tangping/`. Also assert the other three archive projects still expose lightbox buttons and no internal project link.

- [ ] **Step 2: Run focused homepage tests**

Run: `npx vitest run tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: FAIL because real archive entries have no internal destination and Tangping is still lightbox-only.

- [ ] **Step 3: Extend the archive schema**

Add a destination discriminant that supports:

```ts
destination: z.enum(['internal-case', 'lightbox-only']).default('lightbox-only'),
href: nonEmptyString.optional(),
```

Use a refinement requiring `href` exactly for `internal-case`. Set only the Alibaba entry to `destination: 'internal-case'` and `href: 'work/tangping/'`; set the other entries explicitly to `lightbox-only`.

- [ ] **Step 4: Render the localized internal link**

For internal entries, render the stage through the existing locale-aware URL convention and give the link a visible focus state plus a descriptive accessible name. For lightbox-only entries, keep the current `Lightbox` unchanged. Do not add `target="_blank"` to Tangping.

- [ ] **Step 5: Run focused homepage tests**

Run: `npx vitest run tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the homepage entry**

```bash
git add content/home.ts components/home/visual-archive.tsx tests/unit/home-content.test.ts tests/component/homepage.test.tsx
git commit -m "feat: link Mei Ping Mei Wu to Tangping detail"
```

### Task 4: Build The Cover Hero And Four Contiguous Frames

**Files:**
- Modify: `components/tangping/tangping-layout.tsx`
- Modify: `components/tangping/tangping-layout.module.css`
- Create: `components/tangping/tangping-frame-reveal.tsx`
- Modify: `components/tangping/tangping-story.tsx`
- Create: `components/tangping/tangping-story.module.css`
- Create: `tests/component/tangping-layout.test.tsx`

- [ ] **Step 1: Write component tests before implementation**

Render `TangpingLayout` with `TangpingStory` and assert:

```ts
expect(screen.getByRole('heading', { level: 1, name: /每平每屋/ })).toBeVisible();
expect(screen.getByText('Alibaba / 2019–2020.12')).toBeVisible();
expect(container.querySelectorAll('[data-tangping-frame]')).toHaveLength(4);
expect([...container.querySelectorAll('[data-tangping-frame]')].map((node) => node.getAttribute('data-frame-id'))).toEqual(['6', '10', '11', '20']);
expect(screen.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual(expect.arrayContaining([
  '/images/tangping/frame-06.png',
  '/images/tangping/frame-10.png',
  '/images/tangping/frame-11.png',
  '/images/tangping/frame-20.png',
]));
```

Also assert that reference filenames never appear in rendered markup.

- [ ] **Step 2: Run the component test and verify failure**

Run: `npx vitest run tests/component/tangping-layout.test.tsx`

Expected: FAIL because Tangping components do not exist.

- [ ] **Step 3: Implement `TangpingLayout`**

Render a black page shell and a cover hero using `meta.heroMedia`. Place company/period, `meta.title`, and project type as HTML over the image. Keep the image full-bleed inside the shared story width, use an `<h1>`, and pass the MDX child story directly below the hero.

- [ ] **Step 4: Implement semantic frame rendering**

Map `tangpingFrames` in numeric order. Each frame is a `<section data-tangping-frame data-frame-id>` containing the text-free image and semantic copy groups. Use a layout-specific child component for background, research, personas, and needs-matrix groups so each remains readable and testable.

- [ ] **Step 5: Implement desktop and mobile CSS**

Desktop requirements:

```css
.story { width: min(100%, 112.5rem); margin-inline: auto; background: #000; }
.frame { position: relative; overflow: hidden; border: 0; margin: 0; padding: 0; }
.frame + .frame { border: 0; margin-block-start: 0; }
.artwork { display: block; width: 100%; height: auto; }
```

Position desktop copy with percentage coordinates per layout variant. At `max-width: 48rem`, retain short headings in the visual area and move dense semantic groups into normal document flow beneath the artwork. Prevent horizontal overflow at 320px.

- [ ] **Step 6: Add restrained reveal behavior**

Create `TangpingFrameReveal` as a client component. It observes its root at threshold `0.12`, sets `data-reveal-state="revealed"` once, and disconnects. It uses `useReducedMotionPreference()` to start revealed when reduced motion is active. CSS targets three explicit children, `[data-reveal-layer="title"]`, `[data-reveal-layer="body"]`, and `[data-reveal-layer="labels"]`, with increasing delays. Animate only opacity and `translateY(0.75rem)`; under `prefers-reduced-motion: reduce`, set animation and transition to `none` and transform to `none`.

- [ ] **Step 7: Run component tests**

Run: `npx vitest run tests/component/tangping-layout.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit the visual detail components**

```bash
git add components/tangping tests/component/tangping-layout.test.tsx
git commit -m "feat: build Tangping visual detail story"
```

### Task 5: Verify Routing, Responsive Layout, And Publication

**Files:**
- Create: `tests/e2e/tangping.spec.ts`
- Modify: `tests/e2e/homepage.spec.ts`
- Modify: `tests/unit/architecture.test.ts`

- [ ] **Step 1: Add route and homepage E2E coverage**

Test `/zh/`, scroll to Visual Archive, click the Mei Ping Mei Wu internal link, and expect `/zh/work/tangping/`. Test `/en/work/tangping/` directly and verify the English heading and all four frames.

- [ ] **Step 2: Add visual layout assertions**

At desktop and mobile widths, assert:

```ts
const frames = page.locator('[data-tangping-frame]');
await expect(frames).toHaveCount(4);
const boxes = await frames.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
expect(new Set(boxes.map(({ width }) => Math.round(width))).size).toBe(1);
expect(boxes.slice(1).every((box, index) => Math.abs(box.top - (boxes[index].top + boxes[index].height)) <= 1)).toBe(true);
expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
```

Emulate reduced motion and assert that reveal layers have no transform or transition duration.

- [ ] **Step 3: Run focused unit and component suites**

Run: `npx vitest run tests/unit/tangping-content.test.ts tests/unit/home-content.test.ts tests/unit/content-schema.test.ts tests/unit/work-metadata.test.ts tests/unit/publication-validation.test.ts tests/component/tangping-layout.test.tsx tests/component/homepage.test.tsx`

Expected: PASS.

- [ ] **Step 4: Run lint and source publication validation**

Run: `npm run lint && node scripts/validate-publication.mjs --mode=source`

Expected: both commands exit 0.

- [ ] **Step 5: Build and run Tangping E2E tests**

Run: `npm run build:framework && npx playwright test tests/e2e/tangping.spec.ts tests/e2e/homepage.spec.ts`

Expected: build succeeds and focused E2E tests pass.

- [ ] **Step 6: Capture desktop and mobile screenshots for visual comparison**

Capture `/zh/work/tangping/` at `1440 × 1000` and `390 × 844`. Compare the desktop frames with the four evidence references and check readable mobile reflow, exact frame order, common width, no separators, no overlaps, and no blank media.

- [ ] **Step 7: Run the complete test suite**

Run: `npm test`

Expected: PASS with no regression in existing work, archive, navigation, or publication contracts.

- [ ] **Step 8: Commit verification coverage**

```bash
git add tests/e2e/tangping.spec.ts tests/e2e/homepage.spec.ts tests/unit/architecture.test.ts
git commit -m "test: verify Tangping visual detail flow"
```
