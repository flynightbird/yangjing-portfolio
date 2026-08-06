# Growth Base Showcase Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Growth Base detail page around a dominant, correctly sized interactive prototype and a restrained C1 editorial composition.

**Architecture:** Keep the independent prototype unchanged. Give its desktop iframe a fixed `390 x 844px` layout viewport and uniformly scale that canvas inside a clipped portfolio wrapper; remove scaling at the mobile breakpoint. Restrict the redesign to Growth Base layout, comparison, copy, video grid, and their tests.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, in-app browser QA.

---

## File Map

- Modify `components/growth-base/growth-base-layout.tsx`: remove the chapter rail and render the compact full-width project header.
- Modify `components/growth-base/growth-base-layout.module.css`: define the warm editorial page shell and responsive header.
- Modify `components/growth-base/growth-base-comparison.tsx`: expose fixed-canvas semantics while preserving trusted message synchronization.
- Modify `components/growth-base/growth-base-case.tsx`: replace four-column CPDI blocks with concise design notes.
- Modify `components/growth-base/growth-base-video-grid.tsx`: identify the approved C1 grid for tests and styling.
- Modify `components/growth-base/growth-base.module.css`: implement the C layout, fixed iframe canvas, and C1 responsive film grid.
- Modify `content/growth-base.ts`: replace CPDI arrays with concise bilingual notes.
- Modify `tests/component/growth-base-layout.test.tsx`: prove the project no longer renders a chapter rail.
- Modify `tests/component/growth-base-comparison.test.tsx`: prove fixed canvas dimensions and Before/After hierarchy.
- Modify `tests/component/growth-base-case.test.tsx`: prove concise notes and C1 grid semantics.
- Create `tests/unit/growth-base-styles.test.ts`: guard the fixed canvas, mobile reset, and `3 + 2` CSS contract.

### Task 1: Simplify The Growth Base Page Shell

**Files:**
- Modify: `tests/component/growth-base-layout.test.tsx`
- Modify: `components/growth-base/growth-base-layout.tsx`
- Modify: `components/growth-base/growth-base-layout.module.css`

- [ ] **Step 1: Write the failing layout test**

Replace the chapter-navigation expectation and add the compact-shell assertions:

```tsx
it('renders a full-width compact opening without a case-study chapter rail', () => {
  const { container } = render(
    <GrowthBaseLayout meta={meta} locale="en">
      <section id="showcase">Showcase</section>
    </GrowthBaseLayout>,
  );

  expect(screen.getByRole('heading', { level: 1, name: meta.title })).toBeVisible();
  expect(screen.getByText(meta.status)).toBeVisible();
  expect(screen.getByText(meta.role)).toBeVisible();
  expect(screen.queryByRole('navigation', { name: 'Case study chapters' })).toBeNull();
  expect(container.querySelector('[data-growth-base-case]')).toHaveAttribute(
    'data-layout',
    'editorial-full-width',
  );
  expect(container.querySelector('[data-case-study]')).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run tests/component/growth-base-layout.test.tsx
```

Expected: FAIL because the chapter navigation is still present and `data-layout` is missing.

- [ ] **Step 3: Implement the full-width layout**

Remove the `ChapterNav` import and the `<aside>` from `GrowthBaseLayout`. Use this outer structure:

```tsx
return (
  <div
    className={styles.root}
    data-growth-base-case
    data-layout="editorial-full-width"
  >
    <article className={styles.case} data-case-study>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h1>{meta.title}</h1>
          <p className={styles.proposition}>{meta.proposition}</p>
        </div>
        <dl className={styles.facts}>
          <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
          <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
        </dl>
      </header>
      <div className={styles.content}>{children}</div>
    </article>
  </div>
);
```

Replace the layout CSS with a restrained full-width shell:

