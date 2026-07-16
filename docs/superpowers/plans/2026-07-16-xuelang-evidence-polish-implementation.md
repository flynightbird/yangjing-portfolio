# Xuelang Evidence And Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the Xuelang case evidence from focused Figma UI exports, repair tablet navigation and accessibility defects, and refine the bilingual editorial composition.

**Architecture:** Keep the current MDX narrative and Xuelang shell. Extend the evidence component family with a reusable annotated product-story composition, add a hero proof hook, and use CSS Modules for desktop-first art direction. Source exports remain traceable in `evidence/`; optimized derivatives are served from `public/`.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, CSS Modules, Sharp, Vitest, Playwright, GSAP

---

### Task 1: Lock The New Contracts

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/e2e/xuelang.visual.spec.ts`
- Modify: `tests/e2e/xuelang.spec.ts`

- [x] Add component assertions for the hero proof, annotated evidence stories, persistent expand cue, and PDF size label.
- [x] Run `npm test -- tests/component/xuelang-layout.test.tsx` and confirm the new assertions fail for missing output.
- [x] Add browser assertions for localized titles, the sticky 1024px chapter overlay, and reconstructed evidence width.
- [x] Run the focused Playwright cases and confirm they fail for the missing behavior.

### Task 2: Prepare Traceable Figma Evidence

**Files:**
- Create: `evidence/xuelang/figma/*.png`
- Create: `public/images/xuelang/quality-detail-ui.webp`
- Create: `public/images/xuelang/purchase-*.webp`
- Create: `public/images/xuelang/learning-*.webp`
- Create: `docs/xuelang-image-replacement-guide.md`
- Modify: `evidence/xuelang/manifest.json`

- [x] Preserve the six source exports from the approved Figma nodes.
- [x] Use Sharp to convert independent nodes and crop the three notes states without rasterized explanatory text.
- [x] Record Figma node IDs, crop bounds, output dimensions, intended placement, and replacement instructions.
- [x] Run asset tests and inspect all derivatives for clipping, softness, and unintended transparency.

### Task 3: Implement Evidence And Hero Components

**Files:**
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-evidence.tsx`
- Modify: `components/case-study/evidence-figure.tsx`

- [x] Render the verified proof in the hero facts and disclose the PDF size in the action label.
- [x] Add a typed `XuelangEvidenceStory` composition for one dominant product image plus localized annotations and optional supporting states.
- [x] Add an always-visible expand icon and localized cue to every evidence trigger.
- [x] Run the focused component tests and confirm they pass.

### Task 4: Recompose Bilingual Content

**Files:**
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`

- [x] Replace the quality, purchase, learning, and result presentation boards with focused evidence stories.
- [x] Keep all explanatory text in localized MDX and all verified metrics in HTML.
- [x] Shorten the English strategy thesis without changing the Chinese thesis.
- [x] Run `npm test -- tests/unit/xuelang-content.test.ts tests/component/xuelang-layout.test.tsx`.

### Task 5: Refine Layout, Contrast, Navigation, And Metadata

**Files:**
- Modify: `components/xuelang/xuelang-layout.module.css`
- Modify: `components/xuelang/xuelang-evidence.module.css`
- Modify: `components/case-study/chapter-nav.module.css`
- Modify: `components/case-study/evidence-figure.module.css`
- Modify: `app/(localized)/[locale]/work/[slug]/page.tsx`

- [x] Implement the evidence-track layouts and English-only strategy scale.
- [x] Make the compact rail sticky and its navigation an anchored overlay.
- [x] Replace low-contrast labels with accessible green and dark-stage blue values.
- [x] Generate localized work-page metadata from content entries.
- [x] Run focused component and Playwright tests until green.

### Task 6: Visual Review And Publication Verification

**Files:**
- Modify only files implicated by verified defects.

- [x] Start the production-like local server and capture the approved viewport matrix in both locales.
- [x] Inspect hero framing, chapter rhythm, image legibility, overlap, clipping, sticky navigation, lightbox focus, and result ending.
- [ ] Run `npm run lint`, `npm test`, `npm run build`, and `npm run verify:xuelang-pdf`. (`build:framework` passes; the publication gate remains blocked by repository-level missing launch assets.)
- [x] Review the final working-tree diff against the design specification and resolve all important findings.
