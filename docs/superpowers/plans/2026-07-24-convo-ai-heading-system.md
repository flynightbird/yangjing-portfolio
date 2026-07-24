# Convo AI Heading System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the shared five-role case-study typography system to every readable Convo AI heading while preserving its black cinematic presentation through non-semantic decorative type.

**Architecture:** Merge the approved shared heading contract into the Convo AI branch, then adapt Convo AI's custom layout and media components to consume those tokens directly. Separate readable stage headings from `aria-hidden` display typography, keep chapter numerals as a small indexed label plus a decorative background layer, and verify the actual custom selectors in unit, component, print, and browser tests.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, MDX, Vitest, Testing Library, Playwright.

---

## File Structure

- `app/globals.css` — shared semantic role tokens; received from `codex/shared/integration`, not redefined by Convo AI.
- `components/convo-ai/convo-ai-layout.module.css` — chapter, narrative, and card role mapping plus decorative chapter-number composition.
- `components/convo-ai/convo-ai-media.tsx` — semantic stage heading element and separate decorative display title.
- `components/convo-ai/convo-ai-media.module.css` — project/media stage roles and media-title mapping.
- `components/convo-ai/convo-ai-print.css` — fixed print role mapping and decorative-layer suppression.
- `content/work/convo-ai.zh.mdx` — unchanged chapter copy with explicit `data-index` values for the decorative numeral layer.
- `content/work/convo-ai.en.mdx` — unchanged chapter copy with explicit `data-index` values for the decorative numeral layer.
- `tests/unit/convo-ai-heading-system.test.ts` — focused CSS and MDX contract tests for Convo AI.
- `tests/component/convo-ai-media.test.tsx` — hero/non-hero stage semantics and decorative title accessibility.
- `tests/component/convo-ai-layout.test.tsx` — one real project H1 in the complete custom layout.
- `tests/e2e/portfolio-detail-system.spec.ts` — shared role-size and responsive containment checks extended to Convo AI.
- `tests/e2e/convo-ai.spec.ts` — Convo-specific hierarchy, duplicate-heading, and cinematic-layer checks.

### Task 1: Synchronize The Shared Heading Contract

**Files:**
- Merge from: `codex/shared/integration` at `95fbfcf`
- Modify through merge: `app/globals.css`
- Modify through merge: `components/case-study/case-layout.module.css`
- Modify through merge: `components/case-study/print.css`
- Modify through merge: `tests/unit/portfolio-detail-system.test.ts`
- Modify through merge: `tests/e2e/portfolio-detail-system.spec.ts`

- [ ] **Step 1: Confirm only the approved specification commit and preserved untracked artifacts are present**

Run:

```bash
git status --short --branch
```

Expected: branch `codex/case/convo-ai-build`; no tracked modifications; `.playwright-cli/`, `output/`, and `tsconfig.tsbuildinfo` may remain untracked.

- [ ] **Step 2: Merge the shared integration branch without flattening its history**

Run:

```bash
git merge --no-ff codex/shared/integration -m "merge: sync shared case heading system"
```

Expected: merge succeeds and brings in the five semantic role tokens, shared rhythm tokens, fixed print sizes, and shared regression tests. If Git reports the old `tests/unit/portfolio-detail-system.test.ts` as a conflict, resolve it entirely in favor of the semantic-role contract from `codex/shared/integration`; Convo-specific assertions belong in a new focused test file in Task 2.

- [ ] **Step 3: Verify the merged shared contract before adapting Convo AI**

Run:

```bash
npm test -- tests/unit/portfolio-detail-system.test.ts tests/unit/xuelang-course-entry-styles.test.ts
```

Expected: both suites pass. A failure mentioning Convo AI is not expected yet because Convo-specific coverage has not been added.

- [ ] **Step 4: Record the integration baseline**

Run:

```bash
git status --short --branch
git log -3 --oneline --decorate
```

Expected: the merge commit is at `HEAD`; only the three preserved untracked artifacts remain outside Git.

### Task 2: Map Chapters, Narrative Titles, Cards, And Decorative Indexes

