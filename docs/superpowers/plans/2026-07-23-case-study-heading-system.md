# Case Study Heading System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply one role-based heading hierarchy to the portfolio's core case studies, verify Web and PDF behavior, and synchronize the completed change into the currently clean worktrees without touching Convo AI.

**Architecture:** Semantic case-study tokens live in `app/globals.css`; shared and custom layouts map selectors to those roles while retaining case-specific fonts, colors, and composition. Compatibility aliases prevent deferred branches from changing accidentally. Implementation is completed and verified on `codex/shared/case-heading-system`, then merged into the three clean destination branches.

**Tech Stack:** Next.js 16, React 19, CSS Modules, MDX, Vitest, Playwright, static PDF print CSS, Git worktrees

---

## File Map

- `app/globals.css`: canonical Web and print tokens, compatibility aliases, shared rhythm tokens.
- `components/case-study/case-layout.module.css`: shared role mapping for Call Agent and STT Demo.
- `components/case-study/print.css`: shared PDF role mapping and print overrides.
- `components/meeting/meeting-layout.module.css`: Meeting project, chapter, and default card-title mapping.
- `components/meeting/meeting-evidence.module.css`: Meeting narrative/module-title mapping.
- `components/meeting/meeting-models.module.css`: Meeting media and card-title mapping.
- `components/meeting/meeting-print.css`: Meeting print containment without redefining the shared scale.
- `components/xuelang/xuelang-layout.module.css`: Xuelang project, chapter, narrative, and card-title mapping.
- `components/xuelang/xuelang-evidence.module.css`: Xuelang narrative/module-title mapping.
- `components/xuelang/xuelang-course-entry.module.css`: Xuelang media-title mapping.
- `components/xuelang/xuelang-print.css`: Xuelang print selectors mapped to shared fixed-point tokens.
- `tests/unit/portfolio-detail-system.test.ts`: source-level contract for token values and role mappings.
- `tests/unit/xuelang-course-entry-styles.test.ts`: Xuelang screen and print media-title contract.
- `tests/e2e/portfolio-detail-system.spec.ts`: computed-style and responsive-browser regression checks.

### Task 1: Define The Semantic Heading Tokens

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts:24-44`
- Modify: `app/globals.css:93-101`

- [ ] **Step 1: Replace the legacy-token test with the semantic token contract**

```ts
it('defines the approved role-based case-study heading hierarchy', () => {
  const css = read('app/globals.css');

  const expected = [
    ['project', 'clamp(2.5rem, 4.03vw, 3.625rem)', '1.06', '18ch'],
    ['chapter', 'clamp(2.125rem, 3.47vw, 3.125rem)', '1.12', '20ch'],
    ['narrative', 'clamp(1.75rem, 2.5vw, 2.25rem)', '1.18', '22ch'],
    ['media', 'clamp(1.375rem, 2.01vw, 1.8125rem)', '1.16', '18ch'],
    ['card', 'clamp(1.125rem, 1.53vw, 1.375rem)', '1.35', '28ch'],
  ] as const;

  for (const [role, size, leading, width] of expected) {
    expect(css).toContain(`--case-${role}-title-size: ${size}`);
    expect(css).toContain(`--case-${role}-title-weight: 600`);
    expect(css).toContain(`--case-${role}-title-leading: ${leading}`);
    expect(css).toContain(`--case-${role}-title-max: ${width}`);
  }

  expect(css).toContain('--case-index-title-gap: 0.75rem');
  expect(css).toContain('--case-title-body-gap: 1.5rem');
  expect(css).toContain('--case-h1-size: var(--case-project-title-size)');
  expect(css).toContain('--case-h2-size: var(--case-chapter-title-size)');
  expect(css).toContain('--case-h3-size: var(--case-card-title-size)');

  const print = css.slice(css.indexOf('@media print'));
  expect(print).toContain('--case-project-title-size: 31pt');
  expect(print).toContain('--case-chapter-title-size: 24pt');
  expect(print).toContain('--case-narrative-title-size: 18pt');
  expect(print).toContain('--case-media-title-size: 14pt');
  expect(print).toContain('--case-card-title-size: 11pt');
});
```

- [ ] **Step 2: Run the focused test and verify it fails on missing semantic tokens**

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts`

