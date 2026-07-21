# Portfolio Detail Navigation and Type System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every portfolio detail page one readable two-theme header, one neutral/iris chapter navigation, and one editorial heading hierarchy while preserving each project's independent body layout.

**Architecture:** Keep `SiteHeader` and `ChapterNav` as shared behavior boundaries. Add semantic header and heading tokens, resolve header theme by route category, and make each case layout consume only shared editorial metrics and portfolio accent semantics. Bespoke evidence modules and source media remain project-owned.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright.

**Repository constraint:** Preserve the dirty worktree. Do not stage or commit unless the user explicitly changes that instruction.

---

## File Map

- `components/shell/site-header.tsx`: resolve light/dark surface from each detail page's real opening surface.
- `components/shell/site-header.module.css`: own complete dark/light header token sets.
- `components/case-study/chapter-nav.module.css`: own neutral/iris chapter states.
- `app/globals.css`: own shared editorial H1/H2/H3 metrics.
- `components/case-study/case-layout.module.css`: consume heading tokens and remove cobalt editorial accents.
- `components/case-study/evidence-figure.module.css`: use iris for reusable evidence labels.
- `components/call-agent/call-agent-layout.module.css`: consume heading tokens and replace page-level blue.
- `components/call-agent/call-agent-system-stage.module.css`: inherit the portfolio active accent.
- `components/meeting/meeting-layout.module.css`: consume heading tokens and replace page-level orange.
- `components/meeting/meeting-evidence.module.css`: inherit the portfolio accent.
- `components/meeting/meeting-models.module.css`: inherit the portfolio accent.
- `components/xuelang/xuelang-layout.module.css`: consume heading tokens and replace editorial green, without recoloring product evidence modules.
- `tests/component/site-header.test.tsx`: cover route-category surface resolution.
- `tests/component/meeting-layout.test.tsx`: replace obsolete chapter-color assertions.
- `tests/unit/portfolio-detail-system.test.ts`: lock shared CSS contracts.
- `tests/e2e/portfolio-detail-system.spec.ts`: verify computed styles across representative pages.

### Task 1: Route-Aware Two-Theme Header

**Files:**
- Modify: `tests/component/site-header.test.tsx`
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`

- [ ] **Step 1: Write failing route-category tests**

Replace the Meeting-only test with:

```tsx
it.each([
  '/en/work/meeting/',
  '/zh/work/call-agent/',
  '/en/work/xuelang/',
])('marks detail route %s as light', (pathname) => {
  navigationMocks.pathname = pathname;
  render(<SiteHeader locale={pathname.startsWith('/zh/') ? 'zh' : 'en'} />);
  expect(screen.getByRole('banner')).toHaveAttribute('data-surface', 'light');
  cleanup();
});

it.each(['/zh/build/stt-demo/', '/en/work/tangping/'])(
  'keeps dark detail route %s dark',
  (pathname) => {
    navigationMocks.pathname = pathname;
    render(<SiteHeader locale={pathname.startsWith('/zh/') ? 'zh' : 'en'} />);
    expect(screen.getByRole('banner')).toHaveAttribute('data-surface', 'dark');
  },
);

it.each(['/en/', '/zh/'])('keeps home route %s dark', (pathname) => {
  navigationMocks.pathname = pathname;
  render(<SiteHeader locale={pathname.startsWith('/zh/') ? 'zh' : 'en'} />);
  expect(screen.getByRole('banner')).toHaveAttribute('data-surface', 'dark');
  cleanup();
});
```

- [ ] **Step 2: Run the test and verify the new detail cases fail**

Run: `npx vitest run tests/component/site-header.test.tsx`

Expected: Call Agent, Xuelang, and build-detail assertions fail because only Meeting currently resolves to `light`.

- [ ] **Step 3: Implement semantic route resolution**

Add to `site-header.tsx` and use the result for `data-surface`:

```tsx
function resolveHeaderSurface(pathname: string): 'light' | 'dark' {
  return /^\/(?:en|zh)\/work\/(?:call-agent|meeting|xuelang)\/?$/.test(pathname)
    ? 'light'
    : 'dark';
}
```

- [ ] **Step 4: Implement complete dark/light token sets**

Add the tokens below to `.root`, override them in the light selector, then replace hard-coded state colors with the tokens:

```css
.root {
  --header-fg: var(--color-paper);
  --header-hover: var(--color-iris-luminous);
  --header-hover-bg: rgba(200, 185, 255, 0.12);
  --header-separator: rgba(244, 245, 242, 0.2);
  --header-capsule-bg: rgba(14, 16, 15, 0.78);
  --header-capsule-border: rgba(244, 245, 242, 0.16);
  --header-capsule-shadow: 0 0.75rem 2.75rem rgba(0, 0, 0, 0.2);
  --header-menu-bg: rgba(14, 16, 15, 0.94);
  --header-menu-border: rgba(244, 245, 242, 0.16);
}

