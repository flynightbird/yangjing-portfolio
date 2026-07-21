# Visual Archive Gallery Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add responsive multi-image Lightbox galleries to the Doudou Fox and MR CHONG Visual Archive cards, with desktop pagination and a mobile vertical stack.

**Architecture:** Extend the existing archive image schema with an optional ordered `gallery`, then enhance the shared Lightbox with a backward-compatible gallery contract. The homepage continues to own the trigger and carousel state; the portal dialog owns gallery navigation, responsive presentation, scroll locking, focus trapping, and error fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, CSS Modules, Vitest, Testing Library, Playwright, Sharp.

---

## File Structure

- Create optimized gallery assets under `public/images/archive/details/doudou-fox/` and `public/images/archive/details/mr-chong/`.
- Modify `content/home.ts` to validate and publish ordered gallery media.
- Modify `content/dictionaries/en.ts` and `content/dictionaries/zh.ts` to localize gallery controls and error text.
- Modify `components/media/lightbox.tsx` to support single-image and gallery modes in one accessible dialog.
- Modify `components/media/lightbox.module.css` to render desktop pagination and mobile stacking without JavaScript viewport branching.
- Modify `components/home/visual-archive.tsx` to pass gallery data and localized labels while preserving carousel behavior.
- Modify `tests/unit/home-content.test.ts` to lock gallery counts, order, safe paths, and bilingual alt text.
- Modify `tests/component/case-study.test.tsx` to verify keyboard navigation, boundaries, counter updates, error fallback, focus restoration, and legacy single-image behavior.
- Modify `tests/component/homepage.test.tsx` to verify the two gallery triggers and localized controls.
- Modify `tests/e2e/homepage.spec.ts` to verify desktop pagination, mobile stacking, no overflow, and homepage scroll restoration.

### Task 1: Prepare And Contract The Gallery Assets