Expected: FAIL in `defines the approved role-based case-study heading hierarchy` because `--case-project-title-size` is absent.

- [ ] **Step 3: Replace the legacy global token block with semantic tokens and compatibility aliases**

```css
  --case-project-title-size: clamp(2.5rem, 4.03vw, 3.625rem);
  --case-project-title-weight: 600;
  --case-project-title-leading: 1.06;
  --case-project-title-max: 18ch;
  --case-chapter-title-size: clamp(2.125rem, 3.47vw, 3.125rem);
  --case-chapter-title-weight: 600;
  --case-chapter-title-leading: 1.12;
  --case-chapter-title-max: 20ch;
  --case-narrative-title-size: clamp(1.75rem, 2.5vw, 2.25rem);
  --case-narrative-title-weight: 600;
  --case-narrative-title-leading: 1.18;
  --case-narrative-title-max: 22ch;
  --case-media-title-size: clamp(1.375rem, 2.01vw, 1.8125rem);
  --case-media-title-weight: 600;
  --case-media-title-leading: 1.16;
  --case-media-title-max: 18ch;
  --case-card-title-size: clamp(1.125rem, 1.53vw, 1.375rem);
  --case-card-title-weight: 600;
  --case-card-title-leading: 1.35;
  --case-card-title-max: 28ch;
  --case-index-title-gap: 0.75rem;
  --case-title-body-gap: 1.5rem;

  --case-h1-size: var(--case-project-title-size);
  --case-h1-weight: var(--case-project-title-weight);
  --case-h1-leading: var(--case-project-title-leading);
  --case-h2-size: var(--case-chapter-title-size);
  --case-h2-weight: var(--case-chapter-title-weight);
  --case-h2-leading: var(--case-chapter-title-leading);
  --case-h3-size: var(--case-card-title-size);
  --case-h3-weight: var(--case-card-title-weight);
  --case-h3-leading: var(--case-card-title-leading);
```

- [ ] **Step 4: Add fixed-point print values to `app/globals.css`**

```css
@media print {
  :root {
    --case-project-title-size: 31pt;
    --case-chapter-title-size: 24pt;
    --case-narrative-title-size: 18pt;
    --case-media-title-size: 14pt;
    --case-card-title-size: 11pt;
  }
}
```

- [ ] **Step 5: Run the token test and commit**

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts`

Expected: PASS for the semantic token contract; any existing unrelated assertion in this file must remain unchanged and pass.

```bash
git add app/globals.css tests/unit/portfolio-detail-system.test.ts
git commit -m "style: define semantic case heading tokens"
```

### Task 2: Map The Shared Case Layout

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts:46-73`
- Modify: `components/case-study/case-layout.module.css:39-47,122-147,284-291`
- Modify: `components/case-study/print.css:35-56`

- [ ] **Step 1: Add failing shared-layout mapping assertions**

Delete the old `it.each(... consumes shared editorial heading tokens)` block, because direct consumption of `--case-h1-*` through `--case-h3-*` is no longer the contract. Replace it with role-specific assertions:

```ts
it('maps shared case-study titles by visual role', () => {
  const css = read('components/case-study/case-layout.module.css');

  expect(css).toMatch(/\.hero h1\s*\{[^}]*var\(--case-project-title-size\)[^}]*var\(--case-project-title-max\)/s);
  expect(css).toMatch(/\.section-heading h2\)\s*\{[^}]*var\(--case-chapter-title-size\)[^}]*var\(--case-chapter-title-max\)/s);
  expect(css).toMatch(/\.reflection-grid h3\)\s*\{[^}]*var\(--case-narrative-title-size\)/s);
  expect(css).toMatch(/\.principles h3\)[\s\S]*?var\(--case-card-title-size\)/);
  expect(css).toMatch(/\.feedback-loop h3\)[\s\S]*?var\(--case-card-title-size\)/);
  expect(css).toContain('gap: var(--case-index-title-gap)');
  expect(css).toContain('margin-block-end: var(--case-title-body-gap)');
});
```

