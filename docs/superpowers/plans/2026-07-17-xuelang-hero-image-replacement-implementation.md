# Xuelang Hero Image Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Xuelang case-study Hero's four product screens with the approved supplied screenshots while preserving the existing overlapping desktop composition.

**Architecture:** Four source PNGs are preserved under `evidence/xuelang/source`, declared as independent chapter-00 assets in the Xuelang manifest, and converted by the existing Sharp pipeline into public WebP derivatives. `XuelangLayout` references only those Hero-specific derivatives, leaving evidence used by later sections untouched.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Sharp, Vitest, Playwright

---

### Task 1: Lock The New Hero Contract With Failing Tests

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/unit/xuelang-assets.test.ts`

- [ ] **Step 1: Replace the expected Hero image sequence**

Update the component assertion to expect:

```ts
[
  '/images/xuelang/hero-discover.webp',
  '/images/xuelang/hero-decide.webp',
  '/images/xuelang/hero-learn.webp',
  '/images/xuelang/hero-retain.webp',
]
```

- [ ] **Step 2: Add a manifest contract assertion**

Add a test that finds the four IDs `hero-discover`, `hero-decide`, `hero-learn`, and `hero-retain`, then asserts their output paths and source paths match the approved mapping.

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```bash
npx vitest run tests/component/xuelang-layout.test.tsx tests/unit/xuelang-assets.test.ts
```

Expected: FAIL because the layout and manifest still expose the old Hero assets.

### Task 2: Add And Connect The Hero Assets

**Files:**
- Create: `evidence/xuelang/source/hero-discover.png`
- Create: `evidence/xuelang/source/hero-decide.png`
- Create: `evidence/xuelang/source/hero-learn.png`
- Create: `evidence/xuelang/source/hero-retain.png`
- Create: `public/images/xuelang/hero-discover.webp`
- Create: `public/images/xuelang/hero-decide.webp`
- Create: `public/images/xuelang/hero-learn.webp`
- Create: `public/images/xuelang/hero-retain.webp`
- Modify: `evidence/xuelang/manifest.json`
- Modify: `components/xuelang/xuelang-layout.tsx`

- [ ] **Step 1: Preserve the supplied source files**

Copy the four approved PNGs into `evidence/xuelang/source` using the semantic names above. Preserve their native dimensions: `896x1941`, `896x1941`, `897x1942`, and `904x1958`.

- [ ] **Step 2: Register four chapter-00 manifest records**

Each record uses the full source rectangle, matching intrinsic dimensions, WebP output, a specific purpose and bilingual alt text, and a `figma://portfolio-supplied/xuelang-hero-*` replacement reference.

- [ ] **Step 3: Generate optimized WebP derivatives**

Run:

```bash
npm run prepare:xuelang
```

Expected: the existing pipeline reports all Xuelang assets prepared and creates the four new WebP files at manifest dimensions.

- [ ] **Step 4: Update the bilingual Hero state data**

Use the four new paths in `XuelangLayout`. Update the visual labels to `01 / DISCOVER`, `02 / DECIDE`, `03 / LEARN`, and `04 / RETAIN`; provide state-specific English and Chinese alternative text.

- [ ] **Step 5: Run the focused tests and verify success**

Run:

```bash
npx vitest run tests/component/xuelang-layout.test.tsx tests/unit/xuelang-assets.test.ts
```

Expected: both test files pass.

### Task 3: Verify The Desktop-First Composition And Publish

**Files:**
- Modify only if visual evidence requires it: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Inspect the Hero at target widths**

Capture `/zh/work/xuelang/` at `1440x1000` and `1728x1100`. Confirm all four screens load, the top content is visible, overlap matches option A, labels remain legible, and no panel escapes the panorama.

- [ ] **Step 2: Check representative mobile containment**

Inspect at `390x844`. Confirm there is no horizontal overflow, incoherent overlap, or clipped state label. Do not reduce desktop panel scale to optimize mobile.

- [ ] **Step 3: Run repository verification**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: lint, the complete Vitest suite, publication validation, and the production build pass.

- [ ] **Step 4: Commit the scoped implementation**

```bash
git add components/xuelang/xuelang-layout.tsx components/xuelang/xuelang-layout.module.css evidence/xuelang/manifest.json evidence/xuelang/source/hero-*.png public/images/xuelang/hero-*.webp tests/component/xuelang-layout.test.tsx tests/unit/xuelang-assets.test.ts
git commit -m "feat: replace Xuelang hero product screens"
```

- [ ] **Step 5: Push and confirm the local preview**

Push `codex/xuelang-case-polish` to `origin`, verify the remote head matches local `HEAD`, and confirm `http://127.0.0.1:4173/zh/work/xuelang/` returns `200` with the four new asset paths.
