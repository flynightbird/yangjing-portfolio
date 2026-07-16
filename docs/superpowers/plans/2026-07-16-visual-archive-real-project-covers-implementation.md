# Visual Archive Real Project Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the eight Visual Archive draft slots with four bilingual real-project covers whose company, period, and title are rendered as art-directed code overlays, with descriptions and skills below.

**Architecture:** Extend the validated archive-entry contract with structured project content and a finite presentation variant, then make four real entries the homepage default. `VisualArchive` keeps its existing scroll-snap controller and lightbox, but renders a semantic cover overlay and a responsive two-column facts area for each real entry. CSS Modules own all four approved cover compositions so content never carries arbitrary style values.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Zod 4, CSS Modules, Vitest, Testing Library, Playwright, agent-browser.

**Execution Note:** Work inline in the current workspace because the carousel changes are already uncommitted there. Do not create commits or touch unrelated dirty files unless the user explicitly requests it.

---

## File Map

- `content/home.ts`: archive schemas, structured period contract, four real project entries.
- `components/home/visual-archive.tsx`: carousel rendering, localized semantic cover overlay, description and skills layout.
- `components/home/home.module.css`: shared cover typography plus four approved position/color variants and responsive metadata.
- `content/dictionaries/en.ts`: English archive labels, including Skills.
- `content/dictionaries/zh.ts`: Chinese archive labels, including 技能.
- `public/images/archive/alibaba-meipingmeiwu.jpg`: clean Alibaba cover.
- `public/images/archive/bytedance-open-language.jpg`: clean Open Language cover.
- `public/images/archive/bytedance-doudou-fox.jpg`: clean Doudou Fox cover.
- `public/images/archive/tongcheng-mr-chong.png`: clean Mr Chong cover.
- `tests/unit/home-content.test.ts`: schema and default-data contract.
- `tests/component/homepage.test.tsx`: semantic, localized component output.
- `tests/e2e/homepage.spec.ts`: four-card behavior, loaded assets, responsive layout, controls.

### Task 1: Define The Real Archive Content Contract

**Files:**
- Modify: `tests/unit/home-content.test.ts`
- Modify: `content/home.ts`

- [ ] **Step 1: Replace the draft-slot unit test with a failing four-project contract test**

Import `archiveProjects` and require the approved order and complete data:

```ts
expect(archiveProjects.map((project) => project.key)).toEqual([
  'alibaba-meipingmeiwu',
  'bytedance-open-language',
  'bytedance-doudou-fox',
  'tongcheng-mr-chong',
]);

for (const project of archiveProjects) {
  expect(project.kind).toBe('real-entry');
  expect(project.description.en).toBeTruthy();
  expect(project.description.zh).toBeTruthy();
  expect(project.skills.length).toBeGreaterThan(0);
  expect(project.image.src).toMatch(/^\/images\/archive\//);
}
```

- [ ] **Step 2: Add failing validation cases for required real-project fields**

Use one valid fixture containing the final shape:

```ts
const valid = {
  key: 'real-project',
  kind: 'real-entry',
  company: { en: 'Company', zh: '公司' },
  period: {
    start: {
      dateTime: '2021-09',
      label: { en: '2021.09', zh: '2021.09' },
    },
    end: {
      dateTime: '2021-10',
      label: { en: '10', zh: '10' },
    },
  },
  title: {
    primary: { en: 'Project', zh: '项目' },
    secondary: { en: 'Experience', zh: '体验' },
    label: { en: 'PRODUCT', zh: 'PRODUCT' },
  },
  description: { en: 'Project description.', zh: '项目描述。' },
  skills: ['UX', 'UI'],
  coverVariant: 'doudou-fox',
  image: {
    src: '/images/archive/real-project.jpg',
    width: 1600,
    height: 900,
    alt: { en: 'Project cover', zh: '项目封面' },
  },
} as const;
```

Assert rejection for an empty description, an empty skills list, an invalid period, an unsafe image path, and an unknown `coverVariant`.