- [ ] **Step 2: Run the focused test and verify the role-mapping assertions fail**

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts`

Expected: FAIL because the shared layout still consumes `--case-h1-*`, `--case-h2-*`, and `--case-h3-*` aliases directly.

- [ ] **Step 3: Map the shared hero and chapter headings**

```css
.hero h1 {
  max-width: var(--case-project-title-max);
  margin-block: var(--case-index-title-gap) var(--case-title-body-gap);
  font-family: var(--font-display);
  font-size: var(--case-project-title-size);
  font-weight: var(--case-project-title-weight);
  line-height: var(--case-project-title-leading);
}

.case :global(.section-heading) {
  display: grid;
  gap: var(--case-index-title-gap);
  margin-block-end: var(--case-title-body-gap);
}

.case :global(.section-heading h2) {
  max-width: var(--case-chapter-title-max);
  margin: 0;
  font-size: var(--case-chapter-title-size);
  font-weight: var(--case-chapter-title-weight);
  line-height: var(--case-chapter-title-leading);
}
```

- [ ] **Step 4: Split narrative headings from repeated card headings**

```css
.case :global(.reflection-grid h3) {
  max-width: var(--case-narrative-title-max);
  margin-block: var(--case-index-title-gap) var(--case-title-body-gap);
  font-size: var(--case-narrative-title-size);
  font-weight: var(--case-narrative-title-weight);
  line-height: var(--case-narrative-title-leading);
}

.case :global(.principles h3),
.case :global(.evidence-levels h3),
.case :global(.boundary-map h3),
.case :global(.feedback-loop h3) {
  max-width: var(--case-card-title-max);
  margin-block: var(--case-index-title-gap) var(--case-title-body-gap);
  font-size: var(--case-card-title-size);
  font-weight: var(--case-card-title-weight);
  line-height: var(--case-card-title-leading);
}
```

- [ ] **Step 5: Make shared print rules consume the same roles, rerun, and commit**

```css
article[data-case-study] h1 {
  font-size: var(--case-project-title-size);
  line-height: var(--case-project-title-leading);
}

article[data-case-study] h2 {
  font-size: var(--case-chapter-title-size) !important;
  line-height: var(--case-chapter-title-leading) !important;
}
```

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts tests/component/case-study.test.tsx`

Expected: PASS.

```bash
git add components/case-study/case-layout.module.css components/case-study/print.css tests/unit/portfolio-detail-system.test.ts
git commit -m "style: map shared case headings by role"
```

### Task 3: Map Meeting Without Flattening Its Identity

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts:58-83`
- Modify: `components/meeting/meeting-layout.module.css:43-50,139-152`
- Modify: `components/meeting/meeting-evidence.module.css:55-59`
- Modify: `components/meeting/meeting-models.module.css:90-94,128-133`
- Inspect: `components/meeting/meeting-print.css`

- [ ] **Step 1: Add failing Meeting role assertions**

```ts
it('maps Meeting headings while preserving its case theme', () => {
  const layout = read('components/meeting/meeting-layout.module.css');
  const evidence = read('components/meeting/meeting-evidence.module.css');
  const models = read('components/meeting/meeting-models.module.css');

  expect(layout).toMatch(/\.hero h1\s*\{[^}]*var\(--case-project-title-size\)/s);
  expect(layout).toMatch(/\.content h2\s*\{[^}]*var\(--case-chapter-title-size\)/s);
  expect(layout).toMatch(/\.content h3\s*\{[^}]*var\(--case-card-title-size\)/s);
  expect(evidence).toMatch(/\.decisionHeader h3\s*\{[^}]*var\(--case-narrative-title-size\)/s);
  expect(models).toMatch(/\.language > figcaption\s*\{[^}]*var\(--case-media-title-size\)/s);
  expect(models).toMatch(/\.capabilities h3\s*\{[^}]*var\(--case-card-title-size\)/s);
  expect(layout).toMatch(/\.eyebrow\s*\{[^}]*var\(--case-index-title-gap\)/s);
  expect(layout).toMatch(/\.proposition\s*\{[^}]*var\(--case-title-body-gap\)/s);
  expect(layout).toContain('--meeting-portfolio-accent');
});
```

- [ ] **Step 2: Run the focused test and verify it fails on Meeting local sizes**

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts`

