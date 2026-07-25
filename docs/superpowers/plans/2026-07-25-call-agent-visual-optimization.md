# Call Agent Visual Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Call Agent scroll-driven product-system stage with compact accessible tabs, align the case with the current portfolio typography and fluorescent-green language, and guarantee that the project title never overlaps Hero media.

**Architecture:** Keep the existing bilingual stage data and approved media, but make `CallAgentSystemStage` a single state-driven tab component on every screen size. Separate Hero copy/meta from Hero media in `CallAgentLayout`, then use the existing shared detail-page tokens for typography and spacing. Preserve the static six-stage sequence only as a print artifact, and verify geometry in Playwright across the existing desktop, tablet, and mobile projects.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, GSAP only for existing page-entry/section reveals.

---

## File Map

- `components/call-agent/call-agent-system-stage.tsx`: owns tab state, keyboard behavior, active media, active summary, and print-only duplicate sequence.
- `components/call-agent/call-agent-system-stage.module.css`: owns pill-tab geometry, horizontal overflow, stable media layering, and summary presentation.
- `components/call-agent/call-agent-layout.tsx`: separates Hero copy, facts/actions, and media into non-overlapping regions.
- `components/call-agent/call-agent-layout.module.css`: owns Call Agent color tokens, shared typography, Hero/section geometry, and dark-band treatment.
- `components/call-agent/call-agent-browser-video.module.css`: normalizes the stable product viewport and media evidence styling.
- `components/case-study/chapter-nav.tsx`: accepts a scoped signal accent option without changing other case studies.
- `components/case-study/chapter-nav.module.css`: maps the signal accent to accessible green values on light and dark surfaces.
- `components/call-agent/call-agent-print.css`: keeps all six product stages available in print after the screen DOM changes.
- `tests/component/call-agent-layout.test.tsx`: verifies accessible tab behavior, bilingual media, Hero structure, and active video state.
- `tests/component/case-study.test.tsx`: verifies that the shared ChapterNav keeps its default accent while accepting the Call Agent signal accent.
- `tests/unit/portfolio-detail-system.test.ts`: verifies shared token use and removal of obsolete scroll-stage styling.
- `tests/e2e/call-agent.visual.spec.ts`: verifies tab/media geometry, responsive overflow, stable panels, typography, and Hero separation.
- `tests/e2e/call-agent.spec.ts`: preserves bilingual story, print, navigation, and horizontal-overflow contracts.
- Delete `components/call-agent/call-agent-motion-mode.ts`: the tab interface no longer has viewport-specific state modes.
- Delete `tests/unit/call-agent-motion.test.ts`: obsolete mode mapping has no production consumer after the redesign.

### Task 1: Replace Scroll-Driven Stage State With Accessible Tabs

**Files:**
- Modify: `tests/component/call-agent-layout.test.tsx:82-108`
- Modify: `components/call-agent/call-agent-system-stage.tsx:1-108`
- Delete: `components/call-agent/call-agent-motion-mode.ts`
- Delete: `tests/unit/call-agent-motion.test.ts`

- [ ] **Step 1: Replace the old six-stage component tests with the tab contract**

Keep the existing setup and layout tests. Replace the `Call Agent six-stage system` describe block with:

