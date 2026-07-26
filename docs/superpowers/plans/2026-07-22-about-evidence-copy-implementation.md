# About Evidence Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About evidence-section build-boundary supporting copy in both locales and remove the self-reported-results footnote element and its spacing.

**Architecture:** Keep the existing localized copy object and three-card evidence grid. Update the two localized supporting strings, delete the unused footnote fields and shared JSX node, and remove the now-dead CSS rule. Protect the exact copy and element removal through the existing About component test.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Modify `tests/component/about-page.test.tsx`: lock exact English/Chinese supporting copy and removal of both former footnotes.
- Modify `components/about/about-page.tsx`: update localized copy, delete footnote data, and remove the rendered footnote node.
- Modify `components/about/about-page.module.css`: remove the unused `.evidenceNote` rule so no obsolete spacing remains.

### Task 1: Update the About evidence copy and remove the footnote

**Files:**
- Modify: `tests/component/about-page.test.tsx`
- Modify: `components/about/about-page.tsx`
- Modify: `components/about/about-page.module.css`

- [ ] **Step 1: Write failing bilingual component assertions**

Replace the old build-boundary assertions and add footnote-absence checks:

```tsx
it('presents the approved English capability and career structure', () => {
  const { container } = render(<AboutPage locale="en" />);

  // Keep the existing hero, capability, timeline, and ownership assertions.
  expect(screen.getByText('Independent experience validation')).toBeVisible();
  expect(
    screen.getByText(
      'Rapidly build interactive HTML with product logic using Codex and Claude.',
    ),
  ).toBeVisible();
  expect(
    screen.queryByText('* Outcomes are self-reported from my resume.'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Not complex production backends')).not.toBeInTheDocument();
});

it('provides the approved Chinese evidence copy', () => {
  const { container } = render(<AboutPage locale="zh" />);

  // Keep the existing hero, career, and ownership assertions.
  expect(screen.getByText('可独立完成体验验证')).toBeVisible();
  expect(
    screen.getByText('通过 Codex、Claude 快速搭建涵盖产品逻辑的交互式 HTML'),
  ).toBeVisible();
  expect(
    screen.queryByText('* 结果数据来自个人履历中的自述。'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('不承担复杂生产级后端开发')).not.toBeInTheDocument();
});
```

Do not remove the existing assertions for the page title, four capability cards, five timeline entries, company names, roles, `AIDX` absence, or `ship` ownership boundary.

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
npx vitest run tests/component/about-page.test.tsx
```

Expected: FAIL because the new English and Chinese supporting strings are absent and the old footnotes remain rendered. There must be no syntax, import, or selector error.

- [ ] **Step 3: Update the localized copy and remove the footnote data**

In `components/about/about-page.tsx`, keep each evidence tuple's first two values unchanged and replace only the third value of the build-boundary row:

```ts
['Build boundary', 'Independent experience validation',
  'Rapidly build interactive HTML with product logic using Codex and Claude.'],
```

```ts
['构建边界', '可独立完成体验验证',
  '通过 Codex、Claude 快速搭建涵盖产品逻辑的交互式 HTML'],
```

Delete both localized `evidenceNote` properties:

```ts
evidenceNote: '* Outcomes are self-reported from my resume.',
evidenceNote: '* 结果数据来自个人履历中的自述。',
```

Delete the shared rendered node after `.evidenceGrid`:

```tsx
<p className={styles.evidenceNote}>{content.evidenceNote}</p>
```

Do not add an empty replacement element, conditional spacer, or disclaimer.

- [ ] **Step 4: Remove the dead footnote CSS**

Delete the complete rule from `components/about/about-page.module.css`:

```css
.evidenceNote {
  margin: 1.25rem 0 0;
  color: var(--about-tertiary);
  font-size: 0.75rem;
}
```

Do not change `.evidenceBand`, `.evidenceGrid`, card padding, breakpoints, colors, or typography.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/component/about-page.test.tsx tests/component/draft-case.test.tsx
```

Expected: both files PASS, with the evidence grid still containing the existing three localized cards.

- [ ] **Step 6: Run static checks**

Run:

```bash
npx eslint components/about/about-page.tsx tests/component/about-page.test.tsx
npm run build:framework
git diff --check
```

Expected: ESLint and `git diff --check` exit 0. `build:framework` generates the localized About routes without a TypeScript or rendering error.

- [ ] **Step 7: Verify the rendered About pages**

At `1440x1000` and `390x844`, inspect `/en/about/` and `/zh/about/` and confirm:

- The evidence grid still has three cards in the same order.
- The third-card title is unchanged.
- The approved localized supporting copy is visible and wraps within the card.
- The old supporting copy and both footnotes are absent.
- No empty footnote row, clipping, horizontal overflow, or changed card geometry appears.

- [ ] **Step 8: Commit the implementation**

```bash
git add tests/component/about-page.test.tsx components/about/about-page.tsx components/about/about-page.module.css
git commit -m "copy: refine About build evidence"
```

## Completion Criteria

- Both locales render the exact approved supporting copy.
- Both former footnote strings and the footnote DOM node are absent.
- The obsolete CSS spacing rule is removed.
- The evidence grid remains three cards with unchanged labels, titles, ordering, and visual design.
- Focused tests, lint, and framework build pass.
- Desktop and mobile About pages show no residual gap or overflow.