**Files:**
- Create: `tests/unit/convo-ai-heading-system.test.ts`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `content/work/convo-ai.en.mdx`

- [ ] **Step 1: Write the failing layout-role contract test**

Create `tests/unit/convo-ai-heading-system.test.ts` with the following foundation and first test:

```ts
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

const ruleBlock = (css: string, selectors: string | readonly string[]) => {
  const expected = typeof selectors === 'string' ? [selectors] : selectors;
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gs)].find(
    ([, selectorList]) => {
      const actual = selectorList.split(',').map((selector) => selector.trim());
      return actual.length === expected.length && expected.every((selector) => actual.includes(selector));
    },
  );
  expect(rule, `Expected CSS rule for ${expected.join(', ')}`).toBeDefined();
  return rule?.[2] ?? '';
};

describe('Convo AI semantic heading system', () => {
  it('maps chapter, narrative, and card titles to shared roles', () => {
    const css = read('components/convo-ai/convo-ai-layout.module.css');
    const sectionHeading = ruleBlock(css, '.content :global(.section-heading)');
    const chapter = ruleBlock(css, '.content :global(.section-heading h2)');
    const narrative = ruleBlock(css, '.content :global(.convo-subheading)');
    const card = ruleBlock(css, '.content :global(.convo-principles h3)');

    expect(sectionHeading).toContain('gap: var(--case-index-title-gap);');
    expect(sectionHeading).toContain('margin-block-end: var(--case-title-body-gap);');

    for (const declaration of [
      'max-width: var(--case-chapter-title-max);',
      'font-size: var(--case-chapter-title-size);',
      'font-weight: var(--case-chapter-title-weight);',
      'line-height: var(--case-chapter-title-leading);',
    ]) expect(chapter).toContain(declaration);

    for (const declaration of [
      'max-width: var(--case-narrative-title-max);',
      'margin-block-end: var(--case-title-body-gap);',
      'font-size: var(--case-narrative-title-size);',
      'font-weight: var(--case-narrative-title-weight);',
      'line-height: var(--case-narrative-title-leading);',
    ]) expect(narrative).toContain(declaration);

    for (const declaration of [
      'max-width: var(--case-card-title-max);',
      'margin-block-end: var(--case-title-body-gap);',
      'font-size: var(--case-card-title-size);',
      'font-weight: var(--case-card-title-weight);',
      'line-height: var(--case-card-title-leading);',
    ]) expect(card).toContain(declaration);
  });

  it('keeps one small index label and derives the giant numeral from data-index', () => {
    const css = read('components/convo-ai/convo-ai-layout.module.css');
    const index = ruleBlock(css, '.content :global(.section-index)');
    const displayIndex = ruleBlock(css, '.content :global(.section-index::before)');
    const content = `${read('content/work/convo-ai.zh.mdx')}\n${read('content/work/convo-ai.en.mdx')}`;

    expect(index).toContain('font-size: 0.6875rem;');
    expect(displayIndex).toContain('content: attr(data-index);');
    expect(displayIndex).toContain('pointer-events: none;');
    expect(content.match(/className="section-index" aria-hidden="true" data-index="\d{2}"/g)).toHaveLength(14);
  });
});
```

- [ ] **Step 2: Run the new test and verify the old custom scale fails**

Run:

```bash
npm test -- tests/unit/convo-ai-heading-system.test.ts
```

Expected: FAIL because Convo AI still uses `clamp(2.8rem, 6.2vw, 7rem)`, `1.5rem`, and `clamp(1.75rem, 3vw, 2.75rem)`, and the MDX indexes do not yet expose `data-index`.

- [ ] **Step 3: Replace the chapter composition with shared readable roles and a decorative numeral layer**

In `components/convo-ai/convo-ai-layout.module.css`, replace the current `.section-heading`, `.section-index`, chapter `h2`, principle `h3`, and `.convo-subheading` rules with:

```css
.content :global(.section-heading) {
  position: relative;
  display: grid;
  min-height: clamp(12rem, 24vw, 21rem);
  align-content: center;
  gap: var(--case-index-title-gap);
  margin-block-end: var(--case-title-body-gap);
  isolation: isolate;
}

.content :global(.section-index) {
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--convo-live);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: var(--line-height-label);
}

.content :global(.section-index::before) {
  content: attr(data-index);
  position: absolute;
  z-index: -1;
  inset: 50% auto auto -0.07em;
  color: rgba(242, 247, 246, 0.055);
  font-family: 'Outfit', var(--font-display);
  font-size: clamp(10rem, 25vw, 26rem);
  font-weight: 600;
  line-height: 0.72;
  transform: translateY(-50%);
  pointer-events: none;
}

.content :global(.section-heading h2) {
  position: relative;
  z-index: 1;
  width: min(100%, 72rem);
  max-width: var(--case-chapter-title-max);
  margin: 0;
  font-family: 'Outfit', var(--font-display);
  font-size: var(--case-chapter-title-size);
  font-weight: var(--case-chapter-title-weight);
  line-height: var(--case-chapter-title-leading);
  letter-spacing: 0;
  text-wrap: balance;
}

.content :global(.convo-principles h3) {
  max-width: var(--case-card-title-max);
  margin: 6rem 0 var(--case-title-body-gap);
  font-size: var(--case-card-title-size);
  font-weight: var(--case-card-title-weight);
  line-height: var(--case-card-title-leading);
}

.content :global(.convo-subheading) {
  max-width: var(--case-narrative-title-max);
  margin: clamp(4rem, 8vw, 7rem) 0 var(--case-title-body-gap);
  font-size: var(--case-narrative-title-size);
  font-weight: var(--case-narrative-title-weight);
  line-height: var(--case-narrative-title-leading);
  letter-spacing: 0;
  text-wrap: balance;
}
```

Remove the obsolete mobile `padding-block-start` override for `.section-heading h2`. Keep the existing mobile `min-height`, and replace the `font-size: 9rem` mobile override so it targets `.section-index::before` rather than `.section-index`.

- [ ] **Step 4: Add explicit decorative index values without changing chapter copy**

In both MDX files, change each index node from:

```mdx
<p className="section-index" aria-hidden="true">01</p>
```

to the matching explicit value:

```mdx
<p className="section-index" aria-hidden="true" data-index="01">01</p>
```

Apply `01` through `07` once per locale. Do not change labels, headings, paragraphs, evidence claims, or media order.

- [ ] **Step 5: Run focused and shared unit tests**

Run:

```bash
npm test -- tests/unit/convo-ai-heading-system.test.ts tests/unit/portfolio-detail-system.test.ts tests/unit/convo-ai-content.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the layout role mapping**

```bash
git add components/convo-ai/convo-ai-layout.module.css content/work/convo-ai.zh.mdx content/work/convo-ai.en.mdx tests/unit/convo-ai-heading-system.test.ts
git commit -m "feat: align Convo AI content heading roles"
```

### Task 3: Separate Semantic Stage Titles From Cinematic Display Type

**Files:**
- Modify: `tests/component/convo-ai-media.test.tsx`
- Modify: `tests/component/convo-ai-layout.test.tsx`
- Modify: `tests/unit/convo-ai-heading-system.test.ts`
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`

- [ ] **Step 1: Write failing component expectations for one H1 and an accessible media heading**

Extend the existing `ConvoAiStage` test in `tests/component/convo-ai-media.test.tsx` with:

```ts
expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
expect(screen.getByRole('heading', { level: 3, name: 'ConvoAI' })).toHaveAttribute(
  'data-stage-semantic-title',
);
expect(container.querySelector('[data-stage-display-title]')).toHaveAttribute('aria-hidden', 'true');
```

Add a second test that renders the same component with `hero` and asserts:

```ts
expect(screen.getByRole('heading', { level: 1, name: 'ConvoAI' })).toHaveAttribute(
  'data-stage-semantic-title',
);
expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
expect(container.querySelectorAll('[data-stage-display-title]')).toHaveLength(1);
```

In `tests/component/convo-ai-layout.test.tsx`, add:

```ts
expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
expect(container.querySelector('[data-stage-display-title]')).toHaveAttribute('aria-hidden', 'true');
```