```tsx
describe('Call Agent six-stage system', () => {
  it('renders six title-only tabs above one stable media stage', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    const { container } = render(<CallAgentSystemStage locale="zh" />);
    const tabs = screen.getAllByRole('tab');

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      '创建', '编排', '预览', '发布', '内呼连接', '外呼运营',
    ]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).not.toHaveTextContent('从空白或客服模板开始');
    expect(container.querySelectorAll('[role="tabpanel"]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-call-agent-media-stage]')).toHaveLength(1);
    expect(container.querySelector('[data-stage-summary]')).toHaveTextContent(
      '从空白或客服模板开始，用有意义的默认值降低冷启动负担。',
    );
  });

  it('changes the selected panel and active summary without duplicating tab copy', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    const { container } = render(<CallAgentSystemStage locale="en" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Publish' }));

    expect(screen.getByRole('tab', { name: 'Publish' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Publish' })).toHaveAttribute('data-active', 'true');
    expect(container.querySelector('[data-stage-summary]')).toHaveTextContent(
      'Separate unpublished drafts from released versions and preserve recovery.',
    );
    expect(container.querySelector('[data-active="true"] video')).toHaveAttribute(
      'src',
      '/videos/call-agent/agent-publish.mp4',
    );
  });

  it('supports Arrow, Home, and End keyboard navigation', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    render(<CallAgentSystemStage locale="en" />);
    const create = screen.getByRole('tab', { name: 'Create' });
    create.focus();

    fireEvent.keyDown(create, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Orchestrate' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Orchestrate' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Orchestrate' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Outbound operations' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Outbound operations' }), { key: 'Home' });
    expect(create).toHaveFocus();
  });

  it('keeps approved inbound and outbound media in both locales', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    const zh = render(<CallAgentSystemStage locale="zh" />);
    expect(zh.container.querySelector('video[src="/videos/call-agent/agent-connect.mp4"]')).toBeInTheDocument();
    expect(zh.container.querySelector('video[src="/videos/call-agent/agent-operate.mp4"]')).toBeInTheDocument();
    zh.unmount();

    const en = render(<CallAgentSystemStage locale="en" />);
    expect(en.container.querySelector('video[src="/videos/call-agent/agent-connect.mp4"]')).toBeInTheDocument();
    expect(en.container.querySelector('video[src="/videos/call-agent/agent-operate.mp4"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the old vertical-step DOM fails**

Run:

```bash
npx vitest run tests/component/call-agent-layout.test.tsx
```

Expected: FAIL because no `tablist`, `tab`, or `tabpanel` roles exist and the current buttons include numbers and summaries.

- [ ] **Step 3: Replace the stage controller with tab state**

In `call-agent-system-stage.tsx`, remove GSAP, ScrollTrigger, `useGSAP`, `useEffect`, and motion-mode imports. Use:

```tsx
import { useRef, useState, type KeyboardEvent } from 'react';
```

Keep `StageItem`, `copy`, and `StageMedia` unchanged. Add this helper and replace `CallAgentSystemStage`:

```tsx
export function CallAgentSystemStage({ locale }: { readonly locale: Locale }) {
  const items = copy[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tablistLabel = locale === 'zh' ? '产品阶段' : 'Product stages';

  const activate = (index: number, moveFocus = false) => {
    const normalizedIndex = (index + items.length) % items.length;
    setActiveIndex(normalizedIndex);
    if (moveFocus) {
      tabRefs.current[normalizedIndex]?.focus();
      tabRefs.current[normalizedIndex]?.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const destinations: Partial<Record<string, number>> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: items.length - 1,
    };
    const destination = destinations[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    activate(destination, true);
  };

  return (
    <div className={styles.root} data-system-mode="tabs">
      <div className={styles.tabs} role="tablist" aria-label={tablistLabel}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[index] = node; }}
            id={`call-agent-stage-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls={`call-agent-stage-panel-${item.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            data-stage-id={item.id}
            data-active={index === activeIndex ? 'true' : 'false'}
            onClick={() => activate(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className={styles.mediaStage} data-call-agent-media-stage>
        {items.map((item, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={item.id}
              id={`call-agent-stage-panel-${item.id}`}
              className={styles.mediaLayer}
              role="tabpanel"
              aria-labelledby={`call-agent-stage-tab-${item.id}`}
              aria-hidden={!active}
              inert={!active}
              data-active={active ? 'true' : 'false'}
            >
              <StageMedia item={item} active={active} />
            </div>
          );
        })}
      </div>

      <p className={styles.summary} data-stage-summary aria-live="polite">
        {items[activeIndex].summary}
      </p>

      <div className={styles.staticSequence} data-static-sequence aria-hidden="true">
        {items.map((item, index) => (
          <article key={item.id} data-static-stage data-stage-id={item.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <StageMedia item={item} active={false} />
          </article>
        ))}
      </div>
    </div>
  );
}
```

Delete `call-agent-motion-mode.ts` and its unit test after `rg -n "resolveCallAgentMotionMode|CallAgentMotionMode" . --glob '!node_modules/**'` confirms there are no remaining imports.

- [ ] **Step 4: Run the focused tests and verify green**

Run:

```bash
npx vitest run tests/component/call-agent-layout.test.tsx
```

Expected: all tests in the file PASS.

- [ ] **Step 5: Commit the interaction change**

```bash
git add components/call-agent/call-agent-system-stage.tsx tests/component/call-agent-layout.test.tsx
git add -u components/call-agent/call-agent-motion-mode.ts tests/unit/call-agent-motion.test.ts
git commit -m "refactor: replace call agent scroll stage with tabs"
```

### Task 2: Build The Compact Pill And Stable Media Treatment

**Files:**
- Modify: `tests/unit/portfolio-detail-system.test.ts:100-140`
- Modify: `components/call-agent/call-agent-system-stage.module.css:1-32`
- Modify: `components/call-agent/call-agent-browser-video.module.css:1-92`
- Modify: `components/call-agent/call-agent-print.css:1-13`

- [ ] **Step 1: Add failing CSS contract assertions**

Add this test to the Call Agent block in `portfolio-detail-system.test.ts`:

```ts
it('uses compact fluorescent-green tabs above a stable media grid', () => {
  const stageCss = read('components/call-agent/call-agent-system-stage.module.css');
  const browserCss = read('components/call-agent/call-agent-browser-video.module.css');

  expect(stageCss).toContain('height: 38px');
  expect(stageCss).toContain('border-radius: 999px');
  expect(stageCss).toContain('background: var(--call-signal)');
  expect(stageCss).toContain('overflow-x: auto');
  expect(stageCss).toContain('grid-area: 1 / 1');
  expect(stageCss).not.toContain('min-height: 33vh');
  expect(stageCss).not.toContain('position: sticky');
  expect(browserCss).toContain('aspect-ratio: 16 / 10');
  expect(browserCss).toContain('object-fit: contain');
  expect(browserCss).not.toContain('object-fit: fill');
});
```

- [ ] **Step 2: Run the unit test and confirm the old stage CSS fails**

Run:

```bash
npx vitest run tests/unit/portfolio-detail-system.test.ts
```

Expected: FAIL on the new 38px pill, horizontal overflow, stable grid, and aspect-ratio assertions.

- [ ] **Step 3: Replace the stage CSS with the compact tab layout**

Replace `call-agent-system-stage.module.css` with:

```css
.root {
  min-width: 0;
  margin-top: clamp(2rem, 5vw, 3.5rem);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  overflow-x: auto;
  padding: 0 0 0.75rem;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
}

.tabs button {
  height: 38px;
  flex: 0 0 auto;
  padding-inline: 1rem;
  border: 1px solid var(--call-line);
  border-radius: 999px;
  background: #f1f3ef;
  color: var(--call-ink);
  font: 600 0.875rem/1 var(--call-font);
  letter-spacing: 0;
  scroll-snap-align: start;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
}

.tabs button:hover {
  border-color: #9ba196;
  background: #e8ebe5;
}

.tabs button:focus-visible {
  outline: 2px solid var(--call-signal-ink);
  outline-offset: 2px;
}

.tabs button[data-active='true'] {
  border-color: var(--call-signal);
  background: var(--call-signal);
  color: #0a0a0a;
}

.mediaStage {
  display: grid;
  min-width: 0;
  margin-top: 0.75rem;
}

.mediaLayer {
  grid-area: 1 / 1;
  min-width: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 220ms ease, visibility 220ms;
  pointer-events: none;
}

.mediaLayer[data-active='true'] {
  z-index: 1;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.summary {
  max-width: 54rem;
  min-height: 3.5rem;
  margin: 1rem 0 0;
  color: #61675f;
  font-size: 1rem;
  line-height: 1.65;
}

.staticSequence {
  display: none;
}

@media (max-width: 767px) {
  .root {
    margin-top: 2rem;
  }

  .tabs {
    margin-inline: -1rem;
    width: calc(100% + 2rem);
    padding-inline: 1rem;
  }

  .summary {
    min-height: 4.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mediaLayer,
  .tabs button {
    transition: none;
  }
}
```

- [ ] **Step 4: Normalize the browser viewport and print selectors**

The six approved clips range from `1280x616` to `1280x784`, so filling one fixed viewport would distort them. In `call-agent-browser-video.module.css`, add `aspect-ratio: 16 / 10` to `.viewport`, change its radius to `0 0 11px 11px`, set `.browser` to `border-radius: 12px`, and use this shared media rule to preserve source fidelity:

```css
.viewport {
  position: relative;
  overflow: hidden;
  border-radius: 0 0 11px 11px;
  aspect-ratio: 16 / 10;
  background: #f5f7fa;
}

.viewport img,
.viewport video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

Remove the image-only height calculation and the video-poster `height: auto` override. Retain the 32px chrome and captions.

Replace the print stage selectors with named hooks so DOM order no longer matters:

```css
@media print {
  [data-call-agent-case] { background: #fff !important; color: #000 !important; }
  [data-call-agent-case] [data-case-web-control],
  [data-call-agent-case] [role='tablist'],
  [data-call-agent-case] [data-call-agent-media-stage],
  [data-call-agent-case] [data-stage-summary] { display: none !important; }
  [data-call-agent-case] [data-call-agent-hero] { min-height: 0 !important; break-after: page; }
  [data-call-agent-case] video { display: none !important; }
  [data-call-agent-case] [data-call-agent-browser] { break-inside: avoid; }
  [data-call-agent-case] [data-product-boundary-diagram],
  [data-call-agent-case] [data-productization-grid],
  [data-call-agent-case] [data-static-stage] { break-inside: avoid; }
  [data-call-agent-case] .call-dark-band { background: #fff !important; color: #000 !important; }
  [data-call-agent-case] [data-static-sequence] {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}
```

- [ ] **Step 5: Run focused unit and component tests**

Run:

```bash
npx vitest run tests/unit/portfolio-detail-system.test.ts tests/component/call-agent-layout.test.tsx
```

Expected: both files PASS.

- [ ] **Step 6: Commit the visual stage**

```bash
git add components/call-agent/call-agent-system-stage.module.css components/call-agent/call-agent-browser-video.module.css components/call-agent/call-agent-print.css tests/unit/portfolio-detail-system.test.ts
git commit -m "style: compact call agent product tabs"
```

### Task 3: Separate Hero Regions And Align The Detail-Page System

**Files:**
- Modify: `tests/component/call-agent-layout.test.tsx:36-56`
- Modify: `components/call-agent/call-agent-layout.tsx:20-40`
- Modify: `components/call-agent/call-agent-layout.module.css:1-41`
- Modify: `components/case-study/chapter-nav.tsx:8-105`
- Modify: `components/case-study/chapter-nav.module.css:1-24`
- Modify: `tests/component/case-study.test.tsx:53-124`

- [ ] **Step 1: Add failing structure and scoped-accent assertions**

In the Hero component test, add:

```tsx
expect(container.querySelector('[data-call-agent-hero-top]')).toBeInTheDocument();
expect(container.querySelector('[data-call-agent-hero-copy]')).toContainElement(
  screen.getByRole('heading', { level: 1 }),
);
expect(container.querySelector('[data-call-agent-hero-meta]')).toContainElement(
  screen.getByText(meta.role),
);
expect(container.querySelector('[data-call-agent-hero-media]')).toContainElement(
  container.querySelector('[data-call-agent-hero-sequence]'),
);
expect(container.querySelector('[data-case-web-control]')).toHaveAttribute('data-accent', 'signal');
```

Add these CSS assertions to `portfolio-detail-system.test.ts`:

```ts
expect(layoutCss).toContain('--call-signal: #c7ff38');
expect(layoutCss).toContain('--call-signal-ink: #486600');
expect(layoutCss).toContain('font-family: var(--font-display)');
expect(layoutCss).toContain('font-size: 1.1875rem');
expect(layoutCss).toContain('font-size: 1rem');
expect(layoutCss).not.toContain('font-size: clamp(1.3rem, 2vw, 2rem)');
expect(layoutCss).not.toContain('border-radius: 20px');
expect(layoutCss).not.toContain('margin: 220px 0 0 -4vw');
```

Add this focused API test to the `ChapterNav` describe block in `case-study.test.tsx`:

```tsx
it('keeps the default accent and accepts the scoped signal accent', () => {
  const defaultNav = render(<ChapterNav chapters={chapters} locale="en" />);
  expect(
    screen.getByRole('navigation', { name: 'Case study chapters' }).parentElement,
  ).toHaveAttribute('data-accent', 'default');
  defaultNav.unmount();

  render(<ChapterNav chapters={chapters} locale="en" surface="light" accent="signal" />);
  expect(
    screen.getByRole('navigation', { name: 'Case study chapters' }).parentElement,
  ).toHaveAttribute('data-accent', 'signal');
});
```

- [ ] **Step 2: Run tests and verify the current overlapping Hero fails**

Run:

```bash
npx vitest run tests/component/call-agent-layout.test.tsx tests/component/case-study.test.tsx tests/unit/portfolio-detail-system.test.ts
```

Expected: FAIL because Hero has no top/meta hooks, the ChapterNav has no signal variant, and legacy typography/overlap CSS remains.

- [ ] **Step 3: Separate Hero markup**

Update the `ChapterNav` call to:

```tsx
<ChapterNav
  chapters={meta.chapters ?? []}
  locale={locale}
  compactAt="wide"
  surface="light"
  accent="signal"
/>
```

Replace the Hero body with:

```tsx
<header className={styles.hero} data-call-agent-hero>
  <div className={styles.heroTop} data-call-agent-hero-top>
    <div className={styles.heroCopy} data-hero-copy data-call-agent-hero-copy>
      <p className={styles.eyebrow}>{text.eyebrow}</p>
      <p className={styles.audience}>{text.audience}</p>
      <h1>{meta.title}</h1>
      <p className={styles.proposition}>{meta.proposition}</p>
    </div>
    <div className={styles.heroMeta} data-call-agent-hero-meta>
      <dl className={styles.facts} aria-label={text.facts}>
        <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
        <div><dt>{text.duration}</dt><dd>{meta.duration}</dd></div>
        <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
      </dl>
      {actions}
    </div>
  </div>
  <div className={styles.heroMedia} data-call-agent-hero-media>
    <CallAgentHeroSequence locale={locale} />
  </div>
</header>
```

- [ ] **Step 4: Add the scoped ChapterNav accent API**

Extend `ChapterNavProps` with:

```ts
readonly accent?: 'default' | 'signal';
```

Default it in the function signature:

```ts
accent = 'default',
```

Add `data-accent={accent}` to the ChapterNav root. Add these rules after the light-surface rule:

```css
.root[data-accent='signal'] {
  --chapter-accent: #c7ff38;
}

.root[data-accent='signal'][data-surface='light'] {
  --chapter-accent: #486600;
}
```

- [ ] **Step 5: Rewrite Call Agent layout geometry and typography**

Replace `call-agent-layout.module.css` with these complete rules:

```css
.root {
  --call-paper: #f7f8f5;
  --call-ink: #0a0a0a;
  --call-muted: #61675f;
  --call-line: #dfe3dc;
  --call-signal: #c7ff38;
  --call-signal-ink: #486600;
  --call-runtime: #101311;
  --call-font: 'Geist', 'Noto Sans SC', sans-serif;
  --call-mono: 'Geist Mono', monospace;
  min-height: 100vh;
  overflow: clip;
  background: var(--call-paper);
  color: var(--call-ink);
  font-family: var(--call-font);
}

.frame {
  display: grid;
  width: min(100%, 100rem);
  grid-template-columns: minmax(9rem, 2fr) minmax(0, 10fr);
  gap: clamp(1.5rem, 3vw, 4rem);
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 3vw, 3.5rem);
}

.rail {
  min-width: 0;
  padding-block-start: 4rem;
}

.case {
  min-width: 0;
}

.hero {
  display: grid;
  gap: clamp(1.5rem, 3vw, 3rem);
  padding-block: clamp(3rem, 6vw, 6rem) clamp(4rem, 7vw, 7rem);
}

.heroTop {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(17rem, 0.8fr);
  gap: clamp(1.5rem, 4vw, 4.5rem);
  align-items: end;
}

.heroCopy,
.heroMeta,
.heroMedia {
  min-width: 0;
}

.hero h1,
.case > section h2 {
  font-family: var(--font-display), var(--font-chinese), sans-serif;
  letter-spacing: 0;
  overflow-wrap: break-word;
  text-wrap: balance;
}

.hero h1 {
  max-width: var(--case-project-title-max);
  margin: var(--case-index-title-gap) 0 0;
  font-size: var(--case-project-title-size);
  font-weight: var(--case-project-title-weight);
  line-height: var(--case-project-title-leading);
}

.eyebrow,
.audience {
  margin: 0;
  font-family: var(--call-mono);
  font-size: 0.6875rem;
  line-height: 1.3;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--call-signal-ink);
}

.audience {
  margin-top: 0.875rem;
  color: var(--call-muted);
}

.proposition {
  max-width: 50ch;
  margin-block: var(--case-title-body-gap) 0;
  color: var(--call-muted);
  font-size: 1.1875rem;
  line-height: 1.6;
}

.facts {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.7fr) minmax(0, 0.7fr);
  gap: 1.25rem;
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--call-line);
}

.facts div {
  min-width: 0;
}

.facts dt {
  color: #747a72;
  font: 500 0.625rem/1.2 var(--call-mono);
  text-transform: uppercase;
}

.facts dd {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.45;
}

.heroMeta > :last-child:not(.facts) {
  margin-top: 1.625rem;
}

.heroMedia {
  width: 100%;
  margin: 0;
}

.case > section h2 {
  max-width: var(--case-chapter-title-max);
  margin-block: 0 var(--case-title-body-gap);
  font-size: var(--case-chapter-title-size);
  font-weight: var(--case-chapter-title-weight);
  line-height: var(--case-chapter-title-leading);
}

.case > section {
  padding: clamp(5.5rem, 10vw, 9.5rem) clamp(0rem, 2vw, 2rem);
  border-top: 1px solid var(--call-line);
  scroll-margin-top: 5rem;
}

.case :global(.call-reading) {
  max-width: 48rem;
  margin-top: 2rem;
  color: var(--call-muted);
  font-size: 1rem;
  line-height: 1.75;
}

.case :global(.call-reading--lead) {
  max-width: 42rem;
  color: var(--call-ink);
  font-size: 1.1875rem;
  line-height: 1.6;
}

.case :global(.call-dark-band) {
  overflow: clip;
  margin-inline: calc(clamp(1.25rem, 3vw, 3.5rem) * -1);
  padding-inline: clamp(1.25rem, 5vw, 5rem);
  border: 0;
  border-radius: 0;
  background: var(--call-runtime);
  color: #f4f6f2;
}

.case :global(.call-dark-band) :global(.call-reading) {
  color: #b9beb6;
}

.case > section h2 + :global(.call-reading) {
  margin-block-start: 0;
}

.case > section > :global([data-call-agent-browser]) {
  width: 100%;
  margin-inline: auto;
}

.case > section > :global([data-call-agent-browser]) + :global([data-call-agent-browser]) {
  margin-top: 2rem;
}

@media (max-width: 1199px) {
  .frame {
    grid-template-columns: 1fr;
  }

  .rail {
    position: relative;
    z-index: 20;
    padding-block-start: 5.5rem;
  }

  .heroTop {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

@media (max-width: 767px) {
  .frame {
    padding-inline: 1rem;
  }

  .rail {
    padding-block-start: 4.5rem;
  }

  .hero {
    gap: 2rem;
    padding-block: 3.25rem 4.5rem;
  }

  .hero h1 {
    max-width: none;
  }

  .facts {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .heroMedia {
    margin: 0;
  }

  .case > section {
    padding: 6rem 0;
  }

  .case :global(.call-dark-band) {
    margin-inline: -1rem;
    padding-inline: 1rem;
  }
}
```

- [ ] **Step 6: Run focused tests and inspect the diff**

Run:

```bash
npx vitest run tests/component/call-agent-layout.test.tsx tests/unit/portfolio-detail-system.test.ts tests/component/case-study.test.tsx
git diff --check
```

Expected: tests PASS and `git diff --check` exits 0.

- [ ] **Step 7: Commit Hero and detail-system alignment**

```bash
git add components/call-agent/call-agent-layout.tsx components/call-agent/call-agent-layout.module.css components/case-study/chapter-nav.tsx components/case-study/chapter-nav.module.css tests/component/call-agent-layout.test.tsx tests/component/case-study.test.tsx tests/unit/portfolio-detail-system.test.ts
git commit -m "style: align call agent hero and typography"
```

### Task 4: Replace Obsolete Browser Contracts With Responsive Tab Geometry

**Files:**
- Modify: `tests/e2e/call-agent.visual.spec.ts:21-159`
- Modify: `tests/e2e/call-agent.spec.ts:37-54`

- [ ] **Step 1: Write browser tests for the new structure before adjusting old expectations**

Add these tests to `call-agent.visual.spec.ts`:

```ts
test('tabs stay above a stable media viewport at every screen size', async ({ page }) => {
  const tablist = page.getByRole('tablist', { name: '产品阶段' });
  const media = page.locator('[data-call-agent-media-stage]');
  await tablist.scrollIntoViewIfNeeded();

  const before = await media.boundingBox();
  const tablistBox = await tablist.boundingBox();
  expect(before).not.toBeNull();
  expect(tablistBox).not.toBeNull();
  expect(tablistBox!.y + tablistBox!.height).toBeLessThanOrEqual(before!.y + 1);

  const tabs = tablist.getByRole('tab');
  await expect(tabs).toHaveCount(6);
  for (const tab of await tabs.all()) {
    await expect(tab).toHaveCSS('height', '38px');
  }

  await page.getByRole('tab', { name: '发布', exact: true }).click();
  const after = await media.boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);
  await expect(page.getByRole('tabpanel', { name: '发布' })).toHaveAttribute('data-active', 'true');
});

test('the project title and Hero media never overlap', async ({ page }) => {
  const top = await page.locator('[data-call-agent-hero-top]').boundingBox();
  const media = await page.locator('[data-call-agent-hero-media]').boundingBox();
  expect(top).not.toBeNull();
  expect(media).not.toBeNull();
  expect(top!.y + top!.height).toBeLessThanOrEqual(media!.y);
});

test('Call Agent uses the shared title scale and normalized reading scale', async ({ page }) => {
  const h1 = page.locator('[data-call-agent-hero] h1');
  const h2 = page.locator('[data-case-study] > section h2').first();
  const lead = page.locator('.call-reading--lead').first();
  const body = page.locator('.call-reading:not(.call-reading--lead)').first();

  const h1Metrics = await h1.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
    };
  });
  expect(h1Metrics.lineHeight / h1Metrics.fontSize).toBeCloseTo(1.06, 1);
  await expect(h2).toHaveCSS('font-weight', '600');
  await expect(lead).toHaveCSS('font-size', '19px');
  await expect(body).toHaveCSS('font-size', '16px');
});
```

- [ ] **Step 2: Run the focused browser file and confirm old behavior fails**

Run:

```bash
npx playwright test tests/e2e/call-agent.visual.spec.ts --project=desktop
```

Expected: new tests FAIL against the old deployed component contract if Task 1-3 changes are temporarily reverted; with Task 1-3 present, obsolete sticky-stage tests fail and identify assertions that must be removed.

- [ ] **Step 3: Remove old sticky/static screen assumptions**

Delete tests that require:

- a left-side `ol` step list;
- a sticky media viewport;
- final-stage dwell while scrolling;
- six visible static stages on mobile or reduced motion;
- a 20px browser and dark-band radius.

Retain the video-edge helper, approved media-source checks, Hero sequence handoff, two-media 32px section spacing, and title line-count check. Change stage selectors from `ol [data-stage-id]` to `getByRole('tab', { name })`, remove the obsolete `cinematic` mode assertion, and assert `getComputedStyle(video).objectFit === 'contain'` for system-stage clips so differently proportioned sources are not stretched.

- [ ] **Step 4: Update print and overflow coverage**

In `call-agent.spec.ts`, retain the print expectation that all six `[data-static-stage]` nodes become visible. Add:

```ts
await expect(page.getByRole('tablist', {
  name: locale === 'zh' ? '产品阶段' : 'Product stages',
})).toBeVisible();
await expect(page.getByRole('tab')).toHaveCount(6);
```

Keep the existing document overflow assertion `<= 1px`; horizontal tab scrolling must remain internal to the tablist.

- [ ] **Step 5: Run Call Agent browser coverage across all projects**

Run:

```bash
npx playwright test tests/e2e/call-agent.spec.ts tests/e2e/call-agent.visual.spec.ts
```

Expected: desktop, tablet, and mobile projects PASS with no title/media overlap or document-level horizontal overflow.

- [ ] **Step 6: Commit browser contracts**

```bash
git add tests/e2e/call-agent.spec.ts tests/e2e/call-agent.visual.spec.ts
git commit -m "test: cover call agent tab geometry"
```

### Task 5: Visual Review, Full Verification, And Deployment Readiness

**Files:**
- Modify only if verification exposes a scoped Call Agent defect.
- Capture temporary screenshots under `output/playwright/`; do not commit them.

- [ ] **Step 1: Start the local server**

Run:

```bash
npm run dev -- --port 4178
```

Expected: Next.js reports `http://localhost:4178` and remains running for visual checks.

- [ ] **Step 2: Capture Chinese and English screenshots at required viewports**

Use Playwright to capture full-page and Hero/product-system screenshots for:

```text
/zh/work/call-agent/ at 390x844, 768x1024, 1440x900, 1728x1117
/en/work/call-agent/ at 390x844, 768x1024, 1440x900, 1728x1117
```

Store them under `output/playwright/call-agent/`. Inspect for title/media overlap, clipped English tabs, unreadable green text, nested-card appearance, oversized section gaps, and browser frames that change height between stages.

- [ ] **Step 3: Run focused tests after any visual corrections**

Run:

```bash
npx vitest run tests/component/call-agent-layout.test.tsx tests/unit/portfolio-detail-system.test.ts
npx playwright test tests/e2e/call-agent.spec.ts tests/e2e/call-agent.visual.spec.ts
```

Expected: all focused tests PASS.

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
npm run lint
npm test
npm run test:e2e
NEXT_PUBLIC_BASE_PATH=/yangjing-portfolio npm run build
NEXT_PUBLIC_BASE_PATH=/yangjing-portfolio npm run test:export
git diff --check
```

Expected:

- ESLint: 0 errors; only previously known warnings remain.
- Vitest: all test files and tests pass.
- Playwright: all projects pass.
- Next.js: 19 static pages generate successfully.
- Static export tests: all pass.
- `git diff --check`: exit 0.

- [ ] **Step 5: Commit any final scoped correction**

If Step 2 required a scoped correction, commit only the affected Call Agent and test files:

```bash
git add components/call-agent components/case-study/chapter-nav.tsx components/case-study/chapter-nav.module.css tests/component/call-agent-layout.test.tsx tests/component/case-study.test.tsx tests/unit/portfolio-detail-system.test.ts tests/e2e/call-agent.spec.ts tests/e2e/call-agent.visual.spec.ts
git commit -m "fix: finalize call agent responsive polish"
```

If Step 2 required no correction, do not create an empty commit.

- [ ] **Step 6: Confirm the branch is ready for integration**

Run:

```bash
git status --short --branch
git log -5 --oneline
```

Expected: clean worktree and the interaction, visual, and browser-test commits at the branch tip. Do not push or deploy until the user chooses the integration action.
