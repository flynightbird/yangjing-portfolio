# Agora Meeting Product Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the bilingual Agora Meeting case study as a product-first showcase that communicates value and delivery scope within one scan while retaining the original system reasoning as compact evidence and accessible deep dives.

**Architecture:** Keep the existing Next.js MDX content pipeline and `/[locale]/work/meeting/` routes. Reduce the visible navigation from eight equal chapters to six product-led bands, preserve the four retired chapter IDs as anchor aliases, add two focused showcase primitives, and restyle only the Meeting layout/models/evidence surfaces.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, CSS Modules, Vitest, Testing Library, Playwright

---

### Task 1: Lock The Product-First Narrative Contract

**Files:**
- Modify: `tests/unit/meeting-content.test.ts`
- Modify: `tests/component/meeting-layout.test.tsx`
- Create: `tests/component/meeting-showcase.test.tsx`
- Modify: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Replace the eight-chapter content expectation with six visible bands and four legacy aliases**

Use this exact visible chapter contract in `tests/unit/meeting-content.test.ts`:

```ts
const chapterIds = [
  'product-overview',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'system-delivery',
  'reflection',
];

const legacyAnchorIds = [
  'business-context',
  'design-challenge',
  'system-strategy',
  'capability-impact',
];
```

Assert that both metadata objects expose `chapterIds`, both MDX files contain every `id="..."` in `legacyAnchorIds`, both titles equal `Agora Meeting`, and both sources retain the shipped scope, customer-input limitation, default-versus-configurable strategy, context-priority-interface model, API boundary, and component-governance reflection. Keep the existing unsupported-metric and Focus/Pin exclusions.

- [ ] **Step 2: Update the layout test for a product-name H1 and compact scope line**

Set the fixture title to `Agora Meeting` and add these expectations:

```ts
expect(screen.getByRole('heading', { level: 1, name: 'Agora Meeting' })).toBeVisible();
expect(screen.getByTestId('meeting-scope-line')).toHaveTextContent(
  'Sole Product Designer · 2024-2026 · 1.5 years · Desktop · Web · Tablet · Mobile · Shipped',
);
expect(screen.getByRole('img', { name: /Agora Meeting desktop stage/i })).toBeVisible();
```

Remove the old expectation that the four facts render as a hero definition list.

- [ ] **Step 3: Add component tests for the two showcase primitives**

Create `tests/component/meeting-showcase.test.tsx` with tests that render both locales and assert:

```tsx
render(<ShowcaseProof locale="en" />);
expect(screen.getByText('4 device classes')).toBeVisible();
expect(screen.getByText('3 signature decisions')).toBeVisible();
expect(screen.getByText('Shipped product')).toBeVisible();

render(
  <DeepDive locale="en" title="Why this rule">
    <p>System rationale</p>
  </DeepDive>,
);
expect(screen.getByText('Why this rule')).toBeVisible();
expect(screen.getByText('System rationale')).not.toBeVisible();
await userEvent.click(screen.getByText('Why this rule'));
expect(screen.getByText('System rationale')).toBeVisible();
```

Repeat the proof labels and disclosure interaction for Chinese. Assert that the disclosure is a native `details` element and its `summary` remains keyboard focusable.

- [ ] **Step 4: Update the E2E narrative and anchor contract**

Change `tests/e2e/meeting.spec.ts` to expect six direct `section[data-showcase-band]` IDs, all four legacy anchors in the document, one `[data-showcase-proof]`, exactly three `[data-signature-experience]` sections, and at least three closed `details[data-meeting-deep-dive]` elements on initial load.

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx
```

Expected: FAIL because the content still exposes eight chapters, the H1 still uses the descriptive title, and `meeting-showcase.tsx` does not exist.

- [ ] **Step 6: Commit the failing contract tests**

```bash
git add tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx tests/e2e/meeting.spec.ts
git commit -m "test: define Meeting product showcase contract"
```

### Task 2: Build The Showcase Proof And Deep-Dive Primitives

**Files:**
- Create: `components/meeting/meeting-showcase.tsx`
- Create: `components/meeting/meeting-showcase.module.css`
- Test: `tests/component/meeting-showcase.test.tsx`

- [ ] **Step 1: Implement localized product proof**

Create a `ShowcaseProof` component with this data shape and exact content:

```tsx
const proof = {
  en: [
    ['01', '4 device classes', 'Desktop, Web, tablet, and mobile'],
    ['02', '3 signature decisions', 'Stage, workspace, and information layer'],
    ['03', 'Shipped product', 'Production delivery without invented metrics'],
  ],
  zh: [
    ['01', '4 类终端', '桌面客户端、Web、平板与手机'],
    ['02', '3 个核心决策', '舞台、工作区与实时信息层'],
    ['03', '已上线产品', '以生产交付为证据，不虚构指标'],
  ],
} as const;