Expected: FAIL for Meeting role assertions while the case-theme assertion remains green.

- [ ] **Step 3: Map Meeting layout headings to project, chapter, and card roles**

```css
.hero h1 {
  max-width: var(--case-project-title-max);
  margin-block: var(--case-index-title-gap) 0;
  font-size: var(--case-project-title-size);
  font-weight: var(--case-project-title-weight);
  line-height: var(--case-project-title-leading);
}

.content h2 {
  max-width: var(--case-chapter-title-max);
  margin: 0 0 var(--case-title-body-gap);
  font-size: var(--case-chapter-title-size);
  font-weight: var(--case-chapter-title-weight);
  line-height: var(--case-chapter-title-leading);
}

.proposition {
  margin-block-start: var(--case-title-body-gap);
}

.eyebrow {
  margin-block-end: var(--case-index-title-gap);
}

.content h3 {
  max-width: var(--case-card-title-max);
  margin-block: var(--case-index-title-gap) var(--case-title-body-gap);
  font-size: var(--case-card-title-size);
  font-weight: var(--case-card-title-weight);
  line-height: var(--case-card-title-leading);
}
```

- [ ] **Step 4: Map Meeting evidence and model titles**

```css
.decisionHeader h3 {
  max-width: var(--case-narrative-title-max);
  margin: var(--case-index-title-gap) 0 0;
  font-size: var(--case-narrative-title-size);
  font-weight: var(--case-narrative-title-weight);
  line-height: var(--case-narrative-title-leading);
}

.capabilities h3 {
  max-width: var(--case-card-title-max);
  margin: var(--case-index-title-gap) 0 var(--case-title-body-gap);
  font-size: var(--case-card-title-size);
  font-weight: var(--case-card-title-weight);
  line-height: var(--case-card-title-leading);
}

.language > figcaption {
  max-width: var(--case-media-title-max);
  font-size: var(--case-media-title-size);
  font-weight: var(--case-media-title-weight);
  line-height: var(--case-media-title-leading);
}
```

- [ ] **Step 5: Verify Meeting tests and commit**

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts tests/component/meeting-evidence.test.tsx`

Expected: PASS. Run `npm test -- tests/component/meeting-layout.test.tsx` separately and confirm its sole failure remains the pre-existing `--chapter-link-color` assertion; do not repair it in this commit.

```bash
git add components/meeting/meeting-layout.module.css components/meeting/meeting-evidence.module.css components/meeting/meeting-models.module.css tests/unit/portfolio-detail-system.test.ts
git commit -m "style: align Meeting heading roles"
```

### Task 4: Map Xuelang Screen And PDF Roles

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts`
- Modify: `tests/unit/xuelang-course-entry-styles.test.ts`
- Modify: `components/xuelang/xuelang-layout.module.css:85-91,261-267,381-385,455-461`
- Modify: `components/xuelang/xuelang-evidence.module.css:161-170,334-338`
- Modify: `components/xuelang/xuelang-course-entry.module.css:52-58,250-254,323-330`
- Modify: `components/xuelang/xuelang-print.css:50-112,168-175,362-370`

- [ ] **Step 1: Add failing Xuelang screen-role assertions**

```ts
it('maps Xuelang custom headings to shared visual roles', () => {
  const layout = read('components/xuelang/xuelang-layout.module.css');
  const evidence = read('components/xuelang/xuelang-evidence.module.css');

  expect(layout).toMatch(/\.hero h1\s*\{[^}]*var\(--case-project-title-size\)/s);
  expect(layout).toMatch(/\.section-heading h2\)[\s\S]*?var\(--case-chapter-title-size\)/);
  expect(layout).toMatch(/\.xuelang-problem-list h3\)\s*\{[^}]*var\(--case-card-title-size\)/s);
  expect(layout).toMatch(/\.xuelang-reflection h3\)\s*\{[^}]*var\(--case-narrative-title-size\)/s);
  expect(evidence).toMatch(/\.storyCopy > h3\s*\{[^}]*var\(--case-narrative-title-size\)/s);
  expect(evidence).toMatch(/\.learningStates h3\s*\{[^}]*var\(--case-narrative-title-size\)/s);
  expect(layout).toMatch(/\.section-heading\)\s*\{[^}]*var\(--case-index-title-gap\)/s);
});
```