- [ ] **Step 3: Run the focused unit test and verify RED**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
```

Expected: FAIL because `archiveProjects`, the new fields, and cover variants do not exist.

- [ ] **Step 4: Implement the schemas and four project records**

In `content/home.ts`, add:

```ts
const archivePeriodValueSchema = z.string().regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/);
const archivePeriodPartSchema = z.object({
  dateTime: archivePeriodValueSchema,
  label: localizedStringSchema,
});
const archivePeriodSchema = z.object({
  start: archivePeriodPartSchema,
  end: archivePeriodPartSchema.optional(),
});

const archiveTitleSchema = z.object({
  primary: localizedStringSchema,
  secondary: localizedStringSchema,
  label: localizedStringSchema.optional(),
});

const archiveCoverVariantSchema = z.enum([
  'alibaba',
  'open-language',
  'doudou-fox',
  'mr-chong',
]);
```

Replace the old `name/category/role/year` real-entry fields with `company`, `period`, `title`, `description`, `skills`, and `coverVariant`. Keep `image`, `key`, and `kind`. Define `archiveProjects` with the exact bilingual content and asset metadata from the approved design spec.

- [ ] **Step 5: Run the unit test and verify GREEN**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
```

Expected: all Visual Archive contract tests pass.

### Task 2: Add The Approved Clean Cover Assets

**Files:**
- Create: `public/images/archive/alibaba-meipingmeiwu.jpg`
- Create: `public/images/archive/bytedance-open-language.jpg`
- Create: `public/images/archive/bytedance-doudou-fox.jpg`
- Create: `public/images/archive/tongcheng-mr-chong.png`

- [ ] **Step 1: Copy the four user-approved clean source images without re-encoding**

Run:

```bash
mkdir -p public/images/archive
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平4-1.jpg' public/images/archive/alibaba-meipingmeiwu.jpg
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/开言设计原则封面-1.jpg' public/images/archive/bytedance-open-language.jpg
cp '/Users/admin/Desktop/声网 作品集 整理/Frame 1312316590.jpg' public/images/archive/bytedance-doudou-fox.jpg
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/虫虫15.png' public/images/archive/tongcheng-mr-chong.png
```

- [ ] **Step 2: Verify dimensions and file integrity**

Run:

```bash
sips -g pixelWidth -g pixelHeight public/images/archive/alibaba-meipingmeiwu.jpg public/images/archive/bytedance-open-language.jpg public/images/archive/bytedance-doudou-fox.jpg public/images/archive/tongcheng-mr-chong.png
```

Expected dimensions:

```text
alibaba-meipingmeiwu.jpg: 2880 x 1620
bytedance-open-language.jpg: 2880 x 1620
bytedance-doudou-fox.jpg: 2880 x 1620
tongcheng-mr-chong.png: 1249 x 970
```

- [ ] **Step 3: Re-run the content unit test**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
```

Expected: PASS.

### Task 3: Define The Semantic Cover Output With Failing Component Tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `components/home/visual-archive.tsx`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`

- [ ] **Step 1: Replace placeholder assertions with failing real-project assertions**

Require four cards and no draft output:

```ts
const { container } = render(<VisualArchive locale="en" />);

expect(container.querySelectorAll('[data-archive-card]')).toHaveLength(4);
expect(container.querySelectorAll('[data-publication-state="draft"]')).toHaveLength(0);
expect(container.querySelectorAll('[data-placeholder-media]')).toHaveLength(0);
expect(screen.getByRole('heading', { level: 3, name: /Mei Ping Mei Wu Design/i })).toBeVisible();
expect(screen.getByText('Alibaba')).toBeVisible();
expect(screen.getByText('2019-2020.12')).toBeVisible();
expect(screen.getAllByText('Skills')).toHaveLength(4);
expect(container.querySelector('[data-archive-position]')).toHaveTextContent('01 / 04');
```

Add a Chinese test requiring `每平每屋`, `开言设计原则`, `豆豆狐`, `Mr Chong`, the approved descriptions, and `技能`.

- [ ] **Step 2: Require semantic variants and lists**

```ts
expect(container.querySelector('[data-cover-variant="alibaba"]')).toBeInTheDocument();
expect(container.querySelector('[data-cover-variant="open-language"]')).toBeInTheDocument();
expect(container.querySelector('[data-cover-variant="doudou-fox"]')).toBeInTheDocument();
expect(container.querySelector('[data-cover-variant="mr-chong"]')).toBeInTheDocument();
expect(container.querySelectorAll('[data-archive-skills]')).toHaveLength(4);
```