```css
.root {
  color: #28231d;
  background: #d7cbc0;
}

.case { min-width: 0; }

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
  gap: clamp(2rem, 6vw, 7rem);
  width: min(calc(100% - 3rem), 78rem);
  margin: 0 auto;
  padding: clamp(7rem, 10vw, 9rem) 0 clamp(3rem, 5vw, 4.5rem);
  align-items: end;
}

.heroCopy { max-width: 48rem; }
.eyebrow { margin: 0 0 1rem; color: rgba(40, 35, 29, 0.58); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600; }
.hero h1 { margin: 0; max-width: 12ch; font-family: var(--font-display); font-size: clamp(2.8rem, 5.4vw, 5.8rem); font-weight: 400; line-height: 0.98; text-wrap: balance; }
.proposition { max-width: 39rem; margin: 1.4rem 0 0; color: rgba(40, 35, 29, 0.68); font-size: clamp(1rem, 1.45vw, 1.22rem); line-height: 1.65; }
.facts { margin: 0; border-top: 1px solid rgba(40, 35, 29, 0.2); }
.facts div { padding: 0.9rem 0; border-bottom: 1px solid rgba(40, 35, 29, 0.2); }
.facts dt { color: rgba(40, 35, 29, 0.5); font-family: var(--font-mono); font-size: 0.65rem; }
.facts dd { margin: 0.35rem 0 0; font-size: 0.88rem; line-height: 1.5; }
.content { min-width: 0; }

@media (max-width: 767px) {
  .hero { grid-template-columns: 1fr; width: min(calc(100% - 2rem), 42rem); gap: 2rem; padding-top: 6rem; }
  .hero h1 { font-size: clamp(2.4rem, 12vw, 3.8rem); }
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run `npx vitest run tests/component/growth-base-layout.test.tsx`.

Expected: 1 test passed.

- [ ] **Step 5: Commit the page-shell change**

```bash
git add components/growth-base/growth-base-layout.tsx components/growth-base/growth-base-layout.module.css tests/component/growth-base-layout.test.tsx
git commit -m "refactor: simplify growth base case shell"
```

### Task 2: Preserve The Prototype's Intended Canvas

**Files:**
- Modify: `tests/component/growth-base-comparison.test.tsx`
- Create: `tests/unit/growth-base-styles.test.ts`
- Modify: `components/growth-base/growth-base-comparison.tsx`
- Modify: `components/growth-base/growth-base.module.css`

- [ ] **Step 1: Add failing structural assertions**

Add this test to `growth-base-comparison.test.tsx`:

```tsx
it('keeps a fixed mobile canvas inside a dominant After viewport', () => {
  const { container } = render(<GrowthBaseComparison locale="en" />);

  expect(container.querySelector('[data-comparison-role="before"]')).toBeVisible();
  expect(container.querySelector('[data-comparison-role="after"]')).toBeVisible();
  expect(container.querySelector('[data-prototype-viewport]')).toHaveAttribute(
    'data-canvas-size',
    '390x844',
  );
  expect(container.querySelector('iframe')).toHaveAttribute('width', '390');
  expect(container.querySelector('iframe')).toHaveAttribute('height', '844');
});
```

Create `tests/unit/growth-base-styles.test.ts`:

```ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Growth Base showcase CSS contract', () => {
  it('uses a fixed desktop prototype canvas and removes scaling on mobile', async () => {
    const css = await readFile(
      path.join(process.cwd(), 'components/growth-base/growth-base.module.css'),
      'utf8',
    );

    expect(css).toMatch(/--prototype-width:\s*390px/);
    expect(css).toMatch(/--prototype-height:\s*844px/);
    expect(css).toMatch(/transform:\s*scale\(var\(--prototype-scale\)\)/);
    expect(css).toMatch(/@media \(max-width:\s*767px\)[\s\S]*transform:\s*none/);
    expect(css).toMatch(/\.beforePhone[\s\S]*opacity:\s*0\.72/);
  });
});
```

- [ ] **Step 2: Run both tests and verify RED**

Run:

```bash
npx vitest run tests/component/growth-base-comparison.test.tsx tests/unit/growth-base-styles.test.ts
```

Expected: FAIL because canvas metadata, iframe dimensions, scale variables, and hierarchy are absent.

- [ ] **Step 3: Add fixed-canvas markup**

In `GrowthBaseComparison`, mark roles and the viewport:

```tsx
<figure className={styles.beforePhone} data-comparison-role="before">
  {/* existing Before content */}
