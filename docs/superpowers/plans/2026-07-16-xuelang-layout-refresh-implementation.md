# Xuelang Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the Xuelang case-study hero and chapter layouts for a more cinematic desktop experience while removing cramped evidence and excessive whitespace.

**Architecture:** Keep the existing MDX content and React component boundaries. Add only semantic layout hooks where CSS cannot reliably distinguish content variants, then implement the refresh in the Xuelang CSS modules with desktop-first breakpoints and explicit compact fallbacks.

**Tech Stack:** Next.js 16, React 19, CSS Modules, MDX, Vitest, Playwright, GSAP

---

### Task 1: Lock The New Layout Contract

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/e2e/xuelang.visual.spec.ts`

- [ ] **Step 1: Add failing component assertions**

Assert that the hero exposes separate thesis and supporting-information hooks, the text-only learning state exposes a compact-state hook, and the fourth result metric exposes a summary-row hook.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- tests/component/xuelang-layout.test.tsx`

Expected: FAIL because the new semantic hooks are not rendered.

- [ ] **Step 3: Add failing visual contract assertions**

For desktop viewports, assert that the panorama has at least `220px` visible in the first viewport, section headings and adjacent reading blocks do not overlap, and the fourth result metric spans at least `80%` of the case canvas.

- [ ] **Step 4: Run the focused visual test and verify RED**

Run: `npx playwright test tests/e2e/xuelang.visual.spec.ts --project=desktop --grep "en desktop-1440"`

Expected: FAIL on the first-viewport panorama or full-width summary-row assertion.

### Task 2: Add Semantic Layout Hooks

**Files:**
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-evidence.tsx`

- [ ] **Step 1: Mark the hero thesis and supporting information**

Wrap the title in a thesis container and group proposition, facts, and PDF action in a supporting container, preserving source order and accessible semantics.

- [ ] **Step 2: Mark compact learning and summary result states**

Add `data-learning-compact` only when a learning state has no image. Add `data-result-summary` only to the last metric when exactly four result metrics are supplied.

- [ ] **Step 3: Run component tests and verify GREEN**

Run: `npm test -- tests/component/xuelang-layout.test.tsx tests/component/xuelang-contact.test.tsx`

Expected: PASS.

### Task 3: Recompose The Hero And Chapter Grid

**Files:**
- Modify: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Build the large-desktop two-zone hero**

At `min-width: 1200px`, make `.heroCopy` a ten-column grid, place the eyebrow full width, place the thesis in columns `1 / span 6`, place supporting information in columns `7 / -1`, and keep the panorama full width below.

- [ ] **Step 2: Recompose chapter introductions**

At `min-width: 1101px`, place `.section-heading` in columns `1 / span 6` and `.xuelang-reading` in columns `7 / -1`, aligned near the top. Keep other section children on their existing full-width or explicit grids.

- [ ] **Step 3: Normalize vertical rhythm**

Replace width-driven section padding with `clamp(6rem, 12vh, 8rem)` and tune internal margins so chapter openings read as one composition rather than stacked blocks.

- [ ] **Step 4: Move the compact layout breakpoint**

Change Xuelang layout collapse rules from `900px` to `1100px`, preserving the narrower mobile rules at `520px`.

### Task 4: Rebalance Evidence And Results

**Files:**
- Modify: `components/xuelang/xuelang-evidence.module.css`
- Modify: `components/xuelang/xuelang-contact.module.css`

- [ ] **Step 1: Rebalance evidence pairs**

Use `7/5` columns for primary pairs with top alignment, and use `5/7` columns for the experiment pair.

- [ ] **Step 2: Remove artificial learning whitespace**

Use intrinsic height for all learning states and a compact padding rhythm for `[data-learning-compact]`. Keep image states separated by enough space to preserve the pinned narrative.

- [ ] **Step 3: Create the result summary row**

Make `[data-result-summary]` span all three metric columns and use a two-column value/description layout. Reduce only the summary value scale where needed; preserve the first three metrics as the visual peak.

- [ ] **Step 4: Align compact breakpoints**

Move evidence and contact layout collapse rules to `1100px` where the desktop composition would otherwise become cramped.

### Task 5: Verify Visual And Behavioral Stability

**Files:**
- Modify: `tests/e2e/xuelang.visual.spec.ts` only if measurements reveal a test threshold that does not match the approved design

- [ ] **Step 1: Run focused component and E2E tests**

Run: `npm test -- tests/component/xuelang-layout.test.tsx tests/component/xuelang-contact.test.tsx`

Run: `npx playwright test tests/e2e/xuelang.visual.spec.ts tests/e2e/xuelang.spec.ts --project=desktop`

Expected: PASS with no overlap, overflow, interaction, or layout-contract failures.

- [ ] **Step 2: Capture the visual matrix**

Use `agent-browser` at `1024x768`, `1280x800`, `1440x900`, and `1728x1100`. Capture the hero, standard evidence, learning sequence, and results. Confirm English and Chinese wrapping remains intentional.

- [ ] **Step 3: Run publication checks**

Run: `npm run lint`

Run: `npm test`

Run: `npm run build`

Run: `npm run verify:xuelang-pdf`

Expected: all commands exit `0`.

- [ ] **Step 4: Request independent code review**

Provide the reviewer with the design spec, implementation plan, base SHA, head SHA or working-tree diff, and the requirement to prioritize overlap, breakpoint regressions, print isolation, and test gaps. Resolve all Critical and Important findings before completion.