- [ ] **Step 2: Add failing CSS role assertions**

Append a test to `tests/unit/convo-ai-heading-system.test.ts`:

```ts
it('maps readable stage and media titles while isolating display type', () => {
  const css = read('components/convo-ai/convo-ai-media.module.css');
  const project = ruleBlock(css, ".stage[data-hero='true'] .stageSemanticTitle");
  const media = ruleBlock(css, ".stage:not([data-hero='true']) .stageSemanticTitle");
  const avatar = ruleBlock(css, '.avatarFigure figcaption strong');
  const display = ruleBlock(css, '.stageDisplayTitle');

  for (const declaration of [
    'max-width: var(--case-project-title-max);',
    'font-size: var(--case-project-title-size);',
    'font-weight: var(--case-project-title-weight);',
    'line-height: var(--case-project-title-leading);',
  ]) expect(project).toContain(declaration);

  for (const block of [media, avatar]) {
    for (const declaration of [
      'max-width: var(--case-media-title-max);',
      'font-size: var(--case-media-title-size);',
      'font-weight: var(--case-media-title-weight);',
      'line-height: var(--case-media-title-leading);',
    ]) expect(block).toContain(declaration);
  }

  expect(display).toContain('position: absolute;');
  expect(display).toContain('pointer-events: none;');
});
```

- [ ] **Step 3: Run the tests and confirm the duplicate-H1 behavior fails**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-heading-system.test.ts
```

Expected: FAIL because every `ConvoAiStage` currently renders an oversized `h1`, has no separate decorative title, and media titles do not consume the shared media role.

- [ ] **Step 4: Render a semantic heading and an inaccessible display layer**

In `ConvoAiStage`, define the heading level from `hero` and replace the current title markup:

```tsx
const SemanticHeading = hero ? 'h1' : 'h3';

return <div
  ref={stageRef}
  className={styles.stage}
  data-convo-ai-stage
  data-active-platform={activePlatform ?? 'posters'}
  data-hero={hero ? 'true' : 'false'}
  onPointerMove={updateTilt}
  onPointerLeave={resetTilt}
>
  <div className={styles.stageCopy}>
    <p>{eyebrow}</p>
    <span className={styles.stageDisplayTitle} data-stage-display-title aria-hidden="true">{title}</span>
    <SemanticHeading className={styles.stageSemanticTitle} data-stage-semantic-title>{title}</SemanticHeading>
    <div>{description}</div>
  </div>
  <div className={styles.terrain} aria-hidden="true"><i /><i /><i /></div>
  <div className={styles.webPlane} data-convo-web-plane><ConvoAiViewportVideo id={webId} locale={locale} /></div>
  <div className={styles.appDevice} data-convo-app-device><div><ConvoAiViewportVideo id={appId} locale={locale} /></div></div>
  <div className={styles.stageControls}>
    <button type="button" onClick={() => setActivePlatform('web')}><Monitor aria-hidden="true" size={17} />{locale === 'zh' ? '聚焦 Web 录屏' : 'Focus Web recording'}</button>
    <button type="button" onClick={() => setActivePlatform('app')}><Smartphone aria-hidden="true" size={17} />{locale === 'zh' ? '聚焦 App 录屏' : 'Focus App recording'}</button>
  </div>
</div>;
```

- [ ] **Step 5: Map the semantic stage and avatar titles to shared roles**

Replace `.stageCopy h1` with these rules in `components/convo-ai/convo-ai-media.module.css`:

```css
.stageCopy {
  position: relative;
  z-index: 5;
  width: min(100%, 72rem);
  margin-inline: auto;
  padding: clamp(4.75rem, 10vh, 8rem) clamp(1.25rem, 5vw, 5rem);
  text-align: center;
  isolation: isolate;
}

.stageCopy p {
  margin: 0 0 var(--case-index-title-gap);
  color: #50e6dc;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.stageDisplayTitle {
  position: absolute;
  z-index: -1;
  inset: 50% auto auto 50%;
  color: rgba(242, 247, 246, 0.075);
  font-family: 'Outfit', var(--font-display);
  font-size: clamp(8rem, 18vw, 18rem);
  font-weight: 600;
  line-height: 0.82;
  white-space: nowrap;
  transform: translate(-50%, -55%);
  pointer-events: none;
}

