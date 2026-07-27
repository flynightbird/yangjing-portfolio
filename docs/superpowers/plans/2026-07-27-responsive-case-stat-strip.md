# Responsive Case Stat Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one reusable case-study fact strip that preserves single-line values while readable, changes layout before shrinking too far, and migrates the Xuelang business-context facts without changing their copy or visual identity.

**Architecture:** A shared `CaseStatStrip` React component owns semantic `dl` markup and deterministic short/medium/long density tiers. A colocated CSS Module owns container-query layout and typography; case pages customize only semantic CSS variables and placement. Xuelang imports the component from MDX and removes its duplicated fact-strip structure rules.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, CSS Modules, CSS container queries, Vitest, Testing Library, Playwright

---

## File Map

- Create `components/case-study/case-stat-strip.tsx`: shared public component and density classifier.
- Create `components/case-study/case-stat-strip.module.css`: shared structure, three responsive tiers, and theme-variable defaults.
- Create `tests/component/case-stat-strip.test.tsx`: semantics and density classification.
- Create `tests/unit/case-stat-strip-styles.test.ts`: source-level guard for container rules, readable minima, and overflow policy.
- Modify `content/work/xuelang.zh.mdx`: replace the raw Chinese definition list with the shared component.
- Modify `content/work/xuelang.en.mdx`: replace the raw English definition list with the shared component.
- Modify `components/xuelang/xuelang-layout.module.css`: retain only Xuelang placement/theme overrides and remove duplicated responsive internals.
- Modify `tests/component/xuelang-layout.test.tsx`: verify the real Xuelang page renders one shared strip with unchanged content.
- Modify `tests/e2e/xuelang.spec.ts`: verify single-line fit, layout mode changes, narrow behavior, zoom, and horizontal containment.

### Task 1: Add the semantic component and deterministic density tiers

**Files:**
- Create: `components/case-study/case-stat-strip.tsx`
- Create: `tests/component/case-stat-strip.test.tsx`

- [ ] **Step 1: Write the failing component test**

Create `tests/component/case-stat-strip.test.tsx`:

```tsx
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  CaseStatStrip,
  getCaseStatDensity,
} from '@/components/case-study/case-stat-strip';

afterEach(cleanup);

describe('CaseStatStrip', () => {
  it.each([
    ['500K DAU', 'short'],
    ['DAU 50w（约 50万）', 'medium'],
    ['Transaction → Learning relationship', 'long'],
  ] as const)('classifies %s as %s', (value, expected) => {
    expect(getCaseStatDensity(value)).toBe(expected);
  });

  it('renders one semantic definition list without responsive duplicates', () => {
    const { container } = render(
      <CaseStatStrip
        label="Business context"
        className="case-theme"
        items={[
          { label: 'Platform scale', value: '500K DAU' },
          { label: 'Business ambition', value: 'RMB 30B annual GMV' },
          { label: 'Experience shift', value: 'Transaction → Learning relationship' },
        ]}
      />,
    );

    const strip = container.querySelector('[data-case-stat-strip]');
    expect(strip).toHaveClass('case-theme');
    const list = screen.getByLabelText('Business context');
    expect(list.tagName).toBe('DL');
    expect(within(list).getAllByRole('term')).toHaveLength(3);
    expect(list.querySelectorAll('dd')).toHaveLength(3);
    expect(list.querySelectorAll('[data-stat-density]')).toHaveLength(3);
    expect(list.querySelector('[data-stat-density="short"]')).toHaveTextContent('500K DAU');
    expect(list.querySelector('[data-stat-density="medium"]')).toHaveTextContent('RMB 30B annual GMV');
    expect(list.querySelector('[data-stat-density="long"]')).toHaveTextContent(
      'Transaction → Learning relationship',
    );
  });
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
npm test -- tests/component/case-stat-strip.test.tsx
```

Expected: FAIL because `@/components/case-study/case-stat-strip` does not exist.

- [ ] **Step 3: Implement the minimal semantic component**

Create `components/case-study/case-stat-strip.tsx`:

```tsx
import styles from './case-stat-strip.module.css';

export type CaseStatDensity = 'short' | 'medium' | 'long';

export interface CaseStatItem {
  readonly label: string;
  readonly value: string;
}

export interface CaseStatStripProps {
  readonly label: string;
  readonly items: readonly CaseStatItem[];
  readonly className?: string;
}

export function getCaseStatDensity(value: string): CaseStatDensity {
  const length = Array.from(value.trim()).length;
  if (length <= 10) return 'short';
  if (length <= 20) return 'medium';
  return 'long';
}

export function CaseStatStrip({
  label,
  items,
  className,
}: CaseStatStripProps) {
  return (
    <div
      className={[styles.container, className].filter(Boolean).join(' ')}
      data-case-stat-strip
    >
      <dl className={styles.list} aria-label={label}>
        {items.map((item) => (
          <div
            className={styles.item}
            data-stat-density={getCaseStatDensity(item.value)}
            key={`${item.label}:${item.value}`}
          >
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

Create an empty `components/case-study/case-stat-strip.module.css` so the module import resolves:

```css
.container,
.list,
.item,
.label,
.value {
  min-width: 0;
}
```

- [ ] **Step 4: Run the component test and verify GREEN**

Run:

```bash
npm test -- tests/component/case-stat-strip.test.tsx
```

Expected: 1 file passes and all 4 tests pass.

- [ ] **Step 5: Commit the semantic component**

```bash
git add components/case-study/case-stat-strip.tsx components/case-study/case-stat-strip.module.css tests/component/case-stat-strip.test.tsx
git commit -m "feat: add semantic case stat strip"
```

### Task 2: Encode the responsive typography and layout contract

**Files:**
- Modify: `components/case-study/case-stat-strip.module.css`
- Create: `tests/unit/case-stat-strip-styles.test.ts`

- [ ] **Step 1: Write the failing CSS contract test**

Create `tests/unit/case-stat-strip-styles.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  new URL('../../components/case-study/case-stat-strip.module.css', import.meta.url),
  'utf8',
);

describe('case stat strip styles', () => {
  it('uses a named inline-size container with three layout tiers', () => {
    expect(css).toContain('container: case-stat-strip / inline-size');
    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(css).toMatch(/@container case-stat-strip \(max-width: 69\.999rem\)/);
    expect(css).toMatch(/@container case-stat-strip \(max-width: 26rem\)/);
  });

  it('keeps readable values single-line until the narrow tier', () => {
    expect(css).toMatch(/\.value\s*\{[^}]*white-space:\s*nowrap/s);
    expect(css).toMatch(
      /@container case-stat-strip \(max-width: 26rem\)[\s\S]*\.value\s*\{[^}]*white-space:\s*normal/,
    );
    expect(css).toContain('text-wrap: balance');
    expect(css).not.toContain('text-overflow: ellipsis');
    expect(css).not.toContain('overflow-x: auto');
  });

  it('defines the approved density ranges without negative tracking', () => {
    expect(css).toContain('clamp(1.75rem, 2.5cqi, 2.5rem)');
    expect(css).toContain('clamp(1.625rem, 2.125cqi, 2.125rem)');
    expect(css).toContain('clamp(1.5rem, 1.875cqi, 1.875rem)');
    expect(css).toContain('letter-spacing: 0');
  });
});
```

- [ ] **Step 2: Run the style test and verify RED**

Run:

```bash
npm test -- tests/unit/case-stat-strip-styles.test.ts
```

Expected: FAIL because the CSS contract is not implemented.

- [ ] **Step 3: Implement the shared responsive CSS**

Replace `components/case-study/case-stat-strip.module.css` with:

```css
.container {
  min-width: 0;
  container: case-stat-strip / inline-size;
  --case-stat-label-color: currentcolor;
  --case-stat-value-color: currentcolor;
  --case-stat-line-color: rgb(17 21 18 / 18%);
  --case-stat-item-padding: 1.5rem;
  --case-stat-label-font: inherit;
  --case-stat-value-font: inherit;
}

.list {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 0;
  margin: 0;
  border-block: 1px solid var(--case-stat-line-color);
}

.item {
  min-width: 0;
  padding: var(--case-stat-item-padding);
  border-inline-start: 1px solid var(--case-stat-line-color);
}

.item:first-child {
  border-inline-start: 0;
}

.label {
  color: var(--case-stat-label-color);
  font-family: var(--case-stat-label-font);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
}

.value {
  min-width: 0;
  margin: 1rem 0 0;
  color: var(--case-stat-value-color);
  font-family: var(--case-stat-value-font);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0;
  white-space: nowrap;
}

.item[data-stat-density='short'] .value {
  font-size: clamp(1.75rem, 2.5cqi, 2.5rem);
}

.item[data-stat-density='medium'] .value {
  font-size: clamp(1.625rem, 2.125cqi, 2.125rem);
}

.item[data-stat-density='long'] .value {
  font-size: clamp(1.5rem, 1.875cqi, 1.875rem);
}

@container case-stat-strip (max-width: 69.999rem) {
  .list {
    grid-template-columns: 1fr;
  }

  .item,
  .item:first-child {
    display: grid;
    grid-template-columns: minmax(8rem, 0.32fr) minmax(0, 1fr);
    align-items: baseline;
    gap: 1.5rem;
    border-inline-start: 0;
  }

  .item + .item {
    border-block-start: 1px solid var(--case-stat-line-color);
  }

  .value {
    margin: 0;
  }
}