- [ ] **Step 2: Add failing course-entry media-title assertions**

```ts
it('uses the shared media-title role on screen and in print', () => {
  expect(styles).toMatch(
    /\.stageCopy h4\s*\{[^}]*margin:\s*var\(--case-index-title-gap\) 0 var\(--case-title-body-gap\)[^}]*font-size:\s*var\(--case-media-title-size\)[^}]*line-height:\s*var\(--case-media-title-leading\)/s,
  );

  const printStyles = styles.slice(styles.indexOf('@media print'));
  expect(printStyles).toMatch(
    /\.printGrid figcaption strong\s*\{[^}]*font-size:\s*var\(--case-media-title-size\)/s,
  );
});
```

- [ ] **Step 3: Run focused Xuelang tests and verify both new contracts fail**

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts tests/unit/xuelang-course-entry-styles.test.ts`

Expected: FAIL on Xuelang narrative, media, and card role mappings.

- [ ] **Step 4: Replace Xuelang local heading sizes with role tokens**

```css
/* xuelang-layout.module.css */
.hero h1 {
  max-width: var(--case-project-title-max);
  margin: 0;
  font-size: var(--case-project-title-size);
  font-weight: var(--case-project-title-weight);
  line-height: var(--case-project-title-leading);
}

.eyebrow {
  margin-block-end: var(--case-index-title-gap);
}

.proposition {
  margin-block-start: var(--case-title-body-gap);
}

.content :global(.section-heading) {
  display: grid;
  gap: var(--case-index-title-gap);
}

.content :global(.section-heading h2),
.content > :global(section > h2) {
  max-width: var(--case-chapter-title-max);
  font-size: var(--case-chapter-title-size);
  font-weight: var(--case-chapter-title-weight);
  line-height: var(--case-chapter-title-leading);
}

.content :global(.xuelang-problem-list h3) {
  max-width: var(--case-card-title-max);
  margin: var(--case-index-title-gap) 0 var(--case-title-body-gap);
  font-size: var(--case-card-title-size);
  font-weight: var(--case-card-title-weight);
  line-height: var(--case-card-title-leading);
}

.content :global(.xuelang-reflection h3) {
  max-width: var(--case-narrative-title-max);
  margin: var(--case-index-title-gap) 0 var(--case-title-body-gap);
  font-size: var(--case-narrative-title-size);
  font-weight: var(--case-narrative-title-weight);
  line-height: var(--case-narrative-title-leading);
}

/* xuelang-evidence.module.css */
.storyCopy > h3,
.learningStates h3 {
  max-width: var(--case-narrative-title-max);
  margin-block: var(--case-index-title-gap) var(--case-title-body-gap);
  font-size: var(--case-narrative-title-size);
  font-weight: var(--case-narrative-title-weight);
  line-height: var(--case-narrative-title-leading);
}

/* xuelang-course-entry.module.css */
.stageCopy h4 {
  max-width: var(--case-media-title-max);
  margin: var(--case-index-title-gap) 0 var(--case-title-body-gap);
  font-size: var(--case-media-title-size);
  font-weight: var(--case-media-title-weight);
  line-height: var(--case-media-title-leading);
}
```

Remove the English-only `.storyCopy:lang(en) > h3` size override and the mobile `.stageCopy h4` size override. Keep their layout and width rules only when they do not conflict with the role token.

- [ ] **Step 5: Map Xuelang print selectors, rerun, and commit**

```css
[data-xuelang-hero] h1 {
  font-size: var(--case-project-title-size) !important;
  line-height: var(--case-project-title-leading) !important;
}

[data-xuelang-case] [data-case-study] section h2 {
  font-size: var(--case-chapter-title-size) !important;
  line-height: var(--case-chapter-title-leading) !important;
}

