# Lightbox Controls And Homepage CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Visual Archive Lightbox canvas-corner navigation and standardize the six homepage project CTAs without changing detail-page Lightboxes or link behavior.

**Architecture:** Keep `Lightbox` navigation state and handlers shared, but render the archive counter in the rail and the existing arrow controls as an overlay inside the desktop media canvas. Add a homepage-scoped CTA class for dimensions and typography, plus an explicit `showExternalIcon` option on `ActionLink` so ConvoAI can remain a secure new-tab link without displaying an external arrow.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest/Testing Library, Playwright.

---

### Task 1: Visual Archive Lightbox Structure And Behavior

**Files:**
- Modify: `tests/component/case-study.test.tsx`
- Modify: `components/media/lightbox.tsx`
- Modify: `components/media/lightbox.module.css`

- [ ] **Step 1: Write the failing archive structure test**

Extend the existing archive-variant test after opening the dialog:

```tsx
const rail = dialog.querySelector('[data-lightbox-rail]');
const canvasControls = dialog.querySelector('[data-lightbox-canvas-controls]');
const counter = dialog.querySelector('[data-lightbox-counter]');

expect(rail).toContainElement(counter as HTMLElement);
expect(rail).not.toContainElement(canvasControls as HTMLElement);
expect(dialog.querySelector('[data-gallery-desktop]')).toContainElement(
  canvasControls as HTMLElement,
);
expect(within(canvasControls as HTMLElement).getAllByRole('button')).toHaveLength(2);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/component/case-study.test.tsx
```

Expected: FAIL because `data-lightbox-canvas-controls` and `data-lightbox-counter` do not exist and the controls are still rendered in the archive rail.

- [ ] **Step 3: Split counter and controls while preserving shared state**

In `components/media/lightbox.tsx`, replace the combined `galleryMeta` construction with separate reusable elements:

```tsx
const galleryCounter = isGallery ? (
  <span
    className={styles.galleryCounter}
    data-lightbox-counter
    role="status"
    aria-label={`${resolvedPositionLabel}: ${position}`}
    aria-live="polite"
    aria-atomic="true"
  >
    {position}
  </span>
) : null;

const galleryControls = isGallery ? (
  <div
    className={`${styles.galleryControls} ${
      variant === 'archive' ? styles.archiveCanvasControls : ''
    }`}
    data-lightbox-canvas-controls={variant === 'archive' ? '' : undefined}
  >
    <button
      className={styles.galleryControl}
      type="button"
      aria-label={resolvedPreviousLabel}
      disabled={clampedActiveIndex === 0}
      onClick={() => moveToIndex(clampedActiveIndex - 1)}
    >
      <ArrowLeft aria-hidden="true" size={20} />
    </button>
    <button
      className={styles.galleryControl}
      type="button"
      aria-label={resolvedNextLabel}
      disabled={clampedActiveIndex === media.length - 1}
      onClick={() => moveToIndex(clampedActiveIndex + 1)}
    >
      <ArrowRight aria-hidden="true" size={20} />
    </button>
  </div>
) : null;

const galleryMeta = isGallery ? (
  <div className={styles.galleryMeta}>
    {galleryCounter}
    {galleryControls}
  </div>
) : null;
```

Render `{variant === 'archive' ? galleryControls : null}` as the final child of `data-gallery-desktop`, and render only `{galleryCounter}` at the bottom of `data-lightbox-rail`. Keep `{galleryMeta}` in the default variant header. Do not create new navigation state or handlers.

- [ ] **Step 4: Implement the approved archive styling**

In `components/media/lightbox.module.css`:

```css
.archiveSurface .desktopGallery {
  position: relative;
}

.archiveRail {
  grid-template-rows: auto minmax(0, 1fr) 48px;
  padding: 0 1px 20px;
}

.archiveRail .galleryTitle {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: none;
}

.archiveCanvasControls {
  position: absolute;
  inset-inline-end: 20px;
  inset-block-end: 20px;
  z-index: 1;
  gap: 8px;
}

.archiveSurface .galleryControl {
  width: 48px;
  height: 48px;
  border-color: rgba(244, 244, 241, 0.2);
  border-radius: 999px;
  background: rgba(13, 13, 15, 0.72);
  color: #f4f4f1;
  backdrop-filter: blur(10px);
}

.archiveSurface .galleryControl:hover:not(:disabled) {
  border-color: #f4f4f1;
  background: #f4f4f1;
  color: #0d0d0f;
}

.archiveSurface .galleryControl:focus-visible:not(:disabled) {
  border-color: #f4f4f1;
  background: #f4f4f1;
  color: #0d0d0f;
  outline: 2px solid var(--color-signal);
  outline-offset: 3px;
}

.archiveSurface .galleryControl:disabled {
  border-color: rgba(244, 244, 241, 0.12);
  background: rgba(13, 13, 15, 0.52);
  color: rgba(244, 244, 241, 0.34);
  opacity: 1;
}
```

Preserve the existing mobile rule that hides `.galleryControls` and reset `.archiveRail` padding in the mobile block so the sticky mobile header remains unchanged.

- [ ] **Step 5: Run component tests and verify GREEN**

Run:

```bash
npm test -- tests/component/case-study.test.tsx
```

Expected: all case-study component tests PASS, including the new archive placement assertions and existing default Lightbox tests.

- [ ] **Step 6: Commit the Lightbox implementation**

```bash
git add tests/component/case-study.test.tsx components/media/lightbox.tsx components/media/lightbox.module.css
git commit -m "feat: refine archive lightbox controls"
```

### Task 2: Homepage CTA Sizing And Icon Semantics

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `components/ui/action-link.tsx`
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `components/home/build-lab-preview.tsx`
- Modify: `components/home/live-website-project.tsx`
- Modify: `components/home/featured-project.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Write failing CTA structure and icon tests**

Add a focused `FeaturedWork` test:

```tsx
it('uses one homepage CTA size and destination-aware external icons', () => {
  const { container } = render(<FeaturedWork locale="en" />);
  const ctas = Array.from(
    container.querySelectorAll<HTMLElement>('[data-home-project-cta]'),
  );

  expect(ctas).toHaveLength(6);
  expect(
    screen.getByRole('link', { name: 'View case study ConvoAI' })
      .querySelector('[data-remix-icon="arrow-right-up-line"]'),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Visit live site AIDX/ })
      .querySelector('[data-remix-icon="arrow-right-up-line"]'),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Explore Build Lab STT Demo/ })
      .querySelector('[data-remix-icon="arrow-right-up-line"]'),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused homepage test and verify RED**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because the six CTA hooks do not exist and ConvoAI currently receives the automatic new-tab icon.

- [ ] **Step 3: Add an explicit external-icon display option**

Add this optional property to `ActionLinkBaseProps`:

```tsx
readonly showExternalIcon?: boolean;
```

Destructure it with a default value and use it in the existing icon decision:

```tsx
showExternalIcon = true,
const showRemixExternalIcon = showExternalIcon && !Icon && opensNewTab;
```

Do not change `opensNewTab`, `target`, `rel`, external screen-reader copy, or disabled behavior.

- [ ] **Step 4: Apply one homepage-scoped CTA hook to all six projects**

Add `data-home-project-cta` and `styles.homeProjectCta` to the primary CTA rendered for Call Agent, ConvoAI, Meeting, STT Demo, AIDX, and Xuelang. Preserve each CTA's existing color variant and project-specific class. Set `showExternalIcon={false}` only on ConvoAI's `View case study` action; internal case-study actions already render without icons, while AIDX and STT retain the default external icon.

In `components/home/home.module.css`, add:

```css
.homeProjectCta {
  min-height: 48px;
  height: 48px;
  padding-inline: 1.125rem;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}
```