export function ShowcaseProof({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.proof} data-showcase-proof>
      {proof[locale].map(([index, title, detail]) => (
        <div key={index}>
          <span>{index}</span>
          <strong>{title}</strong>
          <p>{detail}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement the native disclosure primitive**

Add:

```tsx
export function DeepDive({
  locale,
  title,
  children,
}: PropsWithChildren<{ readonly locale: Locale; readonly title: string }>) {
  return (
    <details className={styles.deepDive} data-meeting-deep-dive>
      <summary>
        <span>{locale === 'zh' ? '设计深读' : 'Design rationale'}</span>
        <strong>{title}</strong>
        <ChevronDown aria-hidden="true" size={18} />
      </summary>
      <div className={styles.deepDiveBody}>{children}</div>
    </details>
  );
}
```

Use `PropsWithChildren` from React and `ChevronDown` from `lucide-react`. Do not add JavaScript state; native disclosure preserves keyboard and no-motion behavior.

- [ ] **Step 3: Style the primitives as unframed page evidence**

In `meeting-showcase.module.css`, use a three-column proof strip with border-block dividers, 6px-or-less radii, coral indices, and stable minimum heights. Style `summary` as a two-column command row with a 44px minimum target, rotate the chevron only through `[open]`, and disable that transition under `prefers-reduced-motion`. Collapse both primitives to one column at 720px without horizontal overflow.

- [ ] **Step 4: Run the component test and verify GREEN**

Run:

```bash
npx vitest run tests/component/meeting-showcase.test.tsx
```

Expected: PASS in both locales.

- [ ] **Step 5: Commit the primitives**

```bash
git add components/meeting/meeting-showcase.tsx components/meeting/meeting-showcase.module.css tests/component/meeting-showcase.test.tsx
git commit -m "feat: add Meeting showcase evidence primitives"
```

### Task 3: Recompose The Bilingual Content Into Six Product Bands

**Files:**
- Modify: `content/work/meeting.en.mdx`
- Modify: `content/work/meeting.zh.mdx`
- Test: `tests/unit/meeting-content.test.ts`

- [ ] **Step 1: Replace hero metadata and visible navigation**

In both files, set `title: 'Agora Meeting'`. Keep role, duration, status, disclosure, hero media, neighbors, and evidence level unchanged. Replace `chapters` with these localized labels:

```ts
// English
[
  { id: 'product-overview', label: 'Product' },
  { id: 'adaptive-stage', label: 'Adaptive stage' },
  { id: 'whiteboard-workspace', label: 'Whiteboard' },
  { id: 'information-layer', label: 'Information layer' },
  { id: 'system-delivery', label: 'System & delivery' },
  { id: 'reflection', label: 'Reflection' },
]

// Chinese
[
  { id: 'product-overview', label: '产品概览' },
  { id: 'adaptive-stage', label: '自适应舞台' },
  { id: 'whiteboard-workspace', label: '白板工作区' },
  { id: 'information-layer', label: '实时信息层' },
  { id: 'system-delivery', label: '系统与交付' },
  { id: 'reflection', label: '反思' },
]
```

- [ ] **Step 2: Create the product overview band**

Import `DeepDive` and `ShowcaseProof`. Build `section#product-overview[data-showcase-band]` with a short heading, one lead sentence, `<ShowcaseProof locale="..." />`, and `<ContextPriorityModel>`. Place alias spans for `business-context`, `design-challenge`, and `system-strategy` inside the section using `data-anchor-alias`. Put the market trigger, customer-input limitation, default-versus-configurable strategy, and cross-device rule inside one `DeepDive` titled `From customer requirements to a system rule` / `从客户需求到系统规则`.

- [ ] **Step 3: Rewrite each signature experience to one visible decision paragraph**

Keep the existing media and models, but mark the three sections with `data-showcase-band data-signature-experience`. Each visible section contains: a compact index label, H2, one 2-3 sentence decision summary, the primary media, and one supporting model. Move the existing Context/Problem/Decision/Impact prose into a `DeepDive` with these localized titles:

```ts
['Why priority comes before layout', 'Why the canvas stays primary', 'Why captions and transcripts have different owners']
['为什么先判断优先级再排版', '为什么画布始终保持主位', '为什么字幕与转写采用不同控制边界']
```

Keep all shipped/API boundaries and do not add metrics.

- [ ] **Step 4: Consolidate system breadth and reflection**

Create `section#system-delivery[data-showcase-band]`, add the `capability-impact` alias, a two-sentence delivery summary, `CapabilitySystem`, and `BreakoutDecisionEvidence`. Put detailed default/configurable and edge-state rationale in one `DeepDive`. Keep `section#reflection[data-showcase-band]` to one visible lead paragraph plus one `DeepDive` containing the original component-governance reflection and specific next-time actions.

- [ ] **Step 5: Run content tests and validation**

Run:

```bash
npx vitest run tests/unit/meeting-content.test.ts tests/component/meeting-showcase.test.tsx
npm run validate:content
```

Expected: PASS with six visible chapters, four legacy anchors, no Focus/Pin text, and one evidence disclosure per locale.

- [ ] **Step 6: Commit the bilingual narrative**

```bash
git add content/work/meeting.en.mdx content/work/meeting.zh.mdx tests/unit/meeting-content.test.ts
git commit -m "feat: reshape Meeting into a product-first story"
```

### Task 4: Rebuild The Product Hero And Page Rhythm

**Files:**
- Modify: `components/meeting/meeting-layout.tsx`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/meeting/meeting-print.css`
- Test: `tests/component/meeting-layout.test.tsx`

- [ ] **Step 1: Replace the four-cell facts grid with a compact scope line**

In `MeetingLayout`, keep eyebrow, H1, proposition, disclosure, and hero media. Replace the `dl` with:

```tsx
<p className={styles.scopeLine} data-testid="meeting-scope-line">
  <span>{meta.role}</span>
  <span>{meta.duration}</span>
  <span>{text.platformValue}</span>
  <span>{meta.status}</span>
</p>
```

Order the hero as eyebrow, H1, proposition, scope line, hero media, and evidence disclosure. This makes the product visible before the evidence caveat while retaining the caveat in the opening area.

- [ ] **Step 2: Convert the outer layout to full-width bands**

Keep the chapter rail at wide desktop, but allow `.case` and `.content > section` to use a 12-column grid. Constrain text through named classes rather than constraining every section child. Give the hero a maximum visual height target of `min(82svh, 58rem)` on desktop and remove any viewport-width font scaling. Use a stable `aspect-ratio: 16 / 9` media area with `object-fit: contain` so temporary imagery can be swapped without layout shifts.

- [ ] **Step 3: Add product-band and alias styling**

Style `[data-showcase-band]` as an unframed full-width band with predictable `scroll-margin-top`, alternating overview/detail spacing, and no nested cards. Hide `[data-anchor-alias]` visually while giving it `position: relative; top: -5rem` so old hashes land correctly. Set signature headings to compact product-section scale, not hero scale.

- [ ] **Step 4: Preserve responsive and print behavior**

At 1099px, move chapter navigation above the content. At 720px, stack the scope line, keep H1 within the container, cap hero media height, and guarantee `overflow-x: clip`. In print, open visual deep-dive content, remove sticky navigation, and preserve captions and evidence boundaries.

- [ ] **Step 5: Run the layout test and lint touched files**

Run:

```bash
npx vitest run tests/component/meeting-layout.test.tsx tests/component/site-header.test.tsx
npx eslint components/meeting/meeting-layout.tsx components/meeting/meeting-showcase.tsx
```

Expected: PASS with a product-name H1, compact scope line, readable navigation, and no lint errors.

- [ ] **Step 6: Commit the hero and layout**

```bash
git add components/meeting/meeting-layout.tsx components/meeting/meeting-layout.module.css components/meeting/meeting-print.css tests/component/meeting-layout.test.tsx
git commit -m "feat: create product-led Meeting showcase layout"
```

### Task 5: Integrate Existing Models Into The Deep-Read Layer

**Files:**
- Modify: `components/meeting/meeting-models.module.css`
- Modify: `components/meeting/meeting-evidence.module.css`
- Modify: `tests/component/meeting-models.test.tsx`
- Modify: `tests/component/meeting-evidence.test.tsx`

- [ ] **Step 1: Add structure tests for compact evidence**

Assert that the context model remains three steps, the state matrix remains three triggers, participant priority remains five items, language governance remains two scopes, and capability breadth remains three areas. Add CSS-source assertions that model grids collapse at 720px and evidence media retain a stable aspect ratio.

- [ ] **Step 2: Tighten model hierarchy without removing reasoning**

Reduce model vertical margins, minimum heights, and repeated large headings. Keep coral for decision indices and cobalt/dark ink for system relationships. Tables must remain horizontally scrollable only inside their own wrapper; the page itself must not overflow.

- [ ] **Step 3: Make evidence compatible with the new product rhythm**

Keep video fallback, captions, Figma link, four breakout rules, and designer-attributed note unchanged. Remove decorative framing that competes with product media, preserve the 16:9 frame, and use border-block separators instead of a nested-card appearance.

- [ ] **Step 4: Run the model and evidence tests**

Run:

```bash
npx vitest run tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx
```

Expected: PASS with unchanged decision evidence and compact presentation.

- [ ] **Step 5: Commit evidence integration**

```bash
git add components/meeting/meeting-models.module.css components/meeting/meeting-evidence.module.css tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx
git commit -m "style: integrate Meeting system evidence"
```

### Task 6: Verify The Product Showcase End To End

**Files:**
- Modify only if a reproduced defect requires it: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Run focused unit and component coverage**

Run:

```bash
npx vitest run tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx tests/component/site-header.test.tsx tests/unit/meeting-content.test.ts tests/unit/home-content.test.ts tests/unit/work-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run content validation and lint**

Run:

```bash
npm run validate:content
npm run lint
git diff --check
```

Expected: content validation passes; lint has zero errors. Existing unrelated warnings must be reported separately.

- [ ] **Step 3: Run the full baseline suite and classify known failures**

Run `npm test`. Compare the result with the branch baseline of 339 passing and four failing tests. The known failures are the missing Meeting MP4 derivatives and publication-validator fixture/isolation assumptions. Do not claim a green full suite unless all tests actually pass.

- [ ] **Step 4: Start a local server on an unused port**

Run `npm run dev -- --hostname 127.0.0.1 --port <unused-port>` and keep the yielded session alive through visual verification.

- [ ] **Step 5: Verify both locales in a real browser**

At 1440x1000, 1728x1117, 390x844, and 430x932 verify:

- `Agora Meeting`, proposition, scope, and actual product media form the first scan.
- A hint of the product-overview band remains visible after the hero.
- Six chapter links are readable and land on the correct bands.
- Legacy hashes `#business-context`, `#design-challenge`, `#system-strategy`, and `#capability-impact` still land near their mapped content.
- Exactly three signature experiences lead with media and concise decision copy.
- Deep dives are closed initially, keyboard operable, and readable when open.
- Temporary media fallback, captions, Figma evidence, neighbor navigation, and focus states remain intact.
- No English word splits, text overlap, incoherent overlap, or horizontal page overflow occurs.

- [ ] **Step 6: Capture desktop and mobile screenshots and inspect them**

Save screenshots under ignored `output/meeting-product-showcase/`. Inspect the actual pixels for product prominence, hierarchy, density, color balance, media framing, and section pacing. Do not assess the artistic quality of temporary imagery.

- [ ] **Step 7: Run final repository checks and commit any verification fixes**

Run:

```bash
git status --short
git diff --check
```

If verification required code changes, stage only files in this plan and commit:

```bash
git commit -m "fix: polish Meeting showcase responsiveness"
```

Document the final passing checks and known baseline failures without claiming that missing private or temporary publication assets were supplied.