[data-xuelang-case] [data-evidence-story] h3,
[data-xuelang-case] [data-case-study] .xuelang-reflection h3 {
  font-size: var(--case-narrative-title-size) !important;
  line-height: var(--case-narrative-title-leading) !important;
}
```

Set `.printGrid figcaption strong` to `font-size: var(--case-media-title-size)`. Preserve all pagination, image sizing, and `break-inside` rules.

Run: `npm test -- tests/unit/portfolio-detail-system.test.ts tests/unit/xuelang-course-entry-styles.test.ts tests/component/xuelang-layout.test.tsx`

Expected: PASS.

```bash
git add components/xuelang/xuelang-layout.module.css components/xuelang/xuelang-evidence.module.css components/xuelang/xuelang-course-entry.module.css components/xuelang/xuelang-print.css tests/unit/portfolio-detail-system.test.ts tests/unit/xuelang-course-entry-styles.test.ts
git commit -m "style: align Xuelang heading roles"
```

### Task 5: Add Browser-Level Hierarchy Regression Coverage

**Files:**
- Modify: `tests/e2e/portfolio-detail-system.spec.ts:3-72`

- [ ] **Step 1: Add a computed-style helper and representative role selectors**

```ts
const roleCases = [
  { route: '/zh/work/call-agent/', project: 58, chapter: 50, card: 22 },
  { route: '/en/work/call-agent/', project: 58, chapter: 50, card: 22 },
  { route: '/zh/work/meeting/', project: 58, chapter: 50, card: 22 },
  { route: '/en/work/meeting/', project: 58, chapter: 50, card: 22 },
  { route: '/zh/build/stt-demo/', project: 58, chapter: 50, card: 22 },
  { route: '/en/build/stt-demo/', project: 58, chapter: 50, card: 22 },
] as const;

const fontSize = async (locator: import('@playwright/test').Locator) =>
  locator.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
