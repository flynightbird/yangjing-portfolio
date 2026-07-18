# Xuelang Full-width Opening Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Xuelang opening artwork across the full page width without changing the content grid or print output.

**Architecture:** The Xuelang-only `.root` wrapper owns the decorative pseudo-element and the `.frame` remains the foreground layout layer. The `data-xuelang-opening` marker moves to the same full-width wrapper so existing print suppression remains semantic and reliable.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Vitest, Testing Library, agent-browser

---

### Task 1: Move the opening artwork to the page wrapper

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Write the failing wrapper-ownership assertion**

Replace the existing opening-marker assertion with:

```tsx
const xuelangRoot = container.querySelector('[data-xuelang-case]');
expect(xuelangRoot).toHaveAttribute('data-xuelang-opening');
expect(xuelangRoot?.querySelector('[data-case-study]')).toBeInTheDocument();
expect(container.querySelector('[data-case-study]')).not.toHaveAttribute(
  'data-xuelang-opening',
);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npx vitest run tests/component/xuelang-layout.test.tsx --testTimeout=30000
```

Expected: FAIL because `data-xuelang-opening` is still attached to the case-study article.

- [ ] **Step 3: Move the semantic marker to the full-width wrapper**

Update the relevant JSX to:

```tsx
<div className={styles.root} data-xuelang-case data-xuelang-opening>
  <div className={styles.frame}>
    {/* Existing rail and case content remain unchanged. */}
    <article className={styles.case} data-case-study>
```

- [ ] **Step 4: Move the decorative layer from `.case` to `.root`**

Update the CSS ownership and stacking:

```css
.root {
  position: relative;
  overflow-x: clip;
  isolation: isolate;
}

.root::before {
  position: absolute;
  z-index: 0;
  inset: 0 0 auto;
  height: max(100rem, 180vh);
  background: url('/images/xuelang/opening-background.webp') center top / cover no-repeat;
  content: '';
  opacity: 0.2;
  pointer-events: none;
}

.frame {
  position: relative;
  z-index: 1;
}
```

Remove the old `.case` positioning, isolation, and `.case::before` block. Keep `.case, .content { min-width: 0; }` unchanged.

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
npx vitest run tests/component/xuelang-layout.test.tsx --testTimeout=30000
```

Expected: both locale cases and the evidence sequence pass.

- [ ] **Step 6: Verify responsive and print behavior**

Use agent-browser at `1440x1000` and `390x844`. Confirm the root width equals the viewport width, computed `::before` background references `opening-background.webp`, the chapter rail is inside the marked root, and `scrollWidth === innerWidth`. Generate or inspect print output to confirm `[data-xuelang-opening]::before` remains hidden.

- [ ] **Step 7: Run final project checks**

Run:

```bash
npm test -- --testTimeout=30000
npm run lint
npm run build:framework
git diff --check
```

Expected: all tests pass, lint reports no errors, the production build succeeds, and the diff check is empty.

- [ ] **Step 8: Commit the implementation**

```bash
git add tests/component/xuelang-layout.test.tsx components/xuelang/xuelang-layout.tsx components/xuelang/xuelang-layout.module.css
git commit -m "fix: extend Xuelang opening background"
```
