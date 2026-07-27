# Homepage Hero UI/UX Role Line Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the approved Chinese designer summary and add a localized UI/UX role line beneath the designer summary on the homepage hero.

**Architecture:** Keep localized copy in the existing dictionaries, pass the new `designerCredit` field through `DualIdentityHero`, and render it as a separate paragraph in `HeroMotion`. A dedicated CSS class controls only the vertical gap; typography and color continue to come from the existing `.heroRole p` rule.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Modify `content/dictionaries/en.ts`: declare and provide the English role line.
- Modify `content/dictionaries/zh.ts`: restore the Chinese summary and provide the Chinese role line.
- Modify `components/home/dual-identity-hero.tsx`: pass localized role copy into the motion component.
- Modify `components/home/hero-motion.tsx`: render the role as a separate paragraph.
- Modify `components/home/home.module.css`: add the approved one-line vertical gap while preserving existing responsive hiding.
- Modify `tests/component/homepage.test.tsx`: lock the localized copy and independent DOM line.
- Modify `tests/e2e/homepage.spec.ts`: verify desktop visibility and mobile responsive hiding.

### Task 1: Define The Localized Hero Contract

**Files:**
- Modify: `tests/component/homepage.test.tsx:17-85`
- Modify: `content/dictionaries/en.ts:33-42,180-190`
- Modify: `content/dictionaries/zh.ts:33-44`
- Modify: `components/home/dual-identity-hero.tsx:10-27`
- Modify: `components/home/hero-motion.tsx:23-34,55-68,448-458`
- Modify: `components/home/home.module.css:218-225`

- [ ] **Step 1: Write failing localized component assertions**

Update the two `DualIdentityHero` tests so they require the approved summaries and role lines:

```tsx
it('renders the approved English designer summary and independent role line', () => {
  const { container } = render(<DualIdentityHero locale="en" />);

  expect(
    screen.getByText('Designing at consumer scale and across complex AI and B2B systems.'),
  ).toBeVisible();
  expect(screen.getByText('UI / UX Designer')).toBeVisible();
  expect(
    container.querySelector('[data-designer-credit]'),
  ).toHaveTextContent('UI / UX Designer');
});

it('keeps the role titles in English and renders the approved Chinese designer copy', () => {
  const { container } = render(<DualIdentityHero locale="zh" />);

  expect(screen.getByRole('heading', { level: 2, name: 'Product Designer' })).toBeVisible();
  expect(screen.getByRole('heading', { level: 2, name: 'AI-native Builder' })).toBeVisible();
  expect(
    screen.getByText('专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。'),
  ).toBeVisible();
  expect(screen.getByText('UI / UX 设计师')).toBeVisible();
  expect(
    container.querySelector('[data-designer-credit]'),
  ).toHaveTextContent('UI / UX 设计师');
  expect(
    screen.getByText('用 Vibe Coding 快速搭建可运行原型，让产品思路更早进入体验和讨论。'),
  ).toBeVisible();
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx --reporter=dot
```

Expected: FAIL because `UI / UX Designer`, `UI / UX 设计师`, and `[data-designer-credit]` do not exist, and the Chinese summary still contains the newer editorial sentence.

- [ ] **Step 3: Add the localized dictionary field**

Extend the English dictionary type and values:

```ts
hero: {
  name: string;
  designerRole: string;
  builderRole: string;
  designerSummary: string;
  designerCredit: string;
  builderSummary: string;
  portraitDraft: string;
  portraitLabel: string;
};
```

```ts
designerSummary:
  'Designing at consumer scale and across complex AI and B2B systems.',
designerCredit: 'UI / UX Designer',
```

Update the Chinese values:

```ts
designerSummary: '专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。',
designerCredit: 'UI / UX 设计师',
```

- [ ] **Step 4: Pass and render the independent role line**

Pass the new field from `DualIdentityHero`:

```tsx
designerSummary={copy.designerSummary}
designerCredit={copy.designerCredit}
builderSummary={copy.builderSummary}
```

Add it to `HeroMotionProps` and the component destructuring:

```ts
readonly designerSummary: string;
readonly designerCredit: string;
readonly builderSummary: string;
```

Render the new line immediately after the summary:

```tsx
<p>{designerSummary}</p>
<p className={styles.designerCredit} data-designer-credit>
  {designerCredit}
</p>
```

- [ ] **Step 5: Add the one-line vertical gap**

Add a higher-specificity rule after `.heroRole p` so the line inherits the same size and color while receiving its own spacing:

```css
.heroRole .designerCredit {
  margin-block-start: 1.5em;
}
```

Do not add a mobile override. The existing narrow-breakpoint rule `.heroRole p { display: none; }` must continue to hide both paragraphs together.

- [ ] **Step 6: Run the component test and verify GREEN**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx --reporter=dot
```

Expected: PASS.

- [ ] **Step 7: Commit the localized hero contract**

```bash
git add content/dictionaries/en.ts content/dictionaries/zh.ts components/home/dual-identity-hero.tsx components/home/hero-motion.tsx components/home/home.module.css tests/component/homepage.test.tsx
git commit -m "feat: add localized UI UX hero role"
```

### Task 2: Verify Responsive Presentation

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write the responsive browser test**

Add a homepage framework test that checks the existing breakpoints without changing the page layout:

```ts
test('shows the localized UI UX role with the hero summary at supported widths', async ({
  page,
}, testInfo) => {
  await page.goto('/zh/', { waitUntil: 'domcontentloaded' });

  const summary = page.getByText('专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。');
  const credit = page.locator('[data-designer-credit]');

  if (testInfo.project.name === 'mobile') {
    await expect(summary).toBeHidden();
    await expect(credit).toBeHidden();
  } else {
    await expect(summary).toBeVisible();
    await expect(credit).toBeVisible();
    await expect(credit).toHaveText('UI / UX 设计师');
  }
});
```

- [ ] **Step 2: Run the responsive test and verify it passes**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --grep "shows the localized UI UX role" --project=desktop --project=tablet --project=mobile --reporter=line
```

Expected: 3 passed.

- [ ] **Step 3: Run focused regression checks**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx tests/unit/home-content.test.ts --reporter=dot
```

Expected: both test files pass.

Run:

```bash
npm run lint
```

Expected: exit code 0; existing warnings are acceptable, new errors are not.

Run:

```bash
npm run build
```

Expected: source validation, Next.js production build, static generation, and output validation pass.

- [ ] **Step 4: Commit responsive verification**

```bash
git add tests/e2e/homepage.spec.ts
git commit -m "test: verify responsive hero role line"
```

### Task 3: Final Scope Review

**Files:**
- Verify only; no planned source changes.

- [ ] **Step 1: Confirm the CTA and unrelated modules are unchanged**

Run:

```bash
git diff 459d6d6..HEAD -- content/dictionaries/zh.ts components/home tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
```

Expected: only hero summary, role-line plumbing, role-line styling, and related tests differ. AIDX and STT action strings remain unchanged.

- [ ] **Step 2: Check repository cleanliness and patch formatting**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors. The user-owned untracked file `docs/superpowers/plans/2026-07-27-meeting-popup-editorial-board-implementation.md` remains untracked and untouched.
