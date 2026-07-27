# ConvoAI Call Agent-Style Hero Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the ConvoAI opening into a Call Agent-style information hierarchy while preserving its dark visual system, media behavior, motion, and responsive phone geometry.

**Architecture:** `ConvoAiLayout` owns the external project title, proposition, facts, and opening order. `ConvoAiStage` gains a narrowly scoped media-only mode that reuses the external title and proposition for accessible naming while keeping all existing Web/App surfaces and GSAP hooks. Responsive frame gutters live once on the ConvoAI detail column: `60px` desktop, `32px` tablet, and `16px` mobile.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, GSAP.

---

## File Map

- Modify `tests/component/convo-ai-media.test.tsx`: define default-stage and media-only-stage semantic behavior.
- Modify `tests/component/convo-ai-layout.test.tsx`: define the page-opening title, facts, Banner, Hero, and hint order.
- Modify `components/convo-ai/convo-ai-media.tsx`: add media-only stage props and external accessible references.
- Modify `components/convo-ai/convo-ai-layout.tsx`: move opening copy and facts above Banner and Hero.
- Modify `components/convo-ai/convo-ai-layout.module.css`: implement the two-column top block and responsive frame gutters.
- Modify `tests/e2e/convo-ai.spec.ts`: verify localized headings, visual order, responsive gutters, and overflow.

### Task 1: Define The Media-Only Stage Contract

**Files:**
- Modify: `tests/component/convo-ai-media.test.tsx`
- Modify: `components/convo-ai/convo-ai-media.tsx`

- [ ] **Step 1: Write the failing component test**

Keep the existing default-stage assertion and add a Hero media-only case using this public API:

```tsx
render(
  <>
    <h1 id="external-title">ConvoAI full project title</h1>
    <p id="external-description">External proposition</p>
    <ConvoAiStage
      locale="en"
      eyebrow="AGORA / SHIPPED PRODUCT / APP + WEB"
      title="ConvoAI"
      description="Internal description"
      webId="web-join-exit"
      appId="app-conversation-start"
      hero
      mediaOnly
      labelledBy="external-title"
      describedBy="external-description"
    />
  </>,
);

const stage = document.querySelector('[data-convo-ai-stage]')!;
expect(stage).toHaveAttribute('aria-labelledby', 'external-title');
expect(stage).toHaveAttribute('aria-describedby', 'external-description');
expect(within(stage).queryByRole('heading')).not.toBeInTheDocument();
expect(stage.querySelector('[data-stage-display-title]')).not.toBeInTheDocument();
expect(within(stage).getAllByLabelText(/ConvoAI/i)).toHaveLength(2);
expect(within(stage).getAllByLabelText(/ConvoAI/i).every((video) => video.getAttribute('aria-describedby') === 'external-description')).toBe(true);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because `mediaOnly`, `labelledBy`, and `describedBy` are not accepted and the stage still renders internal copy.

- [ ] **Step 3: Implement the minimal stage API**

Add the optional props without changing default behavior:

```ts
type ConvoAiStageProps = {
  readonly locale: Locale;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly webId: ConvoAiMediaId;
  readonly appId: ConvoAiMediaId;
  readonly hero?: boolean;
  readonly mediaOnly?: boolean;
  readonly labelledBy?: string;
  readonly describedBy?: string;
};
```

Always call `useId`, choose `activeDescriptionId` from the external ID in media-only mode, conditionally omit the internal stage copy, and set the stage root's `aria-labelledby` and `aria-describedby`. Preserve `data-convo-ai-stage`, `data-hero`, `data-convo-web-plane`, `data-convo-app-device`, media sizing, focus controls, and video sound controls.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: PASS with the default stage still rendering its internal semantic heading and the media-only stage rendering neither internal heading nor display title.

- [ ] **Step 5: Commit the stage contract**

```bash
git add tests/component/convo-ai-media.test.tsx components/convo-ai/convo-ai-media.tsx
git commit -m "feat: add media-only ConvoAI stage"
```

### Task 2: Reorder The Opening Information Architecture

**Files:**
- Modify: `tests/component/convo-ai-layout.test.tsx`
- Modify: `components/convo-ai/convo-ai-layout.tsx`

- [ ] **Step 1: Write the failing layout test**

Use a fixture title long enough to prove the metadata title is used verbatim:

```ts
title: 'ConvoAI: Make real-time AI conversation legible',
proposition: 'Make invisible real-time states perceptible, interruptible, and recoverable.',
```

Assert exactly one H1, that it lives in `[data-convo-hero-copy]`, and that the external title/proposition IDs label the media-only stage. Assert facts live in `[data-convo-hero-meta]`. Assert direct opening order through DOM positions:

```ts
const heroTop = container.querySelector('[data-convo-hero-top]')!;
const banner = container.querySelector('[data-convo-launch-banner]')!;
const heroMedia = container.querySelector('[data-convo-hero-media]')!;
const hint = container.querySelector('[data-convo-next-section-hint]')!;

