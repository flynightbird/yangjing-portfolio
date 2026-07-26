# Xuelang Interaction Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the interaction board's baked-in gray background with the approved light green and remove the canvas border and shadow without changing foreground content.

**Architecture:** Recolor only edge-connected pixels close to the source background color `#EBEDEE`, writing the result back as lossless WebP at the existing 3840 x 1876 dimensions. Keep presentation changes isolated to the interaction board CSS and cover them with the existing media-style regression test.

**Tech Stack:** Next.js, CSS Modules, Vitest, Sharp, Playwright/browser computed-style inspection

---

### Task 1: Add Regression Coverage

**Files:**
- Modify: `tests/unit/xuelang-media-styles.test.ts`

- [ ] **Step 1: Add a failing canvas treatment assertion**

Add this test beside the existing interaction media assertions:

```ts
it('renders the interaction canvas without an outer border or shadow', () => {
  expect(interactionCss).toMatch(/\.canvas\s*{[^}]*border:\s*0/s);
  expect(interactionCss).toMatch(/\.canvas\s*{[^}]*box-shadow:\s*none/s);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/unit/xuelang-media-styles.test.ts --testTimeout=30000`

Expected: FAIL because the desktop `.canvas` still declares a one-pixel border and outer shadow.

### Task 2: Recolor the Asset and Simplify the Canvas

**Files:**
- Modify: `public/images/xuelang/learning-interaction.webp`
- Modify: `components/xuelang/xuelang-interaction-board.module.css`

- [ ] **Step 1: Build an edge-connected background mask**

Use Sharp to decode the existing 3840 x 1876 RGB asset. Seed a flood fill from every image-edge pixel. Include a neighboring pixel only when its Euclidean RGB distance from `[235, 237, 238]` is at most 20. Replace included pixels with `[227, 236, 231]` (`#E3ECE7`) and keep all other RGB values unchanged.

- [ ] **Step 2: Export the replacement asset losslessly**

Encode the modified buffer with:

```js
sharp(output, { raw: info })
  .webp({ lossless: true, effort: 6 })
  .toFile('/tmp/learning-interaction.webp');
```

Replace `public/images/xuelang/learning-interaction.webp` only after confirming the output dimensions remain 3840 x 1876.

- [ ] **Step 3: Remove the desktop canvas chrome**

Set the desktop `.canvas` declarations to:

```css
border: 0;
box-shadow: none;
```

Keep `border-radius: var(--xuelang-media-radius)` and the existing responsive rules unchanged.

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- tests/unit/xuelang-media-styles.test.ts tests/component/xuelang-interaction-board.test.tsx --testTimeout=30000`

Expected: PASS.

### Task 3: Verify Visual Output and Repository Health

**Files:**
- Verify: `public/images/xuelang/learning-interaction.webp`
- Verify: `components/xuelang/xuelang-interaction-board.module.css`

- [ ] **Step 1: Verify asset dimensions and corner color**

Decode the asset with Sharp and assert width `3840`, height `1876`, and all four corner RGB samples equal `[227, 236, 231]`.

- [ ] **Step 2: Inspect the local page at desktop width**

Open `http://127.0.0.1:4174/zh/work/xuelang/`, scroll to the interaction section, and confirm the green background, intact foreground, 20px radius, and absence of outer border or shadow.

- [ ] **Step 3: Check computed styles**

Confirm `[data-interaction-board] > div` reports `border-width: 0px`, `box-shadow: none`, and `border-radius: 20px`.

- [ ] **Step 4: Run full verification**

Run: `npm test -- --testTimeout=30000`

Expected: all test files and tests pass with zero failures.

- [ ] **Step 5: Commit the implementation**

Stage only the modified interaction asset, CSS, regression test, and this plan. Exclude `tmp/`.

```bash
git add public/images/xuelang/learning-interaction.webp \
  components/xuelang/xuelang-interaction-board.module.css \
  tests/unit/xuelang-media-styles.test.ts \
  docs/superpowers/plans/2026-07-22-xuelang-interaction-background.md
git commit -m "style: refine Xuelang interaction media"
```
