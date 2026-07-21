# Visual Archive Lightbox Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every real Visual Archive card open the approved C / Gallery Stage Lightbox while leaving case-study Lightboxes unchanged.

**Architecture:** Keep one shared `Lightbox` state machine and add an explicit `variant="archive"` visual mode. `VisualArchive` always renders the archive variant for real entries, while existing gallery navigation, error recovery, focus, scroll restoration, and mobile vertical stacking remain shared. CSS and a scoped GSAP entrance/exit timeline create the desktop control rail and mobile sticky header without changing content order.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, GSAP 3 / `@gsap/react`, Vitest + Testing Library, Playwright.

---

## File Map

- Modify `content/home.ts`: make every real archive entry Lightbox-only and remove the internal-case destination shape.
- Modify `components/home/visual-archive.tsx`: render one archive-variant Lightbox path for every real entry.
- Modify `components/home/home.module.css`: remove the obsolete internal archive link selector if no longer referenced.
- Modify `components/media/lightbox.tsx`: add the archive variant, scoped class/data hooks, control-rail structure, and reduced-motion-aware GSAP lifecycle.
- Modify `components/media/lightbox.module.css`: implement the approved C desktop stage, arrow highlight, and mobile sticky header/stack.
- Modify `tests/unit/home-content.test.ts`: enforce Lightbox-only destinations for all real projects.
- Modify `tests/component/homepage.test.tsx`: prove all four real archive cards render Lightbox triggers and none link to work routes.
- Modify `tests/component/case-study.test.tsx`: prove archive variant hooks are scoped and default detail Lightboxes remain unchanged.
- Modify `tests/e2e/homepage.spec.ts`: verify desktop control rail, arrow hover/focus, navigation, mobile stacking, radius hierarchy, and no overflow.

### Task 1: Make Every Visual Archive Project A Lightbox