.stageSemanticTitle {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  font-family: 'Outfit', var(--font-display);
  letter-spacing: 0;
  text-wrap: balance;
}

.stage[data-hero='true'] .stageSemanticTitle {
  max-width: var(--case-project-title-max);
  font-size: var(--case-project-title-size);
  font-weight: var(--case-project-title-weight);
  line-height: var(--case-project-title-leading);
}

.stage:not([data-hero='true']) .stageSemanticTitle {
  max-width: var(--case-media-title-max);
  font-size: var(--case-media-title-size);
  font-weight: var(--case-media-title-weight);
  line-height: var(--case-media-title-leading);
}

.stageCopy div {
  max-width: 40rem;
  margin: var(--case-title-body-gap) auto 0;
  color: rgba(242, 247, 246, 0.72);
  font-size: clamp(0.95rem, 1.35vw, 1.15rem);
  line-height: 1.45;
  text-shadow: 0 2px 16px #050708;
}

.avatarFigure figcaption strong {
  display: block;
  max-width: var(--case-media-title-max);
  margin-block: var(--case-index-title-gap) var(--case-title-body-gap);
  font-size: var(--case-media-title-size);
  font-weight: var(--case-media-title-weight);
  line-height: var(--case-media-title-leading);
}
```

At `max-width: 480px`, replace the obsolete `.stageCopy h1 { font-size: 4.5rem; }` override with:

```css
.stageDisplayTitle { font-size: 7rem; }
```

Do not map `.appShowcaseStep button strong` or `.voiceprintModes button strong` to heading roles: they are product controls, not portfolio headings.

- [ ] **Step 6: Run component and unit tests**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-heading-system.test.ts
```

Expected: PASS; a non-hero stage exposes an `h3`, the hero exposes the page's only `h1`, and display titles are `aria-hidden`.

- [ ] **Step 7: Commit the stage and media role mapping**

```bash
git add components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-heading-system.test.ts
git commit -m "feat: separate Convo AI semantic and display titles"
```

### Task 4: Apply The Fixed Print Hierarchy

**Files:**
- Modify: `tests/unit/convo-ai-heading-system.test.ts`
- Modify: `components/convo-ai/convo-ai-print.css`

- [ ] **Step 1: Write the failing print-role test**

Append:

```ts
it('maps Convo AI print headings to fixed shared roles', () => {
  const css = read('components/convo-ai/convo-ai-print.css');
  const project = ruleBlock(css, "[data-convo-ai-stage][data-hero='true'] [data-stage-semantic-title]");
  const chapter = ruleBlock(css, '[data-convo-ai-case] .section-heading h2');
  const narrative = ruleBlock(css, '[data-convo-ai-case] .convo-subheading');
  const media = ruleBlock(css, [
    "[data-convo-ai-stage]:not([data-hero='true']) [data-stage-semantic-title]",
    '[data-convo-ai-case] [class*=\'avatarFigure\'] figcaption strong',
  ]);
  const card = ruleBlock(css, '[data-convo-ai-case] .convo-principles h3');

  expect(project).toContain('font-size: var(--case-project-title-size) !important;');
  expect(chapter).toContain('font-size: var(--case-chapter-title-size) !important;');
  expect(narrative).toContain('font-size: var(--case-narrative-title-size) !important;');
  expect(media).toContain('font-size: var(--case-media-title-size) !important;');
  expect(card).toContain('font-size: var(--case-card-title-size) !important;');
  expect(css).toContain('[data-stage-display-title]');
  expect(css).toMatch(/\[data-stage-display-title\][^{]*\{[^}]*display:\s*none\s*!important;/s);
});
```

- [ ] **Step 2: Run the print test and verify it fails**

Run:

```bash
npm test -- tests/unit/convo-ai-heading-system.test.ts
```

Expected: FAIL because `convo-ai-print.css` currently hides motion chrome but has no semantic role mapping.