expect(heroTop.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
expect(banner.compareDocumentPosition(heroMedia) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
expect(heroMedia.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
```

Also assert `[data-stage-display-title]` is absent in the opening Hero and both Hero videos use the external proposition ID.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run tests/component/convo-ai-layout.test.tsx
```

Expected: FAIL because the Hero stage currently precedes facts and contains the only H1 and proposition.

- [ ] **Step 3: Implement the approved opening order**

In `ConvoAiLayout`, create stable localized IDs:

```ts
const titleId = `convo-ai-title-${locale}`;
const propositionId = `convo-ai-proposition-${locale}`;
```

Render these direct blocks inside the opening header:

```tsx
<div className={styles.heroTop} data-convo-hero-top>
  <div className={styles.heroCopy} data-convo-hero-copy>
    <p className={styles.eyebrow}>AGORA / SHIPPED PRODUCT / APP + WEB</p>
    <h1 id={titleId}>{meta.title}</h1>
    <p className={styles.proposition} id={propositionId}>{meta.proposition}</p>
  </div>
  <div className={styles.heroMeta} data-convo-hero-meta>
    <dl className={styles.facts} aria-label={text.facts}>
      <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
      <div><dt>{text.scope}</dt><dd>App + Web</dd></div>
      <div><dt>{text.product}</dt><dd>{locale === 'zh' ? '1 对 1 实时 AI 对话' : '1:1 real-time AI conversation'}</dd></div>
      <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
    </dl>
  </div>
</div>
<ConvoAiLaunchBanner locale={locale} />
<div className={styles.heroMedia} data-convo-hero-media>
  <ConvoAiStage
    locale={locale}
    eyebrow="AGORA / SHIPPED PRODUCT / APP + WEB"
    title="ConvoAI"
    description={meta.proposition}
    webId="web-join-exit"
    appId="app-conversation-start"
    hero
    mediaOnly
    labelledBy={titleId}
    describedBy={propositionId}
  />
</div>
<div className={styles.nextHint} data-convo-next-section-hint>{text.hint}</div>
```

Add `data-convo-detail-frame` to the article as the stable responsive-gutter test target. Do not alter fact values, Banner props, chapter order, or section copy.

- [ ] **Step 4: Run both component tests and verify GREEN**

Run:

```bash
npm test -- --run tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
```

Expected: PASS, with one external H1 and unchanged default-stage semantics.

- [ ] **Step 5: Commit the opening structure**

```bash
git add tests/component/convo-ai-layout.test.tsx components/convo-ai/convo-ai-layout.tsx
git commit -m "feat: reorder ConvoAI opening hierarchy"
```

### Task 3: Implement Desktop, Tablet, And Mobile Geometry

**Files:**
- Modify: `tests/e2e/convo-ai.spec.ts`
- Modify: `components/convo-ai/convo-ai-layout.module.css`

- [ ] **Step 1: Write failing browser assertions**

Update the localized H1 expectations to the metadata titles:

```ts
const projectTitles = {
  en: 'ConvoAI',
  zh: 'ConvoAI：让实时 AI 对话可感知、可介入、可恢复',
} as const;
```

Add an opening-layout test that reads bounding boxes for `[data-convo-hero-top]`, `[data-convo-hero-copy]`, `[data-convo-hero-meta]`, `[data-convo-launch-banner]`, `[data-convo-hero-media]`, and `[data-convo-next-section-hint]`. Assert:

```ts
expect(topBox!.y + topBox!.height).toBeLessThanOrEqual(bannerBox!.y + 1);
expect(bannerBox!.y + bannerBox!.height).toBeLessThanOrEqual(mediaBox!.y + 1);
expect(mediaBox!.y + mediaBox!.height).toBeLessThanOrEqual(hintBox!.y + 1);
```

For desktop, assert copy and facts overlap vertically as side-by-side columns and the right gutter equals `60px` within one pixel. For tablet, assert facts begin below copy and the right gutter equals `32px`. For mobile, call `page.setViewportSize({ width: 375, height: 812 })`, reload, assert a `16px` right gutter, stacked top content, preserved order, and:

```ts
expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
```

- [ ] **Step 2: Run the browser layout test and verify RED**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=tablet --project=mobile --grep "opening hierarchy"
```

Expected: FAIL because the new responsive top grid and exact detail-frame gutters are not styled yet.

- [ ] **Step 3: Implement the ConvoAI layout CSS**

Apply a single right gutter to the detail column and build the top grid:

```css
.case {
  min-width: 0;
  padding-right: 60px;
}

.hero {
  display: grid;
  gap: clamp(2.5rem, 5vw, 5rem);
  min-height: calc(100svh - 4rem);
  padding-block: clamp(5rem, 9vw, 9rem) clamp(3rem, 6vw, 6rem);
}

.heroTop {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(17rem, 0.8fr);
  align-items: end;
  gap: clamp(2rem, 5vw, 6rem);
}

.proposition {
  max-width: 50ch;
}

.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

Use the repository's existing project-title CSS variables for the H1 rather than introducing a viewport-scaled font formula. Retain the current near-black colors, facts dividers, Banner styles, next-hint styles, and media rules. At `max-width: 1099px`, set `.case { padding-inline: 32px; }`, stack `.heroTop`, and keep facts before Banner. At `max-width: 767px`, set `.case { padding-inline: 16px; }`; keep the facts in two columns only if the existing values fit at `375px`, otherwise use one column. Do not add margins to the Banner or stage to simulate the gutter.

- [ ] **Step 4: Run browser tests and refine only failing geometry**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=tablet --project=mobile
```

Expected: PASS with correct order, gutters, no overflow, all recordings accessible, and existing responsive media bounds intact.

- [ ] **Step 5: Run component regression tests**

Run:

```bash
npm test -- --run tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit responsive geometry and E2E coverage**

```bash
git add tests/e2e/convo-ai.spec.ts components/convo-ai/convo-ai-layout.module.css
git commit -m "style: align ConvoAI opening with Call Agent"
```

### Task 4: Verify The Integrated Page

**Files:**
- Verify: `components/convo-ai/convo-ai-layout.tsx`
- Verify: `components/convo-ai/convo-ai-media.tsx`
- Verify: `components/convo-ai/convo-ai-layout.module.css`
- Verify: `tests/component/convo-ai-layout.test.tsx`
- Verify: `tests/component/convo-ai-media.test.tsx`
- Verify: `tests/e2e/convo-ai.spec.ts`

- [ ] **Step 1: Run focused component tests**

```bash
npm test -- --run tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run all ConvoAI browser projects**

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=tablet --project=mobile
```

Expected: PASS.

- [ ] **Step 3: Run static checks and production build**

```bash
npm run lint
npm run build:framework
git diff --check
```

Expected: all commands exit `0`; the build renders both `/en/work/convo-ai/` and `/zh/work/convo-ai/` without type or route errors.

- [ ] **Step 4: Inspect rendered screenshots**

Start the repository's static preview command on an unused local port. Capture `/zh/work/convo-ai/` at `1440px` and `375px`. Confirm the title/facts, Banner, Web + App Hero, and next hint appear in the approved order; right boundaries line up; the desktop right gutter is `60px`; mobile uses `16px` gutters; and the phone retains its current portrait proportions.

- [ ] **Step 5: Review the final diff against non-goals**

Confirm no changes to copy, facts, chapters, media assets, Call Agent, Footer, top navigation, chapter navigation, Banner artwork, video playback controls, GSAP trigger selectors, or reduced-motion logic.

- [ ] **Step 6: Commit any verification-only corrections**

If verification required code corrections, repeat the affected focused test's RED/GREEN cycle and commit only the corrected files:

```bash
git add components/convo-ai tests/component tests/e2e/convo-ai.spec.ts
git commit -m "fix: preserve ConvoAI opening responsiveness"
```

If no correction was required, do not create an empty commit.