**Files:**
- Create: `public/images/archive/details/doudou-fox/01-goal.webp`
- Create: `public/images/archive/details/doudou-fox/02-framework.webp`
- Create: `public/images/archive/details/doudou-fox/03-task-system.webp`
- Create: `public/images/archive/details/doudou-fox/04-reward-spectrum.webp`
- Create: `public/images/archive/details/doudou-fox/05-world-progression.webp`
- Create: `public/images/archive/details/doudou-fox/06-entry-and-stop.webp`
- Create: `public/images/archive/details/doudou-fox/07-end-to-end.webp`
- Create: `public/images/archive/details/mr-chong/01-character-direction.webp`
- Create: `public/images/archive/details/mr-chong/02-posture-exploration.webp`
- Create: `public/images/archive/details/mr-chong/03-travel-scene.webp`
- Create: `public/images/archive/details/mr-chong/04-final-render.webp`
- Modify: `content/home.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Write the failing content-contract test**

Add this test inside `describe('Visual Archive contract', ...)`:

```ts
it('publishes the approved ordered galleries for Doudou Fox and MR CHONG', () => {
  const doudou = archiveProjects.find(
    (project) => project.key === 'bytedance-doudou-fox',
  );
  const mrChong = archiveProjects.find(
    (project) => project.key === 'tongcheng-mr-chong',
  );

  expect(doudou?.gallery?.map((image) => image.src)).toEqual([
    '/images/archive/details/doudou-fox/01-goal.webp',
    '/images/archive/details/doudou-fox/02-framework.webp',
    '/images/archive/details/doudou-fox/03-task-system.webp',
    '/images/archive/details/doudou-fox/04-reward-spectrum.webp',
    '/images/archive/details/doudou-fox/05-world-progression.webp',
    '/images/archive/details/doudou-fox/06-entry-and-stop.webp',
    '/images/archive/details/doudou-fox/07-end-to-end.webp',
  ]);
  expect(mrChong?.gallery?.map((image) => image.src)).toEqual([
    '/images/archive/details/mr-chong/01-character-direction.webp',
    '/images/archive/details/mr-chong/02-posture-exploration.webp',
    '/images/archive/details/mr-chong/03-travel-scene.webp',
    '/images/archive/details/mr-chong/04-final-render.webp',
  ]);

  for (const project of [doudou, mrChong]) {
    expect(project?.gallery?.every((image) => image.alt.en && image.alt.zh)).toBe(true);
    expect(project?.gallery?.every((image) => image.src.startsWith('/images/archive/'))).toBe(true);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
```

Expected: FAIL because the archive entries do not yet define `gallery`.

- [ ] **Step 3: Convert the eleven approved JPEGs to WebP**

Use the installed `sharp` package. The conversion manifest is:

```js
const jobs = [
  ['豆豆狐/Frame 1312316551.jpg', 'doudou-fox/01-goal.webp'],
  ['豆豆狐/Frame 1312316552.jpg', 'doudou-fox/02-framework.webp'],
  ['豆豆狐/Frame 1312316568.jpg', 'doudou-fox/03-task-system.webp'],
  ['豆豆狐/Frame 1312316571.jpg', 'doudou-fox/04-reward-spectrum.webp'],
  ['豆豆狐/Frame 1312316572.jpg', 'doudou-fox/05-world-progression.webp'],
  ['豆豆狐/Frame 1312316586.jpg', 'doudou-fox/06-entry-and-stop.webp'],
  ['豆豆狐/Frame 1312316575.jpg', 'doudou-fox/07-end-to-end.webp'],
  ['虫虫/虫虫11.jpg', 'mr-chong/01-character-direction.webp'],
  ['虫虫/虫虫14.jpg', 'mr-chong/02-posture-exploration.webp'],
  ['虫虫/虫虫12.jpg', 'mr-chong/03-travel-scene.webp'],
  ['虫虫/虫虫15.jpg', 'mr-chong/04-final-render.webp'],
];
```

Read sources from `/Users/admin/Desktop/声网 作品集 整理/作品集配图`, create both output directories, preserve intrinsic dimensions, strip metadata, and encode with:

```js
sharp(source).rotate().webp({ quality: 88, smartSubsample: true }).toFile(destination)
```

After conversion, run:

```bash
find public/images/archive/details -type f -name '*.webp' | sort
```

Expected: exactly eleven files in the manifest order when sorted by directory and filename.

- [ ] **Step 4: Extend the content schema and add gallery data**

In `content/home.ts`, extend `realArchiveEntrySchema`:

```ts
export const realArchiveEntrySchema = z.object({
  key: nonEmptyString,
  kind: z.literal('real-entry'),
  company: localizedStringSchema,
  period: archivePeriodSchema,
  title: archiveTitleSchema,
  description: localizedStringSchema,
  skills: z.array(nonEmptyString).min(1),
  coverVariant: archiveCoverVariantSchema,
  image: archiveImageSchema,
  gallery: z.array(archiveImageSchema).min(2).optional(),
  externalUrl: z.string().url().startsWith('https://').optional(),
});
```

Add seven Doudou Fox entries and four MR CHONG entries using the exact paths above. Use the verified intrinsic dimensions: all Doudou Fox images are `2880 × 1620`; MR CHONG images are `2880 × 1967`, `2070 × 1523`, `2069 × 1455`, and `1874 × 1455` in approved order. Write concise localized alt text that describes visible content without translating claims inside the artwork.

- [ ] **Step 5: Run unit tests and validate image paths**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
npm run validate:content
```

Expected: PASS, and no unsafe archive media path errors.

- [ ] **Step 6: Commit the content and assets**

```bash
git add content/home.ts tests/unit/home-content.test.ts public/images/archive/details
git commit -m "feat: add visual archive gallery assets"
```

### Task 2: Extend Lightbox With Accessible Gallery Behavior

**Files:**
- Modify: `components/media/lightbox.tsx`
- Modify: `components/media/lightbox.module.css`
- Test: `tests/component/case-study.test.tsx`

- [ ] **Step 1: Write failing component tests for gallery navigation**

Add a gallery fixture:

```ts
const gallery = [
  { src: '/images/archive/details/test/01.webp', width: 1600, height: 900, alt: 'First gallery image' },
  { src: '/images/archive/details/test/02.webp', width: 1600, height: 900, alt: 'Second gallery image' },
] as const;
```

Add tests that render `Lightbox` with `gallery`, `previousLabel="Previous image"`, `nextLabel="Next image"`, `positionLabel="Gallery position"`, and `errorLabel="Image unavailable"`. Assert:

```ts
expect(screen.getByText('01 / 02')).toHaveAccessibleName('Gallery position');
expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled();
await user.click(screen.getByRole('button', { name: 'Next image' }));
expect(screen.getByText('02 / 02')).toBeVisible();
expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled();
await user.keyboard('{ArrowLeft}');
expect(screen.getByText('01 / 02')).toBeVisible();
```

Add a failure assertion by firing an error event on the active desktop image and requiring localized `Image unavailable` text without removing the close and navigation controls. Keep the existing single-image, Escape, overflow restoration, and focus-trap tests unchanged.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npm test -- tests/component/case-study.test.tsx
```

Expected: FAIL because `Lightbox` has no gallery props or navigation controls.

- [ ] **Step 3: Add the backward-compatible media contract**

Export this type and add optional gallery labels:

```ts
export interface LightboxMedia {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

interface LightboxProps {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly gallery?: readonly LightboxMedia[];
  readonly triggerLabel: string;
  readonly dialogLabel: string;
  readonly closeLabel: string;
  readonly previousLabel?: string;
  readonly nextLabel?: string;
  readonly positionLabel?: string;
  readonly errorLabel?: string;
  readonly expandLabel?: string;
}
```

Resolve media as `gallery?.length ? gallery : [{ src, width, height, alt }]`. Add `activeIndex`, reset it when a dialog closes, and update the existing keydown handler so `ArrowLeft` and `ArrowRight` move within boundaries only when `media.length > 1`.

- [ ] **Step 4: Render desktop pager and mobile stack**

Inside the existing dialog surface:

- Keep one close control and the current focus trap.
- Add a stable title/counter bar.
- Render `.desktopGallery` with only the active image visible.
- Render `.mobileGallery` with every image in approved order and `loading="lazy"` after the first image.
- Add previous and next icon buttons using Lucide `ArrowLeft` and `ArrowRight`.
- Track failed `src` values in state and render `errorLabel` in place of the failed image.
- Add `data-lightbox-gallery`, `data-gallery-desktop`, and `data-gallery-mobile` hooks for tests.

Do not change the existing trigger image or expand cue contract.

- [ ] **Step 5: Add responsive CSS without JavaScript viewport detection**

Desktop defaults:

```css
.desktopGallery { display: grid; }
.mobileGallery { display: none; }
.desktopMedia { max-width: 100%; max-height: calc(100dvh - 8rem); object-fit: contain; }
```

At `max-width: 47.99rem`:

```css
.backdrop { display: block; overflow-y: auto; padding: 0; }
.surface { width: 100%; min-height: 100dvh; max-height: none; padding: 4.5rem 0.375rem 0.375rem; }
.desktopGallery, .galleryControls, .galleryCounter { display: none; }
.mobileGallery { display: grid; gap: 0.375rem; }
.mobileGallery img { width: 100%; max-height: none; object-fit: contain; }
.close { position: fixed; }
```

Ensure the sticky/fixed close control has a solid translucent backdrop and safe-area offset. Add reduced-motion rules so image changes have no transition.

- [ ] **Step 6: Run component tests**

Run:

```bash
npm test -- tests/component/case-study.test.tsx
```

Expected: PASS for gallery and legacy Lightbox behavior.

- [ ] **Step 7: Commit the shared gallery component**

```bash
git add components/media/lightbox.tsx components/media/lightbox.module.css tests/component/case-study.test.tsx
git commit -m "feat: add responsive gallery lightbox"
```

### Task 3: Connect The Two Homepage Archive Galleries

**Files:**
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Modify: `components/home/visual-archive.tsx`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Write failing homepage integration tests**

In `tests/component/homepage.test.tsx`, add one English and one Chinese test. Open the Doudou Fox trigger and assert `01 / 07`, localized previous/next/close labels, and seven mobile gallery images. Close it, open MR CHONG, and assert `01 / 04` and four mobile gallery images.

Use role queries for controls and `data-gallery-mobile img` only for the responsive duplicate count:

```ts
expect(screen.getByText('01 / 07')).toBeVisible();
expect(screen.getByRole('button', { name: 'Previous gallery image' })).toBeDisabled();
expect(container.querySelectorAll('[data-gallery-mobile] img')).toHaveLength(7);
```

The Chinese test must require `上一张图片`, `下一张图片`, and `关闭图片`.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because Visual Archive does not pass gallery media or labels.

- [ ] **Step 3: Extend the dictionary contract**

Add these fields to `Dictionary['home']['archive']` and both dictionaries:

```ts
previousImage: string;
nextImage: string;
galleryPosition: string;
imageUnavailable: string;
```

English values:

```ts
previousImage: 'Previous gallery image',
nextImage: 'Next gallery image',
galleryPosition: 'Gallery position',
imageUnavailable: 'Image unavailable',
```

Chinese values:

```ts
previousImage: '上一张图片',
nextImage: '下一张图片',
galleryPosition: '画廊位置',
imageUnavailable: '图片暂时无法加载',
```

- [ ] **Step 4: Pass localized gallery data from Visual Archive**

Map `entry.gallery` to the active locale:

```ts
const gallery = entry.gallery?.map((image) => ({
  src: image.src,
  width: image.width,
  height: image.height,
  alt: image.alt[locale],
}));
```

Pass `gallery`, `previousLabel`, `nextLabel`, `positionLabel`, and `errorLabel` into `Lightbox`. Do not modify carousel refs, wheel forwarding, active-card calculation, cover overlays, or card dimensions.

- [ ] **Step 5: Run homepage and content tests**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts tests/unit/i18n.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the homepage integration**

```bash
git add content/dictionaries/en.ts content/dictionaries/zh.ts components/home/visual-archive.tsx tests/component/homepage.test.tsx tests/unit/i18n.test.ts
git commit -m "feat: connect visual archive galleries"
```

### Task 4: Verify Desktop And Mobile Gallery Workflows

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add failing desktop E2E coverage**

Add a test that loads `/en/`, scrolls to `[data-archive-carousel]`, opens Doudou Fox, and checks:

```ts
await expect(page.getByRole('dialog', { name: /Doudou Fox/ })).toBeVisible();
await expect(page.locator('[data-gallery-desktop]')).toBeVisible();
await expect(page.getByText('01 / 07')).toBeVisible();
await page.keyboard.press('ArrowRight');
await expect(page.getByText('02 / 07')).toBeVisible();
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).toHaveCount(0);
```

Record `window.scrollY` and the trigger bounding box before opening. After closing, assert the scroll position differs by no more than two pixels and the trigger is focused.

- [ ] **Step 2: Add failing 390px mobile coverage**

At a `390 × 844` viewport, open MR CHONG and assert:

- `[data-gallery-mobile]` is visible.
- `[data-gallery-desktop]` is hidden.
- Four images appear in the vertical stack.
- The close button remains visible after scrolling to the last image.
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

- [ ] **Step 3: Run focused E2E tests and fix only gallery defects**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=chromium --grep "archive gallery"
```

Expected: PASS. If a failure occurs, adjust only Lightbox gallery markup/CSS or the test selectors; do not change Visual Archive carousel behavior.

- [ ] **Step 4: Run full proportional verification**

Run:

```bash
npm run lint
npm test
npm run build:framework
npx playwright test tests/e2e/homepage.spec.ts --project=chromium
```

Expected: ESLint passes, all Vitest suites pass, Next.js framework build passes, and homepage E2E passes. Record the pre-existing `next-env.d.ts` dev-path modification as unrelated and leave it unstaged.

- [ ] **Step 5: Commit E2E coverage and any verified gallery-only fixes**

```bash
git add tests/e2e/homepage.spec.ts components/media/lightbox.tsx components/media/lightbox.module.css
git commit -m "test: verify visual archive galleries"
```

## Self-Review Result

- Spec coverage: desktop paging, mobile stacking, exact image sets, localization, focus, scroll restoration, loading failure, reduced motion, and regression boundaries are each assigned to a task.
- Placeholder scan: no deferred implementation steps remain.
- Type consistency: `gallery`, `previousLabel`, `nextLabel`, `positionLabel`, and `errorLabel` are defined once in Task 2 and consumed with the same names in Task 3.
- Scope: no new routes, no archive carousel redesign, and no changes to Tangping or Open Language behavior.