- [ ] **Step 3: Run the component test and verify RED**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because the component still renders eight draft slots.

- [ ] **Step 4: Add localized metadata labels**

Add `skillsLabel` to both dictionaries:

```ts
// en
skillsLabel: 'Skills',

// zh
skillsLabel: '技能',
```

Remove default-output dependencies on `draftSlot` and `placeholderLabel` only if no development-only consumer still needs them.

- [ ] **Step 5: Implement the real cover and facts anatomy**

Default `entries` to `archiveProjects`. For every real entry, render:

```tsx
<article
  className={styles.archiveItem}
  data-archive-card
  data-cover-variant={entry.coverVariant}
>
  <div className={`${styles.archiveStage} ${styles.archiveCover}`}>
    <Lightbox
      src={entry.image.src}
      width={entry.image.width}
      height={entry.image.height}
      alt={entry.image.alt[locale]}
      triggerLabel={`${copy.openImage}: ${entry.title.primary[locale]}`}
      dialogLabel={`${copy.imageDialog}: ${entry.title.primary[locale]}`}
      closeLabel={copy.closeImage}
    />
    <div className={styles.archiveCoverIndex}>
      <span>{entry.company[locale]}</span>
      <span aria-hidden="true"> · </span>
      <span className={styles.archiveCoverPeriod}>
        <time dateTime={entry.period.start.dateTime}>
          {entry.period.start.label[locale]}
        </time>
        {entry.period.end ? (
          <>
            <span aria-hidden="true">-</span>
            <time dateTime={entry.period.end.dateTime}>
              {entry.period.end.label[locale]}
            </time>
          </>
        ) : null}
      </span>
    </div>
    <div className={styles.archiveCoverTitle}>
      {entry.title.label ? (
        <span className={styles.archiveCoverLabel}>{entry.title.label[locale]}</span>
      ) : null}
      <h3>
        <span>{entry.title.primary[locale]}</span>
        <span>{entry.title.secondary[locale]}</span>
      </h3>
    </div>
  </div>
  <div className={styles.archiveFacts}>
    <p>{entry.description[locale]}</p>
    <div>
      <span>{copy.skillsLabel}</span>
      <ul data-archive-skills>
        {entry.skills.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>
    </div>
  </div>
</article>
```

Keep card refs, active index, controls, scroll handling, progress, and reduced-motion behavior unchanged. Use the clean image as the Lightbox image; overlays remain outside the image and use `pointer-events: none`.

- [ ] **Step 6: Run the component tests and verify GREEN**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts
```

Expected: both files pass.

### Task 4: Implement The Four Approved Cover Compositions

**Files:**
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Make all real covers landscape and preserve adjacent-card reveal**

Use a shared 16:9 stage for these entries and remove the portrait width from the four default items:

```css
.archiveItem {
  flex: 0 0 min(88vw, 54rem);
}

.archiveStage {
  aspect-ratio: 16 / 9;
  height: auto;
}

