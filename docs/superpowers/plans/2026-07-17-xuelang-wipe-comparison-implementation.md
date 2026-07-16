# Xuelang Wipe Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Xuelang before/after pair with an accessible draggable wipe comparison using the supplied matched boards, while preserving full evidence in print/PDF.

**Architecture:** `XuelangDarkComparison` remains the server-rendered semantic wrapper and delegates pointer and keyboard state to a focused client component. The two source JPGs enter the existing Xuelang evidence manifest and asset pipeline; screen CSS layers the generated WebP files, while print CSS switches to a separate full-image pair.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest/Testing Library, Playwright, Sharp, print CSS.

---

### Task 1: Add traceable comparison assets

**Files:**
- Create: `evidence/xuelang/source/learning-before-board.jpg`
- Create: `evidence/xuelang/source/learning-after-board.jpg`
- Modify: `evidence/xuelang/manifest.json`
- Generate: `public/images/xuelang/learning-before-board.webp`
- Generate: `public/images/xuelang/learning-after-board.webp`
- Test: `tests/unit/xuelang-assets.test.ts`

- [ ] **Step 1: Write the failing asset expectations**

Add assertions that the manifest contains `learning-before-board` and `learning-after-board`, both in chapter `06`, both with intrinsic size `1662 × 1080`, and both with unique generated WebP outputs.

- [ ] **Step 2: Run the asset test and verify RED**

Run: `npm test -- tests/unit/xuelang-assets.test.ts`

Expected: FAIL because the two IDs do not exist.

- [ ] **Step 3: Add source files and manifest records**

Copy the supplied JPGs without modifying them. Add two records using the complete source bounds and a common target size:

```json
{
  "id": "learning-before-board",
  "chapter": "06",
  "sourceFrames": ["portfolio-supplied-old-board"],
  "sourcePaths": ["evidence/xuelang/source/learning-before-board.jpg"],
  "output": "public/images/xuelang/learning-before-board.webp",
  "format": "webp",
  "crop": { "left": 0, "top": 0, "width": 3324, "height": 2160 },
  "intrinsic": { "width": 1662, "height": 1080 },
  "purpose": "Provide the complete previous product board for the interactive learning-experience comparison.",
  "alt": { "zh": "改版前以内容交付为主的学浪产品界面集合", "en": "Previous Xuelang interface collection centered on content delivery" },
  "replacementPath": "figma://portfolio-supplied/learning-before-board"
}
```

Create the matching `learning-after-board` record with the new-board source, output, purpose, and alt text.

- [ ] **Step 4: Generate derivatives and verify GREEN**

Run: `npm run prepare:xuelang && npm test -- tests/unit/xuelang-assets.test.ts`

Expected: both commands exit 0 and Sharp reports both derivatives at `1662 × 1080`.

### Task 2: Build the accessible wipe control

**Files:**
- Create: `components/xuelang/xuelang-wipe-comparison.tsx`
- Create: `components/xuelang/xuelang-wipe-comparison.module.css`
- Create: `tests/component/xuelang-wipe-comparison.test.tsx`

- [ ] **Step 1: Write failing component tests**

Render the control with localized labels and assert:

```tsx
expect(screen.getByRole('slider', { name: '拖动比较旧版与新版' }))
  .toHaveAttribute('aria-valuenow', '38');
fireEvent.keyDown(slider, { key: 'ArrowRight' });
expect(slider).toHaveAttribute('aria-valuenow', '41');
fireEvent.keyDown(slider, { key: 'Home' });
expect(slider).toHaveAttribute('aria-valuenow', '4');
fireEvent.keyDown(slider, { key: 'End' });
expect(slider).toHaveAttribute('aria-valuenow', '96');
```

