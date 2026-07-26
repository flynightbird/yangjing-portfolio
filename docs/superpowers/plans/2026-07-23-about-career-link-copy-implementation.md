# About Career Link and Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the localized About career timeline copy and make the current Agora employer name an accessible external link with portfolio-purple interaction states.

**Architecture:** Keep the existing localized `copy` object as the single source of truth. Extend `TimelineEntry` with optional link and description fields, then let the existing timeline renderer conditionally compose linked employer text without introducing a new component or changing timeline structure.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, browser visual verification.

---

### Task 1: Lock the localized timeline contract

**Files:**
- Modify: `tests/component/about-page.test.tsx:80-133`

- [ ] **Step 1: Add failing English timeline assertions**

Add these assertions after the existing English timeline checks:

```tsx
expect(screen.getByText('Research & Design')).toBeVisible();
expect(screen.queryByText('Research & Interaction')).not.toBeInTheDocument();
expect(screen.getByText('Product Designer (UI/UX)')).toBeVisible();

const agoraLink = within(timeline as HTMLElement).getByRole('link', { name: 'Agora' });
expect(agoraLink).toHaveAttribute('href', 'https://www.agora.io/');
expect(agoraLink).toHaveAttribute('target', '_blank');
expect(agoraLink).toHaveAttribute('rel', 'noreferrer');
expect(
  screen.queryByText('全球领先的对话式 AI 与实时音视频云服务商', { exact: false }),
).not.toBeInTheDocument();
```

- [ ] **Step 2: Add failing Chinese timeline assertions**

Add these assertions after the existing Chinese timeline checks:

```tsx
expect(screen.getByText('研究与设计')).toBeVisible();
expect(screen.queryByText('研究与交互')).not.toBeInTheDocument();
expect(screen.getByText('产品设计师（UI/UX）')).toBeVisible();

const timeline = container.querySelector('[data-about-timeline]');
expect(timeline).not.toBeNull();
const shengwangLink = within(timeline as HTMLElement).getByRole('link', {
  name: '声网 Agora',
});
expect(shengwangLink).toHaveAttribute('href', 'https://www.shengwang.cn/');
expect(shengwangLink).toHaveAttribute('target', '_blank');
expect(shengwangLink).toHaveAttribute('rel', 'noreferrer');
expect(
  within(timeline as HTMLElement).getByText(
    '（全球领先的对话式 AI 与实时音视频云服务商）',
  ),
).toBeVisible();
```

- [ ] **Step 3: Run the focused test and verify the new contract fails**

Run:

```bash
npx vitest run tests/component/about-page.test.tsx
```

Expected: FAIL because the new titles, roles, links, and Chinese description are not rendered yet.

### Task 2: Extend timeline data and render the employer link

**Files:**
- Modify: `components/about/about-page.tsx:19-25`
- Modify: `components/about/about-page.tsx:85-121`
- Modify: `components/about/about-page.tsx:174-210`
- Modify: `components/about/about-page.tsx:507-515`

- [ ] **Step 1: Extend the timeline entry contract**

Update the interface to support the two optional localized fields:

```tsx
interface TimelineEntry {
  readonly tone: Capability['tone'];
  readonly date: string;
  readonly title: string;
  readonly company: string;
  readonly companyHref?: string;
  readonly companyDescription?: string;
  readonly role: string;
}
```

- [ ] **Step 2: Update the approved English timeline copy**

Change the first and current entries to:

```tsx
{
  tone: 'ux',
  date: '2010–2016',
  title: 'Research & Design',
  company: 'ZTE · 99bill',
  role: 'User research & mobile UX',
},
```

```tsx
{
  tone: 'ux',
  date: '2022.07–Present',
  title: 'AI & Real-Time',
  company: 'Agora',
  companyHref: 'https://www.agora.io/',
  role: 'Product Designer (UI/UX)',
},
```

- [ ] **Step 3: Update the approved Chinese timeline copy**

Change the first and current entries to:

```tsx
{
  tone: 'ux',
  date: '2010–2016',
  title: '研究与设计',
  company: '中兴 · 快钱',
  role: '用户研究与移动 UX',
},
```

```tsx
{
  tone: 'ux',
  date: '2022.07–至今',
  title: 'AI 与实时互动',
  company: '声网 Agora',
  companyHref: 'https://www.shengwang.cn/',
  companyDescription: '（全球领先的对话式 AI 与实时音视频云服务商）',
  role: '产品设计师（UI/UX）',
},
```

- [ ] **Step 4: Render linked and unlinked employers without changing list semantics**

Replace the company paragraph with:

```tsx
<p className={styles.timelineCompany}>
  {entry.companyHref ? (
    <a href={entry.companyHref} target="_blank" rel="noreferrer">
      {entry.company}
    </a>
  ) : (
    entry.company
  )}
  {entry.companyDescription ? <span>{entry.companyDescription}</span> : null}
</p>
```

- [ ] **Step 5: Run the focused component test**

Run:

```bash
npx vitest run tests/component/about-page.test.tsx
```

Expected: PASS, 2 tests passed.

### Task 3: Add accessible portfolio-purple interaction styling

**Files:**
- Modify: `components/about/about-page.module.css:591-601`

- [ ] **Step 1: Add scoped company-link styles**

Add after the base `.timeline p` rule:

```css
.timelineCompany a {
  color: inherit;
  text-decoration-color: transparent;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.22em;
  transition: color 180ms ease-out, text-decoration-color 180ms ease-out;
}

.timelineCompany a:hover,
.timelineCompany a:focus-visible {
  color: var(--about-leadership);
  text-decoration-color: currentColor;
}

.timelineCompany a:focus-visible {
  border-radius: 2px;
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.timelineCompany span {
  color: #8d928a;
}
```

- [ ] **Step 2: Disable the link transition for reduced motion**

Inside the existing `@media (prefers-reduced-motion: reduce)` block, add:

```css
.timelineCompany a {
  transition: none;
}
```

- [ ] **Step 3: Run focused lint and tests**

Run:

```bash
npx eslint components/about/about-page.tsx tests/component/about-page.test.tsx
npx vitest run tests/component/about-page.test.tsx tests/unit/architecture.test.ts
git diff --check
```

Expected: ESLint exits with 0 errors; both test files pass; `git diff --check` produces no output.

- [ ] **Step 4: Commit the implementation**

```bash
git add components/about/about-page.tsx components/about/about-page.module.css tests/component/about-page.test.tsx
git commit -m "feat: link Agora in About timeline"
```

### Task 4: Verify responsive rendering and interaction

**Files:**
- Verify: `components/about/about-page.tsx`
- Verify: `components/about/about-page.module.css`

- [ ] **Step 1: Open both localized routes on desktop**

Open `/en/about/` and `/zh/about/` at a desktop viewport. Confirm the English timeline shows only linked `Agora`, while the Chinese timeline shows linked `声网 Agora` followed by the non-link description.

- [ ] **Step 2: Verify interaction states**

Hover and keyboard-focus each employer link. Confirm the text changes to portfolio purple, the underline becomes visible, and keyboard focus has a visible outline.

- [ ] **Step 3: Verify mobile wrapping**

At 390px width, open `/zh/about/` and confirm the company description wraps within the timeline column without horizontal overflow or overlap.

- [ ] **Step 4: Run final focused verification**

Run:

```bash
npx vitest run tests/component/about-page.test.tsx tests/unit/architecture.test.ts
npx eslint components/about/about-page.tsx tests/component/about-page.test.tsx
git status --short
```

Expected: Tests and ESLint pass. `git status --short` shows only the pre-existing `next-env.d.ts` development-server modification, if still present.
