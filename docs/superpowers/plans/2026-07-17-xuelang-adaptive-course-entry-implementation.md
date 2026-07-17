# Xuelang Adaptive Course Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single Course Entry screenshot with an accessible four-state interactive product story while preserving the remaining Continuous Learning sequence.

**Architecture:** A dedicated client component owns localized state data, tab interaction, animation, and print fallback. `XuelangLearningSequence` mounts it through a boolean state flag, while the existing asset manifest preserves three new source screenshots and reuses the higher-resolution Hero Continue asset.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Sharp, Vitest, Testing Library, agent-browser

---

### Task 1: Lock The Interaction And Asset Contracts

**Files:**
- Create: `tests/component/xuelang-course-entry.test.tsx`
- Modify: `tests/unit/xuelang-assets.test.ts`
- Modify: `tests/unit/xuelang-content.test.ts`

- [ ] **Step 1: Write the failing component tests**

Render `<XuelangCourseEntry locale="zh" />` and assert:

```ts
expect(screen.getAllByRole('tab')).toHaveLength(4);
expect(screen.getByRole('tab', { name: /最近正在看课/ })).toHaveAttribute(
  'aria-selected',
  'true',
);
expect(screen.getByRole('tabpanel')).toContainElement(
  screen.getByRole('img', { name: /学习进度与继续学习/ }),
);
```

Add tests that click the Discover tab, use `ArrowRight`, `Home`, and `End`, and verify the active tab, visible panel image, and focus move together. Assert the print grid contains four images and all four localized state names.

- [ ] **Step 2: Write failing asset and content assertions**

Expect manifest records for:

```ts
[
  ['course-entry-discover', 'course-entry-discover.webp'],
  ['course-entry-start', 'course-entry-start.webp'],
  ['course-entry-live', 'course-entry-live.webp'],
]
```

Update the learning-section content test to require those three paths plus `hero-learn.webp`, and to reject `learning-entry-ui.webp` from the Course Entry state.

- [ ] **Step 3: Run tests and verify RED**

Run:

```bash
npx vitest run tests/component/xuelang-course-entry.test.tsx tests/unit/xuelang-assets.test.ts tests/unit/xuelang-content.test.ts
```

Expected: FAIL because the component, manifest records, and content paths do not exist yet.

### Task 2: Build And Integrate The Four-State Component

**Files:**
- Create: `components/xuelang/xuelang-course-entry.tsx`
- Create: `components/xuelang/xuelang-course-entry.module.css`
- Modify: `components/xuelang/xuelang-evidence.tsx`
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`
- Modify: `components/xuelang/xuelang-print.css`

- [ ] **Step 1: Implement localized state data and tab behavior**

Create `XuelangCourseEntry({ locale })` with state IDs `discover`, `start`, `continue`, and `live`. Default to index `2`. Use one tablist, four tab buttons, one keyed interactive panel, and a four-item print grid. Arrow keys wrap, while Home and End select the first and last state.

- [ ] **Step 2: Implement the approved desktop-first layout**

Use a stable dark main stage and a four-item right rail. The active rail item uses `#466b52`; the main phone uses `object-fit: cover` with top-center positioning. At narrow widths, move the tabs into a horizontal row above the stage. Add a `220ms` opacity/translate entrance and remove translation under `prefers-reduced-motion`.

- [ ] **Step 3: Mount the component in Course Entry only**

Extend `LearningState` with:

```ts
readonly courseEntry?: boolean;
```

Render `<XuelangCourseEntry locale={locale} />` when true. Replace the first state's `image` object in both locale MDX files with `courseEntry: true`; update its description to explain adaptive entry behavior. Leave states 02 through 05 unchanged.

- [ ] **Step 4: Add the static print layout**

Hide the interactive stage and show the print grid as two columns. Constrain each screenshot height with `object-fit: contain`, retain state labels and strategy copy, and keep the grid together where page space allows.

### Task 3: Add Evidence Assets And Reach GREEN

**Files:**
- Create: `evidence/xuelang/source/course-entry-discover.png`
- Create: `evidence/xuelang/source/course-entry-start.png`
- Create: `evidence/xuelang/source/course-entry-live.png`
- Create: `public/images/xuelang/course-entry-discover.webp`
- Create: `public/images/xuelang/course-entry-start.webp`
- Create: `public/images/xuelang/course-entry-live.webp`
- Modify: `evidence/xuelang/manifest.json`

- [ ] **Step 1: Preserve the three non-duplicate source files**

Copy the supplied images with native dimensions: Discover `621x1343`, Start `621x1345`, and Live `621x1345`. Reuse `evidence/xuelang/source/hero-learn.png` for Continue.

- [ ] **Step 2: Register and generate derivatives**

Add chapter-06 manifest records using full-image crops and intrinsic dimensions. Run:

```bash
npm run prepare:xuelang
```

Restore any unrelated existing derivatives changed by the full generator, retaining only the three new outputs.

- [ ] **Step 3: Run focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/component/xuelang-course-entry.test.tsx tests/component/xuelang-layout.test.tsx tests/unit/xuelang-assets.test.ts tests/unit/xuelang-content.test.ts
```

Expected: all focused tests pass, including four tabs, Continue default, keyboard navigation, print evidence, manifest traceability, and five unchanged learning steps.

### Task 4: Verify Visual Quality And Branch Health

**Files:**
- Modify only when browser evidence requires it: `components/xuelang/xuelang-course-entry.module.css`

- [ ] **Step 1: Inspect desktop behavior with agent-browser**

At `1440x1000` and `1728x1100`, verify the Course Entry state exposes one readable main screen plus four persistent controls, switches without layout movement, and does not overlap the chapter rail or adjacent steps.

- [ ] **Step 2: Inspect mobile and print containment**

At `390x844`, verify the tab row scrolls within the component and the document has no horizontal overflow. Emulate print or inspect print markup to confirm four static states remain available.

- [ ] **Step 3: Run final verification**

Run lint, the Vitest suite with publication validation isolated if required, and `npm run build:framework`. Record any unrelated publication-input blocker separately from this implementation.

- [ ] **Step 4: Commit the implementation**

Stage only the new component, styles, three source images and derivatives, manifest, localized MDX, print CSS, evidence integration, and tests. Commit with:

```bash
git commit -m "feat: add adaptive Xuelang course entry"
```

- [ ] **Step 5: Refresh the local HTML**

Keep `codex/xuelang-case-polish` unmerged, restart `http://127.0.0.1:4173/zh/work/xuelang/`, and confirm the page and all four state assets return `200`.
