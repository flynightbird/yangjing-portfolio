# Growth Base Visibility Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the unclaimed tent legible, fully cover the third film's top-left watermark, and remove the portfolio site header from the Growth Base mobile experience.

**Architecture:** Keep all behavior in the existing Growth Base and site-header components. Expose explicit `data-film-id` and `data-mobile-visibility` state to CSS so the visual exceptions stay narrowly scoped and testable without changing other portfolio routes.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Vitest, Testing Library, Playwright

---

### Task 1: Lock The Three Visibility Requirements With Failing Tests

**Files:**
- Modify: `tests/unit/growth-base-styles.test.ts`
- Modify: `tests/component/growth-base-case.test.tsx`
- Modify: `tests/component/site-header.test.tsx`
- Modify: `tests/e2e/growth-base.spec.ts`

- [ ] **Step 1: Add a CSS test for the tent and third-film mask**

Add expectations that require the ready-state tent to use `opacity: 1`, retain the shared `2.2rem` mask, and add a `3.2rem` mask only under `.film[data-film-id='meal-prep']`.

```ts
it('keeps the ready tent opaque and enlarges only the meal-prep watermark mask', async () => {
  const css = await readFile(stylesheetPath, 'utf8');

  expect(css).toMatch(/\.tentAsset\s*\{[\s\S]*opacity:\s*1/);
  expect(css).toMatch(/\.watermarkMask\s*\{[\s\S]*height:\s*2\.2rem/);
  expect(css).toMatch(/\.film\[data-film-id='meal-prep'\]\s+\.watermarkMask\s*\{[\s\S]*height:\s*3\.2rem/);
});
```

- [ ] **Step 2: Add component tests for film identity and route-specific header state**

Require the meal-prep figure to expose its film id and the Growth Base header to opt out on mobile without changing other routes.

```ts
expect(container.querySelector('[data-film-id="meal-prep"]')).toBeVisible();

navigationMocks.pathname = '/zh/work/growth-base/';
render(<SiteHeader locale="zh" />);
expect(screen.getByRole('banner')).toHaveAttribute('data-mobile-visibility', 'hidden');
```

Also assert the home header has `data-mobile-visibility="visible"`.

- [ ] **Step 3: Extend the mobile browser test**

Add this assertion before checking the prototype viewport:

```ts
await expect(page.getByRole('banner')).toBeHidden();
```

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/unit/growth-base-styles.test.ts tests/component/growth-base-case.test.tsx tests/component/site-header.test.tsx
```

Expected: FAIL because the tent still has `opacity: 0.22`, the meal-prep figure has no film id or taller mask, and the header has no mobile visibility state.

### Task 2: Implement The Narrow Visibility States

**Files:**
- Modify: `components/growth-base/growth-base-video-grid.tsx`
- Modify: `components/growth-base/growth-base.module.css`
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`

- [ ] **Step 1: Identify each film in the rendered markup**

Add the film id to its figure:

```tsx
<figure
  className={styles.film}
  data-film-id={film.id}
  data-testid="growth-base-film"
  key={film.id}
>
```

- [ ] **Step 2: Make the tent opaque and enlarge only the third mask**

Change the base tent opacity and add the scoped mask override:

```css
.tentAsset {
  opacity: 1;
}

.film[data-film-id='meal-prep'] .watermarkMask {
  height: 3.2rem;
}
```

Keep the shared `.watermarkMask` height at `2.2rem`.

- [ ] **Step 3: Mark the Growth Base header as hidden on mobile**

Inside `SiteHeader`, derive route state and expose it on the existing header:

```tsx
const hideOnMobile = /^\/(?:en|zh)\/work\/growth-base\/?$/.test(pathname);

<header
  className={styles.root}
  data-mobile-visibility={hideOnMobile ? 'hidden' : 'visible'}
  data-scrolled={scrolled ? 'true' : 'false'}
  data-surface={sectionSurface ?? resolveHeaderSurface(pathname)}
>
```

- [ ] **Step 4: Hide only the marked header below the Growth Base breakpoint**

Add inside `@media (max-width: 767px)`:

```css
.root[data-mobile-visibility='hidden'] {
  display: none;
}
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/unit/growth-base-styles.test.ts tests/component/growth-base-case.test.tsx tests/component/site-header.test.tsx
```

Expected: all focused tests pass.

### Task 3: Verify The Real Page And Integrate

**Files:**
- Verify: `tests/e2e/growth-base.spec.ts`

- [ ] **Step 1: Run the Growth Base browser suite**

Run:

```bash
PW_PORT=54067 PW_REUSE_SERVER=1 npx playwright test tests/e2e/growth-base.spec.ts
```

Expected: desktop and mobile Growth Base tests pass; viewport-specific cases remain skipped.

- [ ] **Step 2: Inspect desktop ready-state and third-film playback**

At `1440 × 900`, verify the ready tent is fully opaque. Play the third film through the interval where the watermark moves to the top-left and confirm the taller blur covers it without covering the caption.

- [ ] **Step 3: Inspect the mobile route**

At `390 × 844`, verify the site header is hidden, the interactive prototype remains `390px` wide, and the embedded app is not compressed.

- [ ] **Step 4: Run completion checks**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: test suite, lint, build, and diff checks pass, with only documented pre-existing lint warnings allowed.

- [ ] **Step 5: Commit and merge**

```bash
git add components/growth-base/growth-base-video-grid.tsx components/growth-base/growth-base.module.css components/shell/site-header.tsx components/shell/site-header.module.css tests/unit/growth-base-styles.test.ts tests/component/growth-base-case.test.tsx tests/component/site-header.test.tsx tests/e2e/growth-base.spec.ts docs/superpowers/plans/2026-08-06-growth-base-visibility-fixes.md
git commit -m "fix: clarify growth base reward visibility"
```

Fast-forward `codex/growth-base-portfolio` into `main` only after confirming the existing dirty `main` files do not overlap these paths.