.archiveCover {
  container-type: inline-size;
}
```

At desktop, use a width that reveals the next card without cropping the cover composition. At mobile, keep roughly 86-88vw so the next card remains visible.

- [ ] **Step 2: Add shared overlay typography and facts layout**

```css
.archiveCoverIndex,
.archiveCoverTitle {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

.archiveCoverIndex {
  display: flex;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.archiveCoverTitle h3 {
  display: grid;
  gap: 0;
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
  line-height: 1.09;
  letter-spacing: 0;
}

.archiveFacts {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 0.45fr);
  gap: var(--space-5);
  min-height: 7rem;
  padding-block-start: var(--space-4);
  border-top: 1px solid var(--color-carbon);
}
```

Skills render as a plain mono list with divider separators. At narrow widths, switch `.archiveFacts` to one column.

- [ ] **Step 3: Encode the four approved positions and colors**

```css
[data-cover-variant='alibaba'] .archiveCoverIndex {
  inset: 29% auto auto 4.5%;
  color: #111;
}

[data-cover-variant='alibaba'] .archiveCoverTitle {
  inset: 40% auto auto 4.5%;
  width: 41%;
  color: #111;
}

[data-cover-variant='open-language'] .archiveCoverIndex {
  inset: 5% auto auto 7%;
  color: #fff;
}

[data-cover-variant='open-language'] .archiveCoverTitle {
  inset: 35% auto auto 7%;
  width: 57%;
  color: #fff;
}

[data-cover-variant='open-language'] .archiveCoverLabel {
  color: #6ff1e9;
}

[data-cover-variant='doudou-fox'] .archiveCoverIndex {
  inset: 5% auto auto 4.5%;
  color: #111;
}

[data-cover-variant='doudou-fox'] .archiveCoverTitle {
  inset: 29% auto auto 7%;
  width: 43%;
  color: #fff;
}

[data-cover-variant='mr-chong'] .archiveCoverIndex {
  inset: 5% auto auto 4.5%;
  color: #111;
}

[data-cover-variant='mr-chong'] .archiveCoverTitle {
  inset: 15% auto auto 4.5%;
  width: 43%;
  color: #111;
}
```

Tune the Mr Chong image's `object-position` without changing the approved title coordinates.

- [ ] **Step 4: Add discrete responsive sizes without viewport-scaled typography**

Use explicit breakpoints:

```css
.archiveCoverTitle h3 { font-size: 1.55rem; }

@media (min-width: 768px) {
  .archiveCoverTitle h3 { font-size: 2rem; }
}

@media (min-width: 1200px) {
  .archiveCoverTitle h3 { font-size: 2.5rem; }
}
```

Keep line-height `1.09` and letter-spacing `0` at every size. The Mr Chong secondary line and Alibaba `APP & Main Website` line use a smaller supporting size.

- [ ] **Step 5: Run focused tests and lint**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts
npm run lint
```

Expected: PASS with no lint output.

### Task 5: Update Browser Contracts And Verify The Finished Module

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`
- Create temporarily, then delete: `playwright.current-server.config.mjs`

- [ ] **Step 1: Update homepage browser assertions for four real entries**

Replace draft-slot expectations with:

```ts
await expect(page.locator('[data-archive-card]')).toHaveCount(4);
await expect(page.locator('[data-archive-slot]')).toHaveCount(0);
await expect(page.locator('[data-cover-variant]')).toHaveCount(4);
```

Update image count from four to eight real homepage images. Update position assertions from `01 / 08` to `01 / 04`. Keep scroll-snap, adjacent-card reveal, controls, reduced-motion, and overflow checks.

- [ ] **Step 2: Add cover layout assertions**

For each project at desktop size, assert the cover title rectangle remains inside the stage rectangle. For Doudou Fox, assert the title ends before the phone-safe threshold; for all projects, assert metadata has a non-zero bounding box and skills are visible.

- [ ] **Step 3: Run Playwright against the existing 4173 server**

Create a temporary config that inherits `playwright.config.mjs`, sets `baseURL` to `http://localhost:4173`, and removes `webServer`. Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --config=playwright.current-server.config.mjs
```

Expected: all non-skipped desktop, tablet, and mobile homepage tests pass. Delete the temporary config afterward.

- [ ] **Step 4: Run production verification**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts
npm run lint
npm run build:framework
git diff --check
```

Expected: tests pass, lint exits zero, the Next.js build generates all 15 static pages, and `git diff --check` reports no whitespace errors. Restore the pre-existing `.next/dev/types/routes.d.ts` line in `next-env.d.ts` if Next rewrites it.

- [ ] **Step 5: Inspect every project with agent-browser**

At 1440x900, 768x1024, and 390x844:

1. Open `http://localhost:4173/en/` and scroll the Archive into view.
2. Capture the first card.
3. Advance through cards two, three, and four using the visible next control.
4. Capture each active card and verify company/time, title position, title color, image crop, description, and skills.
5. Confirm the previous control enables after the first move and the next control disables at card four.
6. Confirm page overflow is zero and the next card remains partially visible.

Expected visual result: all four covers match the approved V5 composition, with no title/logo/phone/character collision and no clipped metadata.
