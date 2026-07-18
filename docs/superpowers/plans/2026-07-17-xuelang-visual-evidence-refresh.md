# Xuelang Visual Evidence Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the Xuelang opening and learning evidence with the supplied background, note screens, and interaction board while removing the Hero PDF action.

**Architecture:** Keep the existing Xuelang layout and evidence-story structure. Extend the Xuelang asset manifest with traceable supplied sources, add one focused `XuelangInteractionBoard` presentation component, and keep bilingual narrative data in MDX. CSS scopes the opening background, responsive evidence rail, and print behavior to the Xuelang case.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, CSS Modules, Sharp asset preparation, Vitest, Testing Library, agent-browser.

---

## File Map

- Modify `evidence/xuelang/manifest.json`: register the opening background and replace note/interaction source records.
- Add binary sources under `evidence/xuelang/source/`: preserve the six supplied PNGs with semantic names.
- Generate WebP files under `public/images/xuelang/` through `npm run prepare:xuelang`.
- Modify `components/xuelang/xuelang-layout.tsx`: remove the PDF action and mark the opening surface.
- Modify `components/xuelang/xuelang-layout.module.css`: add the approved background fusion and remove dead PDF styles.
- Create `components/xuelang/xuelang-interaction-board.tsx`: render the board and semantic localized evidence rail.
- Create `components/xuelang/xuelang-interaction-board.module.css`: own desktop, narrow, and print-neutral board layout.
- Modify `components/xuelang/xuelang-evidence.tsx`: allow learning state 04 to render the dedicated board.
- Modify `content/work/xuelang.zh.mdx` and `content/work/xuelang.en.mdx`: wire the interaction evidence and supplied note screens.
- Modify `components/xuelang/xuelang-print.css`: ensure static interaction evidence and an economical opening background.
- Modify `tests/unit/xuelang-assets.test.ts`, `tests/unit/xuelang-content.test.ts`, and `tests/component/xuelang-layout.test.tsx`.
- Create `tests/component/xuelang-interaction-board.test.tsx`.

### Task 1: Register And Generate Supplied Assets

**Files:**
- Modify: `tests/unit/xuelang-assets.test.ts`
- Modify: `evidence/xuelang/manifest.json`
- Add: `evidence/xuelang/source/opening-background.png`
- Add: `evidence/xuelang/source/learning-note-player.png`
- Add: `evidence/xuelang/source/learning-note-list.png`
- Add: `evidence/xuelang/source/learning-note-editor.png`
- Add: `evidence/xuelang/source/learning-interaction-board.png`
- Add: `evidence/xuelang/source/learning-interaction-copy-reference.png`
- Generate: `public/images/xuelang/opening-background.webp`
- Generate: `public/images/xuelang/learning-note-player.webp`
- Generate: `public/images/xuelang/learning-note-list.webp`
- Generate: `public/images/xuelang/learning-note-editor.webp`
- Generate: `public/images/xuelang/learning-interaction.webp`

- [ ] **Step 1: Write the failing asset contract**

Add a test that selects `opening-background`, `learning-interaction`, and the three note IDs and asserts semantic source paths, output paths, and supplied intrinsic dimensions. Assert that `learning-interaction-copy-reference.png` is not a published manifest source.

```ts
expect(refreshAssets.map(({ id, sourcePaths, output, intrinsic }) => ({
  id, sourcePaths, output, intrinsic,
}))).toEqual([
  {
    id: 'opening-background',
    sourcePaths: ['evidence/xuelang/source/opening-background.png'],
    output: 'public/images/xuelang/opening-background.webp',
    intrinsic: { width: 3840, height: 2160 },
  },
  {
    id: 'learning-interaction',
    sourcePaths: ['evidence/xuelang/source/learning-interaction-board.png'],
    output: 'public/images/xuelang/learning-interaction.webp',
    intrinsic: { width: 3840, height: 1876 },
  },
  {
    id: 'learning-note-player',
    sourcePaths: ['evidence/xuelang/source/learning-note-player.png'],
    output: 'public/images/xuelang/learning-note-player.webp',
    intrinsic: { width: 904, height: 1958 },
  },
  {
    id: 'learning-note-list',
    sourcePaths: ['evidence/xuelang/source/learning-note-list.png'],
    output: 'public/images/xuelang/learning-note-list.webp',
    intrinsic: { width: 904, height: 1958 },
  },
  {
    id: 'learning-note-editor',
    sourcePaths: ['evidence/xuelang/source/learning-note-editor.png'],
    output: 'public/images/xuelang/learning-note-editor.webp',
    intrinsic: { width: 904, height: 1958 },
  },
]);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx vitest run tests/unit/xuelang-assets.test.ts --testTimeout=30000`