Update `.flagshipCta` and `a.whiteCta` so their old `44px`/`46px`, `0.82rem`, and `600` declarations no longer override the shared class. Preserve white, signal-green, and white-outline visual treatments.

- [ ] **Step 5: Run homepage tests and verify GREEN**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: all homepage component tests PASS, including six CTA hooks, no case-study arrow, and retained AIDX/STT external arrows.

- [ ] **Step 6: Commit the CTA implementation**

```bash
git add tests/component/homepage.test.tsx components/ui/action-link.tsx components/home/flagship-projects.tsx components/home/meeting-preview.tsx components/home/build-lab-preview.tsx components/home/live-website-project.tsx components/home/featured-project.tsx components/home/home.module.css
git commit -m "feat: unify homepage project CTAs"
```

### Task 3: Browser Verification And Regression Checks

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add the failing desktop and mobile Lightbox E2E assertions**

Extend the existing archive gallery test to assert:

```ts
const rail = dialog.locator('[data-lightbox-rail]');
const canvasControls = dialog.locator('[data-lightbox-canvas-controls]');
const counter = rail.locator('[data-lightbox-counter]');
const title = rail.getByRole('heading');

await expect(canvasControls).toBeVisible();
await expect(rail.locator('[data-lightbox-canvas-controls]')).toHaveCount(0);
await expect(title).toHaveCSS('writing-mode', 'vertical-rl');
await expect(title).toHaveCSS('transform', 'none');

const [controlsBox, counterBox] = await Promise.all([
  canvasControls.boundingBox(),
  counter.boundingBox(),
]);
expect(Math.abs(
  (controlsBox?.y ?? 0) + (controlsBox?.height ?? 0) / 2
  - ((counterBox?.y ?? 0) + (counterBox?.height ?? 0) / 2),
)).toBeLessThanOrEqual(2);
```

In the existing 390px mobile archive test, assert `data-lightbox-canvas-controls` is hidden and the document width does not exceed the viewport.

- [ ] **Step 2: Run the relevant E2E tests and verify RED if implementation is absent**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --grep "archive gallery"
```

Expected before implementation: placement or alignment assertions FAIL. If Tasks 1-2 are already complete, temporarily confirm the new assertions fail against the parent commit or inspect the recorded pre-change DOM before restoring the implementation.

- [ ] **Step 3: Tune only archive alignment styles until browser assertions pass**

Adjust only `.archiveCanvasControls`, `.archiveRail`, and archive-specific responsive rules. Keep controls at least 20px from the desktop media edges, keep the counter and arrow group within 2px vertical-center alignment, and keep mobile arrows hidden.

- [ ] **Step 4: Run focused and repository verification**

Run:

```bash
npm test -- tests/component/case-study.test.tsx tests/component/homepage.test.tsx
npm run lint
npm run validate:content
npm run build:framework
npx playwright test tests/e2e/homepage.spec.ts --grep "archive gallery"
```

Expected: focused component tests, lint, content validation, framework build, and relevant E2E tests PASS. If the known Meeting/publication baseline is exercised by a broader command, report those existing failures separately and do not attribute them to this change.

- [ ] **Step 5: Verify the approved control states visually**

At desktop width, open a Visual Archive Lightbox and confirm:

```text
default enabled = translucent dark circle + white arrow + no green ring
disabled = visible lower-contrast dark circle
hover = white circle + black arrow + no green ring
focus-visible = white circle + black arrow + fluorescent-green ring
```

Also inspect `/zh/` and `/en/`, plus 390px mobile, for title direction, CTA sizing, retained external icons, hidden mobile arrows, and no horizontal overflow.

- [ ] **Step 6: Commit verification coverage**

```bash
git add tests/e2e/homepage.spec.ts components/media/lightbox.module.css
git commit -m "test: verify archive lightbox layout"
```