- [ ] **Step 3: Add explicit print mappings and suppress decorative duplicates**

Inside the existing `@media print` block in `components/convo-ai/convo-ai-print.css`, add:

```css
[data-convo-ai-case] [data-stage-display-title],
[data-convo-ai-case] .section-index::before {
  display: none !important;
}

[data-convo-ai-stage][data-hero='true'] [data-stage-semantic-title] {
  max-width: var(--case-project-title-max) !important;
  font-size: var(--case-project-title-size) !important;
  line-height: var(--case-project-title-leading) !important;
}

[data-convo-ai-case] .section-heading h2 {
  max-width: var(--case-chapter-title-max) !important;
  font-size: var(--case-chapter-title-size) !important;
  line-height: var(--case-chapter-title-leading) !important;
}

[data-convo-ai-case] .convo-subheading {
  max-width: var(--case-narrative-title-max) !important;
  font-size: var(--case-narrative-title-size) !important;
  line-height: var(--case-narrative-title-leading) !important;
}

[data-convo-ai-stage]:not([data-hero='true']) [data-stage-semantic-title],
[data-convo-ai-case] [class*='avatarFigure'] figcaption strong {
  max-width: var(--case-media-title-max) !important;
  font-size: var(--case-media-title-size) !important;
  line-height: var(--case-media-title-leading) !important;
}

[data-convo-ai-case] .convo-principles h3 {
  max-width: var(--case-card-title-max) !important;
  font-size: var(--case-card-title-size) !important;
  line-height: var(--case-card-title-leading) !important;
}
```

- [ ] **Step 4: Run focused print and shared system tests**

Run:

```bash
npm test -- tests/unit/convo-ai-heading-system.test.ts tests/unit/portfolio-detail-system.test.ts
```

Expected: PASS, including the global `31pt / 24pt / 18pt / 14pt / 11pt` token contract.

- [ ] **Step 5: Commit the print mapping**

```bash
git add components/convo-ai/convo-ai-print.css tests/unit/convo-ai-heading-system.test.ts
git commit -m "feat: align Convo AI print heading roles"
```

### Task 5: Verify Both Locales At Desktop, Tablet, And Mobile Sizes

**Files:**
- Modify: `tests/e2e/portfolio-detail-system.spec.ts`
- Modify: `tests/e2e/convo-ai.spec.ts`

- [ ] **Step 1: Extend the shared role-size matrix with Convo AI's locale-specific evidence**

Add Convo AI to the desktop hierarchy coverage in `tests/e2e/portfolio-detail-system.spec.ts` with these selectors and expected computed sizes:

```ts
const convoRoleCases = {
  zh: [
    ['[data-convo-ai-stage][data-hero="true"] [data-stage-semantic-title]', 58],
    ['[data-convo-ai-case] .section-heading h2', 50],
    ['[data-convo-ai-case] .convo-subheading', 36],
    ['[data-convo-ai-case] [class*="avatarFigure"] figcaption strong', 29],
  ],
  en: [
    ['[data-convo-ai-stage][data-hero="true"] [data-stage-semantic-title]', 58],
    ['[data-convo-ai-case] .section-heading h2', 50],
    ['[data-convo-ai-stage]:not([data-hero="true"]) [data-stage-semantic-title]', 29],
    ['[data-convo-ai-case] .convo-principles h3', 22],
  ],
} as const;
```

For each locale, load `/${locale}/work/convo-ai/` at `1440 x 1000`, assert each locator exists, and use the existing `fontSize()` helper with `toBeCloseTo(expected, 0)`.

- [ ] **Step 2: Extend responsive containment coverage**

Add these entries to the existing `responsiveCases` array:

```ts
{ route: '/zh/work/convo-ai/', root: '[data-convo-ai-case]' },
{ route: '/en/work/convo-ai/', root: '[data-convo-ai-case]' },
```

The existing shared test will then check both routes at `1024px` and `390px` for horizontal overflow, stable heading geometry, clipping, and collisions with meaningful sibling content.

- [ ] **Step 3: Add Convo-specific semantic and decorative-layer assertions**