@container case-stat-strip (max-width: 26rem) {
  .item,
  .item:first-child {
    display: block;
  }

  .value,
  .item[data-stat-density='short'] .value,
  .item[data-stat-density='medium'] .value,
  .item[data-stat-density='long'] .value {
    margin-block-start: 0.5rem;
    font-size: clamp(1.375rem, 7cqi, 1.625rem);
    white-space: normal;
    text-wrap: balance;
  }
}
```

- [ ] **Step 4: Run component and style tests and verify GREEN**

Run:

```bash
npm test -- tests/component/case-stat-strip.test.tsx tests/unit/case-stat-strip-styles.test.ts
```

Expected: 2 files pass and all 7 tests pass.

- [ ] **Step 5: Commit the responsive contract**

```bash
git add components/case-study/case-stat-strip.module.css tests/unit/case-stat-strip-styles.test.ts
git commit -m "style: define responsive case stat strip"
```

### Task 3: Migrate Xuelang and remove duplicated strip rules

**Files:**
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`
- Modify: `components/xuelang/xuelang-layout.module.css`
- Modify: `tests/component/xuelang-layout.test.tsx`

- [ ] **Step 1: Add the failing Xuelang integration assertions**

In the existing `renders the complete evidence sequence without a project promotion close` test in `tests/component/xuelang-layout.test.tsx`, add:

```tsx
    const contextStrip = container.querySelector('[data-case-stat-strip]');
    expect(contextStrip).toBeInTheDocument();
    expect(contextStrip).toHaveClass('xuelang-context-facts');
    expect(contextStrip?.querySelectorAll('dl')).toHaveLength(1);
    expect(contextStrip?.querySelectorAll('dd')).toHaveLength(3);
    expect(contextStrip).toHaveTextContent('DAU 50w（约 50万）');
    expect(contextStrip).toHaveTextContent('年度 GMV 300 亿');
    expect(contextStrip).toHaveTextContent('交易完成 → 长期学习关系');
```

- [ ] **Step 2: Run the Xuelang component test and verify RED**

Run:

```bash
npm test -- tests/component/xuelang-layout.test.tsx
```

Expected: FAIL because the current raw `dl` has no `data-case-stat-strip` root.

- [ ] **Step 3: Replace the Chinese raw list with the shared component**

Add this import to `content/work/xuelang.zh.mdx`:

```tsx
import { CaseStatStrip } from '@/components/case-study/case-stat-strip'
```

Replace the `xuelang-context-facts` `dl` with:

```tsx
  <CaseStatStrip
    label="业务背景数据"
    className="xuelang-context-facts"
    items={[
      { label: '平台规模', value: 'DAU 50w（约 50万）' },
      { label: '业务目标', value: '年度 GMV 300 亿' },
      { label: '体验转向', value: '交易完成 → 长期学习关系' },
    ]}
  />
```

- [ ] **Step 4: Replace the English raw list with the shared component**

Add the same import to `content/work/xuelang.en.mdx`, then replace its raw `dl` with:

```tsx
  <CaseStatStrip
    label="Business context"
    className="xuelang-context-facts"
    items={[
      { label: 'Platform scale', value: '500K DAU' },
      { label: 'Business ambition', value: 'RMB 30B annual GMV' },
      { label: 'Experience shift', value: 'Transaction → Learning relationship' },
    ]}
  />
```

- [ ] **Step 5: Reduce Xuelang CSS to placement and theme variables**

In `components/xuelang/xuelang-layout.module.css`:

1. Remove `.xuelang-context-facts` from the shared rule with `.xuelang-journey` and `.xuelang-problem-list`.
2. Replace the existing `.xuelang-context-facts`, child, `dt`, and `dd` rules with:

```css
.content :global(.xuelang-context-facts) {
  grid-column: 1 / -1;
  margin-block-start: 3rem;
  --case-stat-label-color: var(--xuelang-portfolio-accent);
  --case-stat-value-color: var(--xuelang-ink);
  --case-stat-line-color: var(--xuelang-line);
  --case-stat-label-font: var(--xuelang-font-mono);
  --case-stat-value-font: var(--xuelang-font-body);
}
```

3. Remove `.xuelang-context-facts` and its child rule from the mobile `display: block` and border-reset selectors. The shared component now owns those states.

- [ ] **Step 6: Run integration and content tests and verify GREEN**

Run:

```bash
npm test -- tests/component/case-stat-strip.test.tsx tests/component/xuelang-layout.test.tsx tests/unit/xuelang-content.test.ts tests/unit/case-stat-strip-styles.test.ts
```

Expected: 4 files pass with no changed Xuelang copy assertions.

- [ ] **Step 7: Commit the Xuelang migration**