**Files:**
- Modify: `tests/unit/home-content.test.ts`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `content/home.ts`
- Modify: `components/home/visual-archive.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Write failing content and component tests**

Update the archive content assertion to require every project to use `lightbox-only` and reject `internal-case`:

```ts
expect(archiveProjects).toHaveLength(4);
expect(archiveProjects.every(({ destination }) => destination === 'lightbox-only')).toBe(true);
expect(archiveProjects.some((project) => 'href' in project)).toBe(false);
```

Update the homepage component test to require four image-dialog triggers and no Visual Archive work links:

```tsx
const archive = screen.getByRole('region', { name: /Visual Archive|视觉作品/ });
expect(within(archive).getAllByRole('button', { name: /Open image|查看图片/ })).toHaveLength(4);
expect(within(archive).queryByRole('link', { name: /Tangping|躺平/ })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx
```

Expected: FAIL because Alibaba/Tangping still uses `destination: 'internal-case'` and renders an anchor.

- [ ] **Step 3: Remove the internal destination and render one Lightbox path**

In `content/home.ts`, reduce the real-entry destination contract to:

```ts
export const realArchiveEntrySchema = realArchiveEntryBaseSchema.extend({
  destination: z.literal('lightbox-only'),
  href: z.never().optional(),
});
```

Change Alibaba/Tangping to `destination: 'lightbox-only'` and remove `href`.

In `VisualArchive`, replace the internal/link conditional with one Lightbox:

```tsx
<Lightbox
  src={entry.image.src}
  width={entry.image.width}
  height={entry.image.height}
  alt={alt}
  triggerLabel={`${copy.openImage}: ${primaryTitle}`}
  dialogLabel={`${copy.imageDialog}: ${primaryTitle}`}
  closeLabel={copy.closeImage}
  gallery={gallery}
  previousLabel={copy.previousImage}
  nextLabel={copy.nextImage}
  positionLabel={copy.galleryPosition}
  errorLabel={copy.imageUnavailable}
/>
```

Task 2 adds the `variant="archive"` prop and updates this caller once the shared Lightbox API supports it.

Remove the unreferenced `.archiveProjectLink` rule only if `rg` confirms it has no remaining consumers.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx
```

Expected: PASS with four real projects, four Lightbox triggers, and no internal archive link.

- [ ] **Step 5: Commit the behavior change**

```bash
git add content/home.ts components/home/visual-archive.tsx components/home/home.module.css tests/unit/home-content.test.ts tests/component/homepage.test.tsx
git commit -m "feat: open every visual archive project in lightbox"
```

### Task 2: Add The Scoped C / Gallery Stage Variant

**Files:**
- Modify: `tests/component/case-study.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`
- Modify: `components/home/visual-archive.tsx`
- Modify: `components/media/lightbox.tsx`
- Modify: `components/media/lightbox.module.css`

- [ ] **Step 1: Write failing variant-scoping and browser-style tests**

Render one default and one archive Lightbox. After opening each, assert:

```tsx
expect(screen.getByRole('dialog')).toHaveAttribute('data-lightbox-variant', 'archive');
expect(screen.getByTestId('lightbox-surface')).toHaveAttribute('data-gallery-stage', 'true');
expect(screen.getByTestId('lightbox-rail')).toBeVisible();
```

For the default Lightbox assert:

```tsx
expect(screen.getByRole('dialog')).toHaveAttribute('data-lightbox-variant', 'default');
expect(screen.queryByTestId('lightbox-rail')).not.toBeInTheDocument();
```

Retain all existing gallery navigation, focus, Escape, scroll restoration, rerender, and error tests.

Extend the archive gallery E2E tests to assert on desktop:

```ts
await expect(dialog).toHaveAttribute('data-lightbox-variant', 'archive');
await expect(dialog.locator('[data-gallery-stage]')).toHaveCSS('border-radius', '24px');
await expect(dialog.locator('[data-lightbox-rail]')).toBeVisible();
await expect(dialog.locator('[data-gallery-desktop] img')).toHaveCSS('border-radius', '18px');
await expect(next).toHaveCSS('border-radius', '999px');
```

Hover the enabled next arrow and assert white fill with dark text. Confirm the first Alibaba card opens a dialog instead of navigating to `/work/tangping/`. At 390px, assert four archive triggers, no page-level horizontal overflow, vertically stacked gallery images, 20px media radius, and no visible previous/next controls.

- [ ] **Step 2: Run the Lightbox suite and verify RED**

Run:

```bash
npm test -- tests/component/case-study.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --grep "archive gallery"
```

Expected: FAIL because `variant`, archive stage hooks, and the rail do not exist.

- [ ] **Step 3: Add the visual variant without forking gallery state**

Add:

```ts
type LightboxVariant = 'default' | 'archive';

interface LightboxProps {
  readonly variant?: LightboxVariant;
  // existing props unchanged
}
```

Resolve `variant = 'default'`, add `data-lightbox-variant` to the dialog, and conditionally apply archive classes. For archive mode, render the existing semantic title, counter, and controls inside a `data-testid="lightbox-rail"` container. Default mode retains its current header DOM and classes.

Use the existing refs and state for both variants. Add `backdropRef`, `surfaceRef`, and `railRef`; do not duplicate navigation or close handlers.

Update `VisualArchive` to pass `variant="archive"` to each real-entry Lightbox after the shared component accepts the prop.

- [ ] **Step 4: Add scoped GSAP opening and closing motion**

Use `useGSAP` and the installed `gsap` package. When `variant === 'archive'` and reduced motion is not requested:

```ts
gsap.timeline()
  .from(backdropRef.current, { opacity: 0, duration: 0.22, ease: 'power1.out' })
  .from(surfaceRef.current, { opacity: 0, y: 16, scale: 0.985, duration: 0.42, ease: 'power3.out' }, 0.04)
  .from(railRef.current?.children ?? [], { opacity: 0, y: 8, stagger: 0.04, duration: 0.18 }, 0.24);
```

Archive close actions animate stage/backdrop over 180ms and then call the existing final close/reset path. Guard against repeated closes. Default Lightbox close remains immediate. Under reduced motion, both variants close immediately.

- [ ] **Step 5: Implement the desktop stage and arrow highlight**

Create archive-scoped CSS with:

```css
.archiveBackdrop {
  padding: 20px;
  background: rgb(8 8 10 / 82%);
  backdrop-filter: blur(18px);
}

.archiveSurface {
  width: min(94vw, 100rem);
  max-height: calc(100dvh - 40px);
  grid-template-columns: minmax(0, 1fr) clamp(6rem, 7vw, 7rem);
  grid-template-rows: minmax(0, 1fr);
  gap: 0;
  padding: 10px 0 10px 10px;
  overflow: hidden;
  border-radius: 24px;
  background: #171719;
}

.archiveSurface .gallery {
  overflow: hidden;
  border-radius: 18px;
  background: #0d0d0f;
}

.archiveSurface .galleryControl:hover:not(:disabled),
.archiveSurface .galleryControl:focus-visible:not(:disabled) {
  border-color: #f4f4f1;
  background: #f4f4f1;
  color: #0d0d0f;
}
```

The rail is 96-112px, close is at the top, title is vertical in the center, and counter/arrows sit at the bottom. All controls remain 44px circles. The media uses `object-fit: contain` and an 18px radius.

- [ ] **Step 6: Preserve mobile stacked media with the C visual language**

At `max-width: 47.99rem`, keep the existing `.mobileGallery` stack and hide desktop controls. Convert the rail into a sticky horizontal header, keep the close control safe-area aware, set 8px outer gutters/gaps, and apply 20px media radii. Ensure the archive surface has no page-level horizontal overflow.

- [ ] **Step 7: Run component tests and verify GREEN**

Run:

```bash
npm test -- tests/component/case-study.test.tsx tests/component/homepage.test.tsx
```

Expected: PASS, including all existing Lightbox lifecycle tests and new variant-scoping assertions.

- [ ] **Step 8: Commit the visual variant**

```bash
git add components/home/visual-archive.tsx components/media/lightbox.tsx components/media/lightbox.module.css tests/component/case-study.test.tsx tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: add visual archive gallery stage"
```

### Task 3: Verify Desktop And Mobile Behavior

**Files:**
- Verify: `tests/e2e/homepage.spec.ts`
- Verify: `components/media/lightbox.tsx`
- Verify: `components/media/lightbox.module.css`

- [ ] **Step 1: Run the archive browser coverage after implementation**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --grep "archive gallery"
```

Expected: PASS for desktop Gallery Stage behavior and 390px stacked mobile behavior.

- [ ] **Step 2: Adjust only scoped stage details required by browser evidence**

Use the Playwright failure output and desktop/390px screenshots to correct stage size, rail placement, hover contrast, mobile sticky header, or overflow. Do not alter archive card internals, project data, gallery order, or detail Lightboxes.

- [ ] **Step 3: Run focused verification**

Run:

```bash
npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx tests/component/case-study.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --grep "archive gallery"
npx eslint components/media/lightbox.tsx components/home/visual-archive.tsx tests/component/case-study.test.tsx tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git diff --check
```

Expected: all focused tests pass, ESLint exits 0, and `git diff --check` prints nothing.

- [ ] **Step 4: Commit browser-driven adjustments if needed**

```bash
git add components/media/lightbox.tsx components/media/lightbox.module.css tests/e2e/homepage.spec.ts
git commit -m "fix: polish archive gallery stage"
```

Skip this commit when browser verification requires no adjustment after Task 2.

### Task 4: Final Build, Review, And Push

**Files:**
- Verify all files changed in Tasks 1-3.

- [ ] **Step 1: Run the framework and content gates**

```bash
npm run validate:content
npm run lint
npm run build:framework
```

Expected: all commands exit 0. Existing Xuelang `<img>` warnings may remain warnings; no new warning is acceptable.

- [ ] **Step 2: Run the full test suite and classify the known Meeting baseline**

```bash
npm test
```

Expected: Gallery/Homepage/Lightbox tests pass. The five previously deferred Meeting asset/publication failures may remain and must be reported exactly rather than attributed to this change.

- [ ] **Step 3: Review the final diff and repository state**

```bash
git status --short
git diff --check origin/codex/portfolio-nextjs...HEAD
git diff --stat origin/codex/portfolio-nextjs...HEAD
```

Expected: only the approved spec, plan, archive content/component/style, Lightbox component/style, and focused tests differ from the remote base.

- [ ] **Step 4: Commit any final verified adjustments**

```bash
git add content/home.ts components/home/visual-archive.tsx components/home/home.module.css components/media/lightbox.tsx components/media/lightbox.module.css tests/unit/home-content.test.ts tests/component/homepage.test.tsx tests/component/case-study.test.tsx tests/e2e/homepage.spec.ts docs/superpowers/specs/2026-07-21-visual-archive-lightbox-stage-design.md docs/superpowers/plans/2026-07-21-visual-archive-lightbox-stage-implementation.md
git commit -m "fix: polish visual archive lightbox stage"
```

Skip this commit when the worktree is already clean.

- [ ] **Step 5: Push the feature branch**

```bash
git push -u origin codex/visual-archive-lightbox-stage
```

Expected: remote branch is created and points to the verified local HEAD.