.root[data-surface='light'] {
  --header-fg: var(--theme-light-ink);
  --header-hover: var(--color-iris-deep);
  --header-hover-bg: rgba(95, 75, 134, 0.1);
  --header-separator: rgba(16, 17, 15, 0.2);
  --header-capsule-bg: rgba(255, 255, 255, 0.84);
  --header-capsule-border: rgba(16, 17, 15, 0.12);
  --header-capsule-shadow: 0 0.75rem 2.75rem rgba(16, 17, 15, 0.12);
  --header-menu-bg: rgba(255, 255, 255, 0.96);
  --header-menu-border: rgba(16, 17, 15, 0.12);
}

.capsule { color: var(--header-fg); }
.root[data-scrolled='true'] .capsule {
  border-color: var(--header-capsule-border);
  background: var(--header-capsule-bg);
  box-shadow: var(--header-capsule-shadow);
}
.separator { background: var(--header-separator); }
.mobileMenu nav {
  border-color: var(--header-menu-border);
  background: var(--header-menu-bg);
}
```

Point all hover rules at `--header-hover` and `--header-hover-bg`. Remove the old selectors that special-case only the unscrolled light state. Preserve geometry, blur, spacing, and timing.

- [ ] **Step 5: Run header tests**

Run: `npx vitest run tests/component/site-header.test.tsx`

Expected: all tests pass.

### Task 2: Shared Chapter Navigation

**Files:**
- Create: `tests/unit/portfolio-detail-system.test.ts`
- Modify: `components/case-study/chapter-nav.module.css`
- Modify: `tests/component/meeting-layout.test.tsx`

- [ ] **Step 1: Add failing CSS-contract tests**

Create the test file:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('portfolio detail visual system', () => {
  it('keeps chapter navigation neutral and line-free on desktop', () => {
    const css = read('components/case-study/chapter-nav.module.css');
    expect(css).toMatch(/--chapter-accent:\s*var\(--color-iris-deep\)/);
    expect(css).toMatch(/\.navigation a\s*\{[^}]*opacity:\s*0\.48/s);
    expect(css).toMatch(/a\[aria-current='location'\]\s*\{[^}]*font-weight:\s*600/s);
    expect(css).not.toMatch(/box-shadow:\s*inset\s+2px/);
    expect(css).not.toMatch(/color:\s*var\(--color-cobalt\)/);
  });
});
```

Update the Meeting layout test to expect `--chapter-accent` and `opacity: 0.48`, keeping its existing word-wrap assertions.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run tests/unit/portfolio-detail-system.test.ts tests/component/meeting-layout.test.tsx`

Expected: failures identify cobalt hover, row dividers, active inset rule, and the obsolete chapter-link token.

- [ ] **Step 3: Implement the shared visual states**

Use these declarations while preserving sticky and responsive behavior:

```css
.root {
  --chapter-ink: var(--theme-light-ink);
  --chapter-accent: var(--color-iris-deep);
}
.navigation { border: 0; }
.navigation a {
  border: 0;
  color: var(--chapter-ink);
  opacity: 0.48;
  transition: color var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out);
}
.navigation a:hover,
.navigation a:focus-visible {
  color: var(--chapter-accent);
  opacity: 1;
}
.navigation a:focus-visible {
  outline: 2px solid var(--chapter-accent);
  outline-offset: 2px;
}
.navigation a[aria-current='location'] {
  color: var(--chapter-ink);
  font-weight: 600;
  opacity: 1;
}
```

Keep only responsive container borders needed to frame the toggle and open disclosure.

- [ ] **Step 4: Run chapter tests**

Run: `npx vitest run tests/component/case-study.test.tsx tests/component/meeting-layout.test.tsx tests/unit/portfolio-detail-system.test.ts`

Expected: all selected tests pass.

### Task 3: Shared Editorial Heading Tokens

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts`
- Modify: `app/globals.css`
- Modify: `components/case-study/case-layout.module.css`
- Modify: `components/call-agent/call-agent-layout.module.css`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Add failing heading tests**