</figure>

<div className={styles.afterPhone} data-comparison-role="after">
  <span className={styles.phoneLabel}>AFTER / INTERACTIVE</span>
  <div
    className={styles.afterFrame}
    data-prototype-viewport
    data-canvas-size="390x844"
  >
    <iframe
      ref={iframeRef}
      className={styles.prototype}
      src="https://flynightbird.github.io/meditation-prototype/?embed=1"
      title={locale === 'zh' ? '成长基地可交互原型' : 'Interactive Growth Base prototype'}
      width="390"
      height="844"
      loading="eager"
      allow="autoplay"
    />
  </div>
</div>
```

- [ ] **Step 4: Implement the C hierarchy and fixed canvas**

Replace the comparison-related CSS with:

```css
.comparison {
  --prototype-width: 390px;
  --prototype-height: 844px;
  --prototype-scale: 0.78;
  display: flex;
  width: min(calc(100% - 3rem), 66rem);
  margin: 0 auto;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(3rem, 7vw, 7rem);
}

.beforePhone { position: relative; width: 13.75rem; aspect-ratio: 1179 / 2556; margin: 0 0 1.4rem; opacity: 0.72; }
.beforePhone img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 2px; box-shadow: 0 14px 30px rgba(69, 48, 32, 0.16); }
.beforePhone figcaption { margin-top: 0.7rem; color: rgba(40, 35, 29, 0.58); font-family: var(--font-mono); font-size: 0.64rem; text-align: center; }
.paper { display: none; }
.afterPhone { position: relative; width: calc(var(--prototype-width) * var(--prototype-scale)); height: calc(var(--prototype-height) * var(--prototype-scale)); }
.afterFrame { position: relative; width: 100%; height: 100%; overflow: hidden; border: 1px solid rgba(40, 35, 29, 0.22); border-radius: 24px; background: #76523b; box-shadow: 0 22px 46px rgba(69, 48, 32, 0.24); }
.prototype { position: absolute; inset: 0; display: block; width: var(--prototype-width); height: var(--prototype-height); border: 0; transform: scale(var(--prototype-scale)); transform-origin: top left; background: #76523b; }
.phoneLabel { position: absolute; z-index: 2; top: -1.6rem; left: 0; color: rgba(40, 35, 29, 0.6); font-family: var(--font-mono); font-size: 0.58rem; font-weight: 600; }

@media (max-width: 767px) {
  .comparison { display: block; width: 100%; }
  .beforePhone, .phoneLabel { display: none; }
  .afterPhone { width: 100%; height: 100dvh; }
  .afterFrame { border: 0; border-radius: 0; box-shadow: none; }
  .prototype { width: 100%; height: 100dvh; transform: none; }
}
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run `npx vitest run tests/component/growth-base-comparison.test.tsx tests/unit/growth-base-styles.test.ts`.

Expected: all comparison and CSS-contract tests passed.

- [ ] **Step 6: Commit the canvas fix**

```bash
git add components/growth-base/growth-base-comparison.tsx components/growth-base/growth-base.module.css tests/component/growth-base-comparison.test.tsx tests/unit/growth-base-styles.test.ts
git commit -m "fix: preserve growth base prototype canvas"
```

### Task 3: Apply The C1 Editorial Content And Film Grid

**Files:**
- Modify: `tests/component/growth-base-case.test.tsx`
- Modify: `content/growth-base.ts`
- Modify: `components/growth-base/growth-base-case.tsx`
- Modify: `components/growth-base/growth-base-video-grid.tsx`
- Modify: `components/growth-base/growth-base.module.css`

- [ ] **Step 1: Write the failing density and grid test**

Add to `growth-base-case.test.tsx`:

```tsx
it('uses concise editorial notes and the approved C1 film grid', () => {
  const { container } = render(<GrowthBaseCase locale="zh" />);

  expect(container.querySelector('[data-growth-base-film-grid]')).toHaveAttribute(
    'data-layout',
    'editorial-3-2',
  );
  expect(container.querySelectorAll('[data-growth-base-note]')).toHaveLength(2);
  expect(screen.getByText('对照保留旧方案，但让当前可交互体验成为视觉主角。')).toBeVisible();
  expect(container.querySelector('.cpdi')).toBeNull();
});
```

Extend `growth-base-styles.test.ts`:

```ts
it('centers the final two films in a six-column desktop grid', async () => {
  const css = await readFile(
    path.join(process.cwd(), 'components/growth-base/growth-base.module.css'),
    'utf8',
  );

  expect(css).toMatch(/grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/);
  expect(css).toMatch(/\.film:nth-child\(4\)[\s\S]*grid-column:\s*2\s*\/\s*span\s*2/);
  expect(css).toMatch(/\.film:nth-child\(5\)[\s\S]*grid-column:\s*4\s*\/\s*span\s*2/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
npx vitest run tests/component/growth-base-case.test.tsx tests/unit/growth-base-styles.test.ts
```

Expected: FAIL because CPDI blocks and five equal columns still exist.

- [ ] **Step 3: Replace CPDI copy with concise notes**

In `growthBaseCaseCopy`, replace both CPDI arrays with:

```ts
comparisonNote: '对照保留旧方案，但让当前可交互体验成为视觉主角。',
clipsNote: '五段生成式视频把欢迎、冥想、反馈与饮食行动连接成持续陪伴。',
```

For English use:

```ts
comparisonNote: 'The comparison retains the original direction while making the current interactive experience the visual focus.',
clipsNote: 'Five generative films connect welcome, meditation, feedback, and meal actions into continuous companionship.',
```

- [ ] **Step 4: Replace CPDI rendering and identify the grid**

In `GrowthBaseCase`, replace `CpdiNote` with:

```tsx
function DesignNote({ children }: { readonly children: string }) {
  return <p className={styles.designNote} data-growth-base-note>{children}</p>;
}
```

Render `comparisonNote` after `GrowthBaseComparison` and `clipsNote` after `GrowthBaseVideoGrid`.

In `GrowthBaseVideoGrid`, change the wrapper to:

```tsx
<div
  className={styles.videoGrid}
  data-growth-base-film-grid
  data-layout="editorial-3-2"
>
```

- [ ] **Step 5: Implement the warm C1 stage and film grid**

Use these rules in `growth-base.module.css`:

```css
.showcase { padding: 2rem 0 clamp(5rem, 8vw, 8rem); color: #28231d; background: #d7cbc0; }
.clips { padding: clamp(5rem, 8vw, 8rem) 1.5rem; color: #f4f2ec; background: #11100f; }
.sectionHeader { display: grid; width: min(calc(100% - 3rem), 66rem); margin: 0 auto clamp(2.5rem, 5vw, 4rem); gap: 0.75rem; }
.sectionHeader p { margin: 0; color: rgba(40, 35, 29, 0.56); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 600; }
.sectionHeader h2 { margin: 0; font-family: var(--font-display); font-size: clamp(2rem, 3.4vw, 3.7rem); font-weight: 400; line-height: 1.05; }
.sectionHeader span { max-width: 42rem; color: rgba(40, 35, 29, 0.66); line-height: 1.65; }
.clips .sectionHeader p, .clips .sectionHeader span { color: rgba(244, 242, 236, 0.58); }
.designNote { width: min(calc(100% - 3rem), 42rem); margin: 2.5rem auto 0; color: rgba(40, 35, 29, 0.64); font-size: 0.9rem; line-height: 1.65; text-align: center; }
.clips .designNote { color: rgba(244, 242, 236, 0.62); }
.videoGrid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: clamp(0.8rem, 1.5vw, 1.25rem); width: min(100%, 72rem); margin: 0 auto; }
.film { grid-column: span 2; position: relative; margin: 0; overflow: hidden; border-radius: 7px; background: #1a1816; }
.film:nth-child(4) { grid-column: 2 / span 2; }
.film:nth-child(5) { grid-column: 4 / span 2; }

@media (max-width: 900px) {
  .videoGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .film, .film:nth-child(4), .film:nth-child(5) { grid-column: auto; }
  .film:last-child { grid-column: 1 / -1; width: calc((100% - clamp(0.8rem, 1.5vw, 1.25rem)) / 2); justify-self: center; }
}

@media (max-width: 767px) {
  .showcase { padding-top: 0; }
  .sectionHeader { width: min(calc(100% - 2rem), 42rem); }
  .videoGrid { grid-template-columns: 1fr; max-width: 24rem; }
  .film, .film:last-child { grid-column: auto; width: 100%; }
}
```

Keep the existing bottom-caption and top-left watermark-mask rules unchanged.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/component/growth-base-case.test.tsx tests/unit/growth-base-styles.test.ts
```

Expected: all case and CSS-contract tests passed.

- [ ] **Step 7: Commit the C1 content change**

```bash
git add content/growth-base.ts components/growth-base/growth-base-case.tsx components/growth-base/growth-base-video-grid.tsx components/growth-base/growth-base.module.css tests/component/growth-base-case.test.tsx tests/unit/growth-base-styles.test.ts
git commit -m "feat: apply growth base C1 editorial layout"
```

### Task 4: Verify Responsive Behavior And Production Output

**Files:**
- Modify only if verification exposes a Growth Base regression.

- [ ] **Step 1: Run the Growth Base focused suite**

```bash
npx vitest run tests/component/growth-base-layout.test.tsx tests/component/growth-base-comparison.test.tsx tests/component/growth-base-case.test.tsx tests/component/growth-base-home-entry.test.tsx tests/unit/growth-base-styles.test.ts tests/unit/growth-base-assets.test.ts tests/unit/growth-base-content.test.ts
```

Expected: all focused tests passed.

- [ ] **Step 2: Run the full portfolio verification**

```bash
npm test
npm run lint
npm run validate:content
npm run build
git diff --check
```

Expected: 584 or more tests passed, zero lint errors, content validation passed, production build passed, and no whitespace errors. Existing unrelated lint warnings may remain but no Growth Base warning may be added.

- [ ] **Step 3: Verify desktop dimensions in a real browser**

At `1440 x 900`, open `/zh/work/growth-base/` and measure:

```js
const iframe = document.querySelector('iframe[title*="成长基地"]');
const wrapper = document.querySelector('[data-prototype-viewport]');
({
  iframeLayout: { width: iframe.width, height: iframe.height },
  wrapperRect: wrapper.getBoundingClientRect().toJSON(),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
});
```

Expected: iframe attributes are `390 x 844`, wrapper is approximately `304 x 658`, Before is visibly smaller than After, and `overflowX` is `0`.

- [ ] **Step 4: Verify the iframe's internal viewport**

Evaluate inside the iframe:

```js
({ width: innerWidth, height: innerHeight })
```

Expected: `{ width: 390, height: 844 }` on desktop.

- [ ] **Step 5: Verify mobile behavior**

At `390 x 844`, confirm:

- Before and desktop labels are hidden.
- The iframe has no CSS transform.
- The iframe internal viewport is `390 x 844`.
- The application header, message, character, action, cards, and bottom navigation do not pile into one region.
- The page has no horizontal overflow.

- [ ] **Step 6: Verify films and runtime logs**

Confirm all five films have non-zero boxes, the first row has three items, the second row has two centered items, captions touch the bottom edge, masks touch the top-left edge, and browser logs contain no new errors or warnings.

- [ ] **Step 7: Commit any verification-only correction**

If verification required a scoped correction, stage only its Growth Base files and commit:

```bash
git commit -m "fix: refine growth base responsive showcase"
```

If no correction was required, do not create an empty commit.