```

- [ ] **Step 2: Add a desktop test for the approved 1440px hierarchy**

```ts
for (const item of roleCases) {
  test(`${item.route} exposes the approved desktop hierarchy`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(item.route, { waitUntil: 'networkidle' });

    expect(await fontSize(page.locator('[data-case-study] h1').first())).toBeCloseTo(item.project, 0);
    expect(await fontSize(page.locator('[data-case-study] h2').first())).toBeCloseTo(item.chapter, 0);
    const card = page.locator('[data-case-study] :is(.principles, .feedback-loop, .evidence-levels) h3').first();
    if (await card.count()) expect(await fontSize(card)).toBeCloseTo(item.card, 0);
  });
}
```

Add a Xuelang-specific desktop assertion because its CSS-module selectors are custom:

```ts
test('Xuelang exposes all five visual roles at desktop size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/zh/work/xuelang/', { waitUntil: 'networkidle' });

  const selectors = [
    ['[data-xuelang-case] h1', 58],
    ['[data-xuelang-case] .section-heading h2', 50],
    ['[data-xuelang-case] [class*="storyCopy"] > h3', 36],
    ['[data-xuelang-case] [class*="stageCopy"] h4', 29],
    ['[data-xuelang-case] .xuelang-problem-list h3', 22],
  ] as const;

  for (const [selector, expected] of selectors) {
    expect(await fontSize(page.locator(selector).first())).toBeCloseTo(expected, 0);
  }
});
```

- [ ] **Step 3: Add responsive wrapping and overlap checks at 1024px and 390px**

```ts
for (const width of [1024, 390] as const) {
  test(`case headings remain contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/zh/work/call-agent/', { waitUntil: 'networkidle' });

    const boxes = await page.locator('[data-case-study] :is(h1, h2, h3)').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, viewport: window.innerWidth };
      }),
    );

    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(box.viewport + 1);
      expect(box.width).toBeGreaterThan(0);
    }
  });
}
```

- [ ] **Step 4: Run the focused browser suite**

Run: `npx playwright test tests/e2e/portfolio-detail-system.spec.ts --project=desktop --project=mobile`

Expected: PASS with no clipped heading, missing route, or computed-size mismatch.

- [ ] **Step 5: Commit the browser regression coverage**

```bash
git add tests/e2e/portfolio-detail-system.spec.ts
git commit -m "test: cover case heading hierarchy"
```

### Task 6: Verify Web, PDF, And Repository Scope

**Files:**
- Verify only; no planned source modifications

- [ ] **Step 1: Run all focused unit and component tests**

Run:

```bash
npm test -- \
  tests/unit/portfolio-detail-system.test.ts \
  tests/unit/xuelang-course-entry-styles.test.ts \
  tests/component/case-study.test.tsx \
  tests/component/meeting-layout.test.tsx \
  tests/component/meeting-evidence.test.tsx \
  tests/component/xuelang-layout.test.tsx
```

Expected: all heading-system assertions PASS. Record the existing Meeting chapter-link assertion separately if it remains red.

- [ ] **Step 2: Build the site**

Run: `npm run build:framework`

Expected: Next.js production build completes successfully.

- [ ] **Step 3: Generate and verify Xuelang PDFs**

Run: `npm run pdf:xuelang && npm run verify:xuelang-pdf`

Expected: Chinese and English PDFs generate, contain non-empty pages, and pass the existing export checks.

- [ ] **Step 4: Perform visual checks at 1440px, 1024px, and 390px**

Run: `npm run dev -- --hostname 127.0.0.1 --port 4175`

Inspect these routes in both locales:

```text
/zh/work/call-agent/    /en/work/call-agent/
/zh/work/meeting/       /en/work/meeting/
/zh/build/stt-demo/     /en/build/stt-demo/
/zh/work/xuelang/       /en/work/xuelang/
```

Expected: no overlap, clipping, isolated one-word lines, or hierarchy reversal; each case retains its font, accent, background, and media composition.

- [ ] **Step 5: Confirm the diff contains no unrelated feature changes**

Run:

```bash
git diff --check codex/shared/integration...HEAD
git diff --name-only codex/shared/integration...HEAD
```

Expected: only the design spec, implementation plan, files listed in this plan, and generated PDF files already tracked by the repository appear. Do not add caches, screenshots, `.playwright-cli/`, `tmp/`, or generated dependency metadata.

### Task 7: Synchronize The Three Clean Worktrees

**Files:**
- Git history only; do not manually copy files between worktrees

- [ ] **Step 1: Recheck all destination statuses**

Run:

```bash
git -C /Users/admin/Documents/作品集-yangjing/worktrees/shared-integration status --short
git -C /Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh status --short
git -C /Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets status --short
```

Expected: no output from all three commands. Stop synchronization for any destination that is no longer clean.

- [ ] **Step 2: Fast-forward the shared integration branch**

Run:

```bash
git -C /Users/admin/Documents/作品集-yangjing/worktrees/shared-integration merge --ff-only codex/shared/case-heading-system
```

Expected: `codex/shared/integration` fast-forwards to the verified heading-system tip.

- [ ] **Step 3: Merge updated shared integration into Call Agent**

Run:

```bash
git -C /Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh merge --no-edit codex/shared/integration
```

Expected: a clean merge preserving `feat: refresh Call Agent case study`. Resolve only overlapping heading CSS or tests, then run `npm test -- tests/unit/portfolio-detail-system.test.ts` and `npx playwright test tests/e2e/call-agent.spec.ts --project=desktop`.

- [ ] **Step 4: Merge updated shared integration into Meeting**

Run:

```bash
git -C /Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets merge --no-edit codex/shared/integration
```

Expected: a clean merge preserving `fix: complete Meeting evidence presentation`. Resolve only overlapping Meeting heading CSS or tests, then run `npm test -- tests/unit/portfolio-detail-system.test.ts tests/component/meeting-evidence.test.tsx`. Run `tests/component/meeting-layout.test.tsx` separately and confirm only its recorded baseline assertion remains red.

- [ ] **Step 5: Verify status and leave deferred worktrees untouched**

Run:

```bash
git -C /Users/admin/Documents/作品集-yangjing/worktrees/shared-integration status --short --branch
git -C /Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh status --short --branch
git -C /Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets status --short --branch
git -C /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/stt-footer-layered-reveal status --short --branch
git -C /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/xuelang-nav-fix status --short --branch
git -C /Users/admin/Documents/作品集-yangjing/worktrees/convo-ai-build status --short --branch
```

Expected: the first three branches contain the heading-system commits with no uncommitted merge residue. STT still retains its existing `next-env.d.ts`; Xuelang retains `.playwright-cli/` and `tmp/`; Convo AI retains all existing work and receives no new commit.

Do not push during this task. Push only after the user reviews the synchronized local branches.