Append:

```ts
it('defines the approved editorial heading hierarchy', () => {
  const css = read('app/globals.css');
  expect(css).toMatch(/--case-h1-size:\s*clamp\(3\.25rem,\s*5vw,\s*5\.5rem\)/);
  expect(css).toMatch(/--case-h1-weight:\s*600/);
  expect(css).toMatch(/--case-h1-leading:\s*1\.06/);
  expect(css).toMatch(/--case-h2-size:\s*clamp\(2\.2rem,\s*4vw,\s*4\.5rem\)/);
  expect(css).toMatch(/--case-h2-weight:\s*600/);
  expect(css).toMatch(/--case-h2-leading:\s*1\.16/);
  expect(css).toMatch(/--case-h3-size:\s*clamp\(1\.25rem,\s*2vw,\s*1\.75rem\)/);
  expect(css).toMatch(/--case-h3-weight:\s*600/);
  expect(css).toMatch(/--case-h3-leading:\s*1\.28/);
});

it.each([
  'components/case-study/case-layout.module.css',
  'components/call-agent/call-agent-layout.module.css',
  'components/meeting/meeting-layout.module.css',
  'components/xuelang/xuelang-layout.module.css',
])('%s consumes shared editorial heading tokens', (path) => {
  const css = read(path);
  expect(css).toContain('var(--case-h1-size)');
  expect(css).toContain('var(--case-h2-size)');
  expect(css).toContain('var(--case-h1-leading)');
  expect(css).toContain('var(--case-h2-leading)');
  expect(css).toContain('var(--case-h3-size)');
  expect(css).toContain('var(--case-h3-leading)');
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run tests/unit/portfolio-detail-system.test.ts`

Expected: tokens and layout adoption are absent.

- [ ] **Step 3: Define shared metrics in `:root`**

```css
--case-h1-size: clamp(3.25rem, 5vw, 5.5rem);
--case-h1-weight: 600;
--case-h1-leading: 1.06;
--case-h2-size: clamp(2.2rem, 4vw, 4.5rem);
--case-h2-weight: 600;
--case-h2-leading: 1.16;
--case-h3-size: clamp(1.25rem, 2vw, 1.75rem);
--case-h3-weight: 600;
--case-h3-leading: 1.28;
```

- [ ] **Step 4: Adopt tokens in editorial selectors**

Use this H1 set in each case title:

```css
font-size: var(--case-h1-size);
font-weight: var(--case-h1-weight);
line-height: var(--case-h1-leading);
```

Use the corresponding H2 and H3 tokens for main section and ordinary narrative subsection selectors. Remove mobile overrides that reset these agreed metrics. Preserve font family, wrapping, max-width, grid placement, margins, and each project's layout. Do not apply tokens to stage buttons, data statements, simulations, or media captions.

- [ ] **Step 5: Run layout tests**

Run: `npx vitest run tests/unit/portfolio-detail-system.test.ts tests/component/call-agent-layout.test.tsx tests/component/meeting-layout.test.tsx tests/component/xuelang-layout.test.tsx tests/component/case-study.test.tsx`

Expected: all selected tests pass.

### Task 4: Portfolio-Owned Accent Semantics

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts`
- Modify: `components/case-study/case-layout.module.css`
- Modify: `components/case-study/evidence-figure.module.css`
- Modify: `components/call-agent/call-agent-layout.module.css`
- Modify: `components/call-agent/call-agent-system-stage.module.css`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/meeting/meeting-evidence.module.css`
- Modify: `components/meeting/meeting-models.module.css`
- Modify: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Add failing legacy-accent tests**

Append:

```ts
it.each([
  'components/case-study/case-layout.module.css',
  'components/case-study/evidence-figure.module.css',
  'components/call-agent/call-agent-layout.module.css',
  'components/call-agent/call-agent-system-stage.module.css',
  'components/meeting/meeting-layout.module.css',
  'components/meeting/meeting-evidence.module.css',
  'components/meeting/meeting-models.module.css',
  'components/xuelang/xuelang-layout.module.css',
])('%s has no legacy portfolio UI accent', (path) => {
  const css = read(path);
  expect(css).not.toMatch(/color-cobalt|call-blue|meeting-accent|xuelang-green/);
});
```