Expected: FAIL because the semantic supplied source records do not exist.

- [ ] **Step 3: Preserve sources and update the manifest**

Copy the supplied PNG bytes to the semantic source paths. Add `opening-background`, replace the existing `learning-interaction` record, and update the three note records to full-image crops:

```json
{
  "id": "opening-background",
  "chapter": "00",
  "sourceFrames": ["portfolio-supplied-opening-background"],
  "sourcePaths": ["evidence/xuelang/source/opening-background.png"],
  "output": "public/images/xuelang/opening-background.webp",
  "format": "webp",
  "crop": { "left": 0, "top": 0, "width": 3840, "height": 2160 },
  "intrinsic": { "width": 3840, "height": 2160 },
  "purpose": "Blend a restrained landscape atmosphere through the Xuelang Hero and overview.",
  "alt": { "zh": "", "en": "" },
  "replacementPath": "figma://portfolio-supplied/xuelang-opening-background"
}
```

Because the manifest validator requires non-empty alt text, use descriptive traceability text in the manifest while rendering the actual background decoratively with no accessible name.

- [ ] **Step 4: Generate derivatives**

Run: `npm run prepare:xuelang`

Expected: the five WebP outputs are regenerated successfully from the semantic PNG sources.

- [ ] **Step 5: Run the asset test**

Run: `npx vitest run tests/unit/xuelang-assets.test.ts --testTimeout=30000`

Expected: PASS.

- [ ] **Step 6: Commit the asset unit**

```bash
git add evidence/xuelang/manifest.json evidence/xuelang/source public/images/xuelang tests/unit/xuelang-assets.test.ts
git commit -m "feat: refresh Xuelang learning evidence assets"
```

### Task 2: Remove The PDF Action And Add The Opening Background

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-layout.module.css`

- [ ] **Step 1: Replace the PDF expectations with opening-surface assertions**

```ts
expect(screen.queryByRole('link', { name: /PDF/i })).not.toBeInTheDocument();
expect(container.querySelector('[data-xuelang-opening]')).toBeInTheDocument();
expect(container.querySelector('[data-xuelang-hero]')).toBeInTheDocument();
```

Keep the existing Hero product-state, metadata, chapter-navigation, and proof assertions.

- [ ] **Step 2: Run the layout test and confirm failure**

Run: `npx vitest run tests/component/xuelang-layout.test.tsx --testTimeout=30000`

Expected: FAIL because the PDF link still renders and the opening marker is absent.

- [ ] **Step 3: Remove the PDF action from the layout**

Remove the `Download` import, localized `download` and `downloadSize` fields, `pdfHref`, and the anchor. Add `data-xuelang-opening` to the case surface used by the background layer.

- [ ] **Step 4: Add the approved background treatment**

Use a single decorative pseudo-element behind the Hero and first overview screen:

```css
.case {
  position: relative;
  isolation: isolate;
}

.case::before {
  position: absolute;
  z-index: -1;
  inset: 0 0 auto;
  height: max(100rem, 180vh);
  background: url('/images/xuelang/opening-background.webp') center top / cover no-repeat;
  content: '';
  opacity: 0.2;
  pointer-events: none;
}