Also assert that both full images and both caption texts remain in the DOM for print.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- tests/component/xuelang-wipe-comparison.test.tsx`

Expected: FAIL because the component module does not exist.

- [ ] **Step 3: Implement the minimum interaction**

Create a client component that stores `position` with initial value `38`, clamps it to `4..96`, maps pointer coordinates through `getBoundingClientRect()`, and handles `ArrowLeft`, `ArrowRight`, `Home`, and `End`. Expose position through `aria-valuenow` and CSS custom property `--wipe-position`.

- [ ] **Step 4: Implement the approved visual treatment**

Layer the new image as the base and clip the old image from the right. Add a 1px divider, 48px handle, top-corner labels, and a two-column caption row. Keep `aspect-ratio: 3324 / 2160`, `touch-action: none`, a visible focus state, and a 44px minimum mobile hit area.

- [ ] **Step 5: Run the component test and verify GREEN**

Run: `npm test -- tests/component/xuelang-wipe-comparison.test.tsx`

Expected: PASS with no warnings.

### Task 3: Integrate localized content and print fallback

**Files:**
- Modify: `components/xuelang/xuelang-evidence.tsx`
- Modify: `components/xuelang/xuelang-evidence.module.css`
- Modify: `components/xuelang/xuelang-print.css`
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`
- Modify: `tests/component/xuelang-layout.test.tsx`

- [ ] **Step 1: Write failing integration assertions**

Update the layout test to require one slider at value `38`, the two new image URLs, and one `[data-wipe-print-pair]` containing two complete images.

- [ ] **Step 2: Run the integration test and verify RED**

Run: `npm test -- tests/component/xuelang-layout.test.tsx`

Expected: FAIL because the static comparison still renders two `XuelangFigure` instances.

- [ ] **Step 3: Connect the new component**

Pass `before`, `after`, localized control labels, and unchanged title through `XuelangDarkComparison`. Update both MDX files to use `/images/xuelang/learning-before-board.webp` and `/images/xuelang/learning-after-board.webp` at `1662 × 1080`.

- [ ] **Step 4: Add print-only complete evidence**

Hide `[data-wipe-interactive]` in print and show `[data-wipe-print-pair]` as `grid-template-columns: 1fr 1fr`. Cap each full image at the existing comparison print height without clipping.

- [ ] **Step 5: Run integration tests and verify GREEN**

Run: `npm test -- tests/component/xuelang-layout.test.tsx tests/unit/xuelang-content.test.ts`

Expected: PASS and both locales reference the new assets.

### Task 4: Verify browser behavior and exported evidence

**Files:**
- Modify: `tests/e2e/xuelang.spec.ts`
- Modify: `tests/e2e/xuelang.visual.spec.ts`
- Regenerate: `public/files/xuelang-case-study-zh.pdf`
- Regenerate: `public/files/xuelang-case-study-en.pdf`

- [ ] **Step 1: Write the failing browser interaction**

Add a desktop test that focuses the comparison slider, presses `ArrowRight`, verifies `aria-valuenow="41"`, drags toward 70%, and verifies the value changes while the page remains horizontally contained.

- [ ] **Step 2: Run the focused E2E test and verify RED**

Run: `npx playwright test tests/e2e/xuelang.spec.ts --project=desktop --grep "wipe comparison"`

Expected: FAIL before the integrated slider exists.

- [ ] **Step 3: Run visual and functional verification**

Run:

```bash
npm run lint
npm test
npx playwright test tests/e2e/xuelang.spec.ts tests/e2e/xuelang.visual.spec.ts
npm run build:framework
```

Expected: all commands exit 0 with no test failures.

- [ ] **Step 4: Inspect the live page with agent-browser**

At 1440 × 1000, capture the comparison before and after dragging. Confirm labels, handle, divider, captions, and image content do not overlap and that the new version owns the larger initial area.

- [ ] **Step 5: Regenerate and verify bilingual PDFs**

Run: `node scripts/generate-xuelang-pdfs.mjs && npm run verify:xuelang-pdf`

Expected: both PDFs are A4, remain within the accepted page-count range, contain verified text, and render both complete comparison boards side by side.