Product simulation and image-comparison CSS is intentionally excluded.

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run tests/unit/portfolio-detail-system.test.ts`

Expected: failures identify cobalt, Call Agent blue, Meeting orange, and Xuelang editorial green.

- [ ] **Step 3: Replace base-layout accents**

Use `var(--color-iris-deep)` for light editorial labels and `var(--color-iris-luminous)` for equivalent content on dark bands. Replace reusable evidence-label cobalt with `var(--color-iris-deep)`. Keep structural colors neutral.

- [ ] **Step 4: Replace project-level editorial accents**

Use semantic local aliases:

```css
--call-accent: var(--color-iris-deep);
--meeting-portfolio-accent: var(--color-iris-deep);
--xuelang-portfolio-accent: var(--color-iris-deep);
```

Update editorial eyebrows, section indices, generic focus rings, normal active-stage labels, and reusable evidence labels. Remove `--call-blue`, unused `--call-green`, the orange `--meeting-accent`, and `--xuelang-green` from page layout CSS. Leave screenshots, videos, browser frames, Xuelang product simulations, and project-authentic evidence states unchanged.

- [ ] **Step 5: Run accent and regression tests**

Run: `npx vitest run tests/unit/portfolio-detail-system.test.ts tests/component/call-agent-layout.test.tsx tests/component/meeting-layout.test.tsx tests/component/xuelang-layout.test.tsx tests/unit/call-agent-regression.test.ts`

Expected: all selected tests pass without changing media-source assertions.

### Task 5: Cross-Page Browser Verification

**Files:**
- Create: `tests/e2e/portfolio-detail-system.spec.ts`

- [ ] **Step 1: Add computed-style E2E coverage**

Create:

```ts
import { expect, test } from '@playwright/test';

const routes = [
  '/zh/work/call-agent/',
  '/zh/work/meeting/',
  '/zh/work/xuelang/',
] as const;

test.describe('portfolio detail system', () => {
  for (const route of routes) {
    test(`${route} shares navigation and heading semantics`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop');
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.getByRole('banner')).toHaveAttribute('data-surface', 'light');

      const chapters = page.getByRole('navigation', { name: '案例章节' }).getByRole('link');
      await expect(chapters.first()).toHaveCSS('opacity', '1');
      await expect(chapters.nth(1)).toHaveCSS('opacity', '0.48');

      for (const [level, leading] of [[1, 1.06], [2, 1.16]] as const) {
        const heading = page.getByRole('heading', { level }).first();
        await expect(heading).toHaveCSS('font-weight', '600');
        const ratio = await heading.evaluate((node) => {
          const style = getComputedStyle(node);
          return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
        });
        expect(ratio).toBeCloseTo(leading, 1);
      }
    });
  }
});
```

Add a mobile Call Agent test that scrolls, verifies the light capsule remains readable, opens the chapter disclosure, and checks the expanded menu.

- [ ] **Step 2: Run E2E coverage**

Run: `npx playwright test tests/e2e/portfolio-detail-system.spec.ts`

Expected: all applicable desktop/mobile checks pass.

- [ ] **Step 3: Capture and inspect screenshots**

Capture Call Agent, Meeting, Xuelang, and one base-layout case at `1440x1000` and `390x844`. Check initial/scrolled header readability, capsule consistency, chapter states, multi-line Chinese heading spacing, unchanged case composition, horizontal overflow, overlap, clipping, and unintended recoloring inside evidence. Add a narrow regression assertion before fixing any issue found.

### Task 6: Final Regression Pass

**Files:**
- Verify only; no planned file changes.

- [ ] **Step 1: Run focused tests**

Run: `npx vitest run tests/unit/portfolio-detail-system.test.ts tests/component/site-header.test.tsx tests/component/case-study.test.tsx tests/component/call-agent-layout.test.tsx tests/component/meeting-layout.test.tsx tests/component/xuelang-layout.test.tsx tests/unit/call-agent-regression.test.ts`

Expected: all selected tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: source validation, Next.js build, and output validation complete successfully.

- [ ] **Step 4: Review the diff without staging**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors. Only intended files plus pre-existing user changes are present; nothing is staged or committed.