.content > :global(section:not(#overview)) {
  position: relative;
  background: var(--xuelang-paper);
}
```

Delete `.pdfAction` rules and responsive references. Keep content and the dark panorama above the decorative layer.

- [ ] **Step 5: Run the layout test**

Run: `npx vitest run tests/component/xuelang-layout.test.tsx --testTimeout=30000`

Expected: PASS.

- [ ] **Step 6: Commit the opening unit**

```bash
git add components/xuelang/xuelang-layout.tsx components/xuelang/xuelang-layout.module.css tests/component/xuelang-layout.test.tsx
git commit -m "feat: refine Xuelang opening atmosphere"
```

### Task 3: Build The Interaction Evidence Board

**Files:**
- Create: `tests/component/xuelang-interaction-board.test.tsx`
- Create: `components/xuelang/xuelang-interaction-board.tsx`
- Create: `components/xuelang/xuelang-interaction-board.module.css`
- Modify: `components/xuelang/xuelang-evidence.tsx`

- [ ] **Step 1: Write the failing component test**

Test Chinese and English copy, the product image, semantic list, and observed figures:

```tsx
render(<XuelangInteractionBoard locale="zh" />);
expect(screen.getByRole('img', { name: /播放控制与课时切换/ })).toHaveAttribute(
  'src', '/images/xuelang/learning-interaction.webp',
);
expect(screen.getAllByRole('listitem')).toHaveLength(3);
for (const value of ['52.62%', '42.21%', '7.49%', '36.5 min']) {
  expect(screen.getByText(new RegExp(value.replace('.', '\\.')))).toBeVisible();
}
```

- [ ] **Step 2: Run the component test and confirm failure**

Run: `npx vitest run tests/component/xuelang-interaction-board.test.tsx --testTimeout=30000`

Expected: FAIL because `XuelangInteractionBoard` does not exist.

- [ ] **Step 3: Implement the focused component**

Create a locale map with three evidence items and render a `<figure data-interaction-board>`, one product `<img>`, and an ordered list. Use observed-behavior language and avoid causal claims.

```tsx
export function XuelangInteractionBoard({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return (
    <figure className={styles.board} data-interaction-board>
      <div className={styles.canvas}>
        <img src="/images/xuelang/learning-interaction.webp" alt={text.alt} />
        <ol className={styles.rail} aria-label={text.label}>
          {text.items.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{item.title}</strong><p>{item.description}</p></div>
            </li>
          ))}
        </ol>
      </div>
      <figcaption>{text.caption}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 4: Style desktop and narrow layouts**

Keep a stable wide canvas. On desktop, position a 30–34% rail on the right with translucent paper surfaces and a green left rule. Below `760px`, use normal document flow and place the list below the image; never overlap text and product UI.

- [ ] **Step 5: Extend the learning-state type**

Add `interactionBoard?: boolean` to `LearningState`, import the new component, and render it before the generic image branch:

```tsx
{state.courseEntry ? (
  <XuelangCourseEntry locale={locale} />
) : state.interactionBoard ? (
  <XuelangInteractionBoard locale={locale} />
) : state.image ? (
  <XuelangFigure {...state.image} locale={locale} />
) : null}
```

- [ ] **Step 6: Run the component test**

Run: `npx vitest run tests/component/xuelang-interaction-board.test.tsx --testTimeout=30000`

Expected: PASS.

- [ ] **Step 7: Commit the component unit**

```bash
git add components/xuelang/xuelang-interaction-board.tsx components/xuelang/xuelang-interaction-board.module.css components/xuelang/xuelang-evidence.tsx tests/component/xuelang-interaction-board.test.tsx
git commit -m "feat: add Xuelang interaction evidence board"
```

### Task 4: Wire Bilingual Content And Note Evidence

**Files:**
- Modify: `tests/unit/xuelang-content.test.ts`
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`

- [ ] **Step 1: Write failing content assertions**

Assert `interactionBoard: true`, the absence of a generic `image` on state 04, and the three semantic note paths in both locales. Assert the Chinese and English observed-data qualifiers are present.

```ts
expect(learningZh).toContain('interactionBoard: true');
expect(learningEn).toContain('interactionBoard: true');
for (const source of ['learning-note-player.webp', 'learning-note-list.webp', 'learning-note-editor.webp']) {
  expect(learningZh).toContain(`/images/xuelang/${source}`);
  expect(learningEn).toContain(`/images/xuelang/${source}`);
}
```

- [ ] **Step 2: Run the content test and confirm failure**

Run: `npx vitest run tests/unit/xuelang-content.test.ts --testTimeout=30000`

Expected: FAIL because state 04 still uses the generic image branch and old copy.

- [ ] **Step 3: Wire state 04 to the dedicated board**

In both MDX files, replace the state 04 `image` object with `interactionBoard: true`. Keep the state title and concise sequence description.

- [ ] **Step 4: Update the note evidence dimensions and labels**

Use `904×1958` for all three note images. Keep the primary editor mapping to `learning-note-editor.webp`; supporting order is player then list. Preserve the capture → edit → accumulate narrative in localized labels and captions.

- [ ] **Step 5: Run content and layout tests**

Run: `npx vitest run tests/unit/xuelang-content.test.ts tests/component/xuelang-layout.test.tsx tests/component/xuelang-interaction-board.test.tsx --testTimeout=30000`

Expected: PASS.

- [ ] **Step 6: Commit the content unit**

```bash
git add content/work/xuelang.zh.mdx content/work/xuelang.en.mdx tests/unit/xuelang-content.test.ts
git commit -m "content: update Xuelang learning evidence"
```

### Task 5: Print, Responsive, And Full Verification

**Files:**
- Modify: `components/xuelang/xuelang-print.css`
- Modify: `components/xuelang/xuelang-layout.module.css`
- Modify: `components/xuelang/xuelang-interaction-board.module.css`

- [ ] **Step 1: Add print rules**

```css
@media print {
  [data-xuelang-opening]::before { display: none !important; }
  [data-interaction-board] { break-inside: avoid; }
  [data-interaction-board] > div { display: grid !important; grid-template-columns: 1.45fr 0.55fr !important; }
  [data-interaction-board] img { width: 100% !important; height: auto !important; object-fit: contain !important; }
  [data-interaction-board] ol { position: static !important; }
}
```

- [ ] **Step 2: Run focused and complete tests**

Run: `npx vitest run tests/unit/xuelang-assets.test.ts tests/unit/xuelang-content.test.ts tests/component/xuelang-layout.test.tsx tests/component/xuelang-interaction-board.test.tsx --testTimeout=30000`

Expected: PASS.

Run: `npm test -- --testTimeout=30000`

Expected: complete Vitest suite passes.

- [ ] **Step 3: Run static verification**

Run: `npm run lint`

Expected: zero errors; record any pre-existing warnings separately.

Run: `npm run build:framework`

Expected: Next.js production build succeeds and all static pages generate.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 4: Verify with agent-browser**

At `1440×1000` and `1728×1100`, inspect both `/zh/work/xuelang/` and `/en/work/xuelang/`. Confirm the 20% opening background, no PDF action, readable Hero, complete interaction product board, right-side evidence rail, and inspectable note screens.

At `390×844`, confirm the interaction rail moves below the image, no horizontal overflow exists, and note screens remain legible.

Use browser evaluation to assert `document.documentElement.scrollWidth === document.documentElement.clientWidth` at every viewport.

- [ ] **Step 5: Verify print presentation**

Print or render the Xuelang page to PDF and inspect the opening, interaction board, and note evidence. Confirm the decorative background is removed or quiet, the three interaction evidence groups are visible, and images use `object-fit: contain` without clipping.

- [ ] **Step 6: Commit verification fixes**

```bash
git add components/xuelang/xuelang-print.css components/xuelang/xuelang-layout.module.css components/xuelang/xuelang-interaction-board.module.css
git commit -m "fix: polish Xuelang evidence presentation"
```