In the locale structure test in `tests/e2e/convo-ai.spec.ts`, add:

```ts
await expect(article.getByRole('heading', { level: 1, name: 'ConvoAI' })).toHaveCount(1);
await expect(page.locator('[data-stage-display-title]')).toHaveCount(
  locale === 'en' ? 3 : 1,
);
await expect(page.locator('[data-stage-display-title]').first()).toHaveAttribute('aria-hidden', 'true');
await expect(page.locator('body > .section-index')).toHaveCount(0);
await expect(page.locator('[data-convo-ai-case] .section-index')).toHaveCount(7);
```

Use the semantic locator for the first assertion; the decorative nodes must never be queried as headings. The `.section-index` global count guard intentionally confirms the indexes remain scoped inside the case root.

- [ ] **Step 4: Run the focused browser suites**

Run:

```bash
npx playwright test tests/e2e/portfolio-detail-system.spec.ts tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile
```

Expected: PASS for both locales at `1440px` and `390px`; the shared test also sets the desktop project to `1024px` for its tablet-width containment pass.

- [ ] **Step 5: Inspect generated screenshots for visual hierarchy**

Open the latest Convo AI screenshots produced under `test-results/` and confirm:

- The 50px chapter title is the strongest readable title inside each chapter.
- The giant numeral and stage word remain background texture and never obscure readable text.
- Chinese narrative and media titles visibly match their shared roles.
- English card and media titles visibly match their shared roles.
- No heading wraps into a clipped, single-character, or overlapping line at 1440, 1024, or 390.

If the decorative stage word obscures readable text, change `.stageDisplayTitle` opacity from `0.075` to `0.05`. If it crowds the 390px composition, change the mobile `.stageDisplayTitle` size from `7rem` to `6rem`. If a giant chapter numeral crosses the readable title, change its `inset` from `50% auto auto -0.07em` to `45% auto auto -0.07em`. Apply only the failing adjustment; do not change semantic role tokens or other case-study layouts.

- [ ] **Step 6: Commit browser regression coverage and any Convo-only decorative adjustment**

```bash
git add tests/e2e/portfolio-detail-system.spec.ts tests/e2e/convo-ai.spec.ts components/convo-ai/convo-ai-layout.module.css components/convo-ai/convo-ai-media.module.css
git commit -m "test: verify Convo AI heading hierarchy"
```

### Task 6: Full Verification And Branch Handoff

**Files:**
- Verify only; no unrelated edits.

- [ ] **Step 1: Run all Convo AI unit and component coverage**

Run:

```bash
npm test -- tests/unit/convo-ai-heading-system.test.ts tests/unit/convo-ai-content.test.ts tests/unit/convo-ai-assets.test.ts tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the shared heading and browser regression coverage**

Run:

```bash
npm test -- tests/unit/portfolio-detail-system.test.ts
npx playwright test tests/e2e/portfolio-detail-system.spec.ts tests/e2e/convo-ai.spec.ts
```

Expected: PASS across desktop, tablet, and mobile Playwright projects.

- [ ] **Step 3: Run static quality checks and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit successfully with no TypeScript, ESLint, MDX, or publication validation errors.

- [ ] **Step 4: Confirm branch scope and preserved user artifacts**

Run:

```bash
git status --short --branch
git diff --stat 95fbfcf...HEAD
git log --oneline --decorate --max-count=8
```

Expected: no tracked working-tree changes; `.playwright-cli/`, `output/`, and `tsconfig.tsbuildinfo` remain untracked and uncommitted; changes are limited to the Convo AI heading system, its tests, and the approved spec/plan.

- [ ] **Step 5: Request final code review before push**

Review against `docs/superpowers/specs/2026-07-24-convo-ai-heading-system-design.md`, with special attention to duplicate H1s, custom selector coverage, print hierarchy, responsive collisions, and accidental changes outside Convo AI.

- [ ] **Step 6: Push only after the review is clean**

Run:

```bash
git push origin codex/case/convo-ai-build
```

Expected: remote branch `origin/codex/case/convo-ai-build` advances to the reviewed local `HEAD`.
