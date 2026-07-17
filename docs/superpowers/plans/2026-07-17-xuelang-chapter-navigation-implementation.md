# Xuelang Chapter Navigation Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render one `00-07` sequence in Xuelang chapter navigation, remove its active marker, and use Xuelang green for hover and keyboard focus without changing other case studies.

**Architecture:** Keep chapter labels semantic and move visual numbering entirely into `ChapterNav`. Add optional presentation props with defaults matching existing shared behavior; `XuelangLayout` alone opts into zero-based numbering and the Xuelang treatment.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

---

### Task 1: Define The Contract With Failing Tests

**Files:**
- Modify: `tests/component/case-study.test.tsx`
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/unit/xuelang-content.test.ts`

- [x] **Step 1: Add a component test for zero-based numbering**

```tsx
const { container } = render(
  <ChapterNav chapters={chapters} locale="en" indexStart={0} variant="xuelang" />,
);
expect(container.querySelector('[data-chapter-index="00"]')).toBeInTheDocument();
expect(container.querySelector('[data-chapter-index="01"]')).toBeInTheDocument();
expect(container.querySelector('[data-chapter-variant="xuelang"]')).toBeInTheDocument();
```

- [x] **Step 2: Protect default numbering**

```tsx
const { container } = render(<ChapterNav chapters={chapters} locale="en" />);
expect(container.querySelector('[data-chapter-index="01"]')).toBeInTheDocument();
expect(container.querySelector('[data-chapter-index="02"]')).toBeInTheDocument();
```

- [x] **Step 3: Reject numeric prefixes in Xuelang labels**

```ts
expect(zh).not.toMatch(/label:\s*['"]\d{2}\s/);
expect(en).not.toMatch(/label:\s*['"]\d{2}\s/);
```

- [x] **Step 4: Run tests and verify RED**

Run `npx vitest run tests/component/case-study.test.tsx tests/component/xuelang-layout.test.tsx tests/unit/xuelang-content.test.ts`.

Expected: FAIL because the presentation props and data attributes do not exist and labels still contain prefixes.

### Task 2: Implement The Xuelang-Only Presentation

**Files:**
- Modify: `components/case-study/chapter-nav.tsx`
- Modify: `components/case-study/chapter-nav.module.css`
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`

- [x] **Step 1: Add optional component props**

```tsx
readonly indexStart?: number;
readonly variant?: 'default' | 'xuelang';
```

Default to `indexStart={1}` and `variant="default"`. Render `String(index + indexStart).padStart(2, '0')`, add `data-chapter-index` to the number span, and add `data-chapter-variant` to the root.

- [x] **Step 2: Opt Xuelang into zero-based numbering**

```tsx
<ChapterNav
  chapters={meta.chapters ?? []}
  locale={locale}
  compactAt="wide"
  indexStart={0}
  variant="xuelang"
/>
```

- [x] **Step 3: Normalize bilingual labels**

Change labels such as `00 项目概览` and `00 Overview` to `项目概览` and `Overview`, preserving IDs and order.

- [x] **Step 4: Scope visual changes to Xuelang**

```css
.root[data-chapter-variant='xuelang'] .navigation a:hover,
.root[data-chapter-variant='xuelang'] .navigation a:focus-visible {
  color: #466b52;
}

.root[data-chapter-variant='xuelang'] .navigation a[aria-current='location'] {
  box-shadow: none;
}
```

- [x] **Step 5: Run focused tests and verify GREEN**

Run the Task 1 Vitest command. Expected: all selected tests pass.

### Task 3: Regression And Visual Verification

**Files:**
- Verify: `components/case-study/chapter-nav.tsx`
- Verify: `components/case-study/chapter-nav.module.css`
- Verify: `content/work/xuelang.zh.mdx`
- Verify: `content/work/xuelang.en.mdx`

- [x] **Step 1: Run lint and all tests**

Run `npm run lint` and `npm test -- --maxWorkers=1`.

Expected: zero lint errors and all Vitest tests pass.

- [x] **Step 2: Build production output**

Run `npm run build:framework`. Expected: Next.js build exits successfully.

- [x] **Step 3: Verify the live page**

At `http://localhost:4174/zh/work/xuelang/`, verify numbers appear once, the active item has no inset marker, hover/focus resolves to `rgb(70, 107, 82)`, and the document has no horizontal overflow.

- [x] **Step 4: Commit only scoped files**

Stage the component, Xuelang layout, bilingual content, focused tests, and this plan. Commit with `fix: correct Xuelang chapter navigation`.