```bash
git add content/work/xuelang.zh.mdx content/work/xuelang.en.mdx components/xuelang/xuelang-layout.module.css tests/component/xuelang-layout.test.tsx
git commit -m "refactor: use shared stat strip in Xuelang"
```

### Task 4: Verify fit behavior in a real browser

**Files:**
- Modify: `tests/e2e/xuelang.spec.ts`

- [ ] **Step 1: Add the responsive browser test**

Add this test inside `test.describe('Xuelang case study', ...)` in `tests/e2e/xuelang.spec.ts`:

```ts
  test('business facts preserve readable single lines before changing layout', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    const renderedLineCount = (selector: string) =>
      page.locator(selector).evaluateAll((nodes) =>
        nodes.map((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const tops = Array.from(range.getClientRects())
            .filter((rect) => rect.width > 0 && rect.height > 0)
            .map((rect) => Math.round(rect.top));
          return new Set(tops).size;
        }),
      );

    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto('/zh/work/xuelang/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const strip = page.locator('[data-case-stat-strip]');
    const list = strip.locator('dl');
    await expect(strip).toBeVisible();
    expect((await list.evaluate((node) => getComputedStyle(node).gridTemplateColumns)).split(' '))
      .toHaveLength(3);
    expect(await renderedLineCount('[data-case-stat-strip] dd')).toEqual([1, 1, 1]);

    await page.setViewportSize({ width: 1024, height: 900 });
    await expect
      .poll(() => list.evaluate((node) => getComputedStyle(node).gridTemplateColumns))
      .not.toContain(' ');
    expect(await renderedLineCount('[data-case-stat-strip] dd')).toEqual([1, 1, 1]);
    expect(await strip.locator('dd').first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize)))
      .toBeGreaterThanOrEqual(24);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() => strip.locator('dd').first().evaluate((node) => getComputedStyle(node).whiteSpace))
      .toBe('normal');
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )).toBeLessThanOrEqual(1);

    // A 720px CSS viewport is the layout width of a 1440px window at 200% zoom.
    await page.setViewportSize({ width: 720, height: 900 });
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )).toBeLessThanOrEqual(1);
  });
```

- [ ] **Step 2: Run the focused E2E test**

Start the Xuelang worktree server on port `4422`:

```bash
npm run dev -- --hostname 127.0.0.1 --port 4422
```

In a second terminal session, run:

```bash
PW_REUSE_SERVER=1 PW_PORT=4422 npx playwright test tests/e2e/xuelang.spec.ts --grep "business facts preserve" --project=desktop
```

Expected: the server reports ready at `http://127.0.0.1:4422`, then 1 test passes. If port `4422` is already occupied, stop before running the browser test and select one explicit unused port for both commands.

- [ ] **Step 3: Run the complete Xuelang E2E suite**

Run:

```bash
PW_REUSE_SERVER=1 PW_PORT=4422 npx playwright test tests/e2e/xuelang.spec.ts tests/e2e/portfolio-detail-system.spec.ts --grep "Xuelang|xuelang" --project=desktop --project=mobile
```

Expected: all selected tests pass; device-specific tests may be skipped by their existing guards.

- [ ] **Step 4: Commit the browser regression test**

```bash
git add tests/e2e/xuelang.spec.ts
git commit -m "test: verify responsive case stat fit"
```

### Task 5: Complete repository verification

**Files:**
- Verify all changed files

- [ ] **Step 1: Run focused unit and component coverage**

```bash
npm test -- tests/component/case-stat-strip.test.tsx tests/component/xuelang-layout.test.tsx tests/unit/case-stat-strip-styles.test.ts tests/unit/xuelang-content.test.ts tests/unit/xuelang-assets.test.ts tests/unit/portfolio-detail-system.test.ts
```

Expected: all selected files and tests pass.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors. Existing Xuelang `<img>` warnings may remain; no new warnings are introduced.

- [ ] **Step 3: Run the framework production build**

```bash
npm run build:framework
```

Expected: Next.js compiles, TypeScript passes, and all static routes generate successfully.

- [ ] **Step 4: Check generated and repository state**

```bash
git diff --check
git status --short
git diff -- next-env.d.ts
```

Expected: no whitespace errors, no generated output staged or tracked, and no `next-env.d.ts` diff.

- [ ] **Step 5: Review the final diff against the approved scope**

```bash
git diff --stat HEAD~3..HEAD
git diff HEAD~3..HEAD -- components/case-study/case-stat-strip.tsx components/case-study/case-stat-strip.module.css components/xuelang/xuelang-layout.module.css content/work/xuelang.zh.mdx content/work/xuelang.en.mdx
```

Expected: only the shared stat strip, Xuelang migration, and their tests changed; hero metadata, result cards, copy, and unrelated case styles remain untouched.
