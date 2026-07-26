# Homepage Visual Archive Tongcheng Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fifth Tongcheng Travel card to the end of the homepage Visual Archive with the supplied cover, a four-image ordered Lightbox gallery, and responsive title placement below the fish artwork.

**Architecture:** Extend the existing typed `archiveProjects` content model with one new cover variant and one route-neutral real entry. Reuse the current `VisualArchive` and `Lightbox` rendering paths, adding only variant-specific CSS and correcting the carousel total display to use the actual entry count. Keep all supplied bitmaps unchanged in a dedicated public archive directory.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Create `public/images/archive/details/tongcheng-travel/cover.png`: unchanged 1920 x 1080 card cover.
- Create `public/images/archive/details/tongcheng-travel/01-crowdfunding-2.png`: unchanged 1440 x 810 first Lightbox image.
- Create `public/images/archive/details/tongcheng-travel/02-mashangyou-japan.jpg`: unchanged 1440 x 810 second Lightbox image.
- Create `public/images/archive/details/tongcheng-travel/03-tongcheng-partner.jpg`: unchanged 1440 x 810 third Lightbox image.
- Create `public/images/archive/details/tongcheng-travel/04-outbound-travel-mini-program.jpg`: unchanged 1440 x 810 fourth Lightbox image.
- Modify `content/home.ts`: register the cover variant and append localized project metadata and ordered gallery media.
- Modify `components/home/visual-archive.tsx`: report the real carousel total rather than `total - 1`.
- Modify `components/home/home.module.css`: position the Tongcheng metadata and title overlays against the supplied artwork.
- Modify `tests/unit/home-content.test.ts`: lock project order, variant, metadata, alt text, and gallery order.
- Modify `tests/component/homepage.test.tsx`: lock five-card rendering, localized copy, total display, and Lightbox behavior.
- Modify `tests/e2e/homepage.spec.ts`: update five-card expectations and verify the carousel reaches `05 / 05`.

### Task 1: Lock The Tongcheng Content Contract

**Files:**
- Modify: `tests/unit/home-content.test.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Add a failing ordered-gallery test**

Add a Tongcheng lookup and assertions to the Visual Archive contract:

```ts
it('publishes the Tongcheng Travel gallery with crowdfunding first', () => {
  const tongcheng = archiveProjects.find(
    (project) => project.key === 'tongcheng-finance-ui',
  );

  expect(tongcheng).toMatchObject({
    company: { en: 'Tongcheng Travel', zh: '同程旅游' },
    period: {
      start: { dateTime: '2019', label: { en: '2019', zh: '2019' } },
    },
    title: { primary: { en: 'Tongcheng Travel', zh: '同程旅游' } },
    skills: ['UI设计'],
    coverVariant: 'tongcheng-travel',
  });
  expect(tongcheng?.gallery?.map((image) => image.src)).toEqual([
    '/images/archive/details/tongcheng-travel/01-crowdfunding-2.png',
    '/images/archive/details/tongcheng-travel/02-mashangyou-japan.jpg',
    '/images/archive/details/tongcheng-travel/03-tongcheng-partner.jpg',
    '/images/archive/details/tongcheng-travel/04-outbound-travel-mini-program.jpg',
  ]);
  expect(tongcheng?.gallery?.every((image) => image.alt.en && image.alt.zh)).toBe(true);
});
```

Update the approved project-order assertions to end with `tongcheng-finance-ui`, the cover-variant assertions to end with `tongcheng-travel`, and the expected project length from `4` to `5`.

- [ ] **Step 2: Run the focused unit test and verify RED**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
```

Expected: FAIL because `tongcheng-finance-ui` and `tongcheng-travel` do not exist yet and the archive still contains four entries.

- [ ] **Step 3: Commit the failing contract test**

```bash
git add tests/unit/home-content.test.ts
git commit -m "test: define Tongcheng visual archive contract"
```

### Task 2: Add The Media And Typed Archive Entry

**Files:**
- Create: `public/images/archive/details/tongcheng-travel/cover.png`
- Create: `public/images/archive/details/tongcheng-travel/01-crowdfunding-2.png`
- Create: `public/images/archive/details/tongcheng-travel/02-mashangyou-japan.jpg`
- Create: `public/images/archive/details/tongcheng-travel/03-tongcheng-partner.jpg`
- Create: `public/images/archive/details/tongcheng-travel/04-outbound-travel-mini-program.jpg`
- Modify: `content/home.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Copy the supplied bitmaps without transforming them**

Run:

```bash
mkdir -p public/images/archive/details/tongcheng-travel
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/同程内部/杂活/封面.png' public/images/archive/details/tongcheng-travel/cover.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/同程内部/杂活/众筹20.png' public/images/archive/details/tongcheng-travel/01-crowdfunding-2.png
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/同程内部/杂活/码上游日本.jpg' public/images/archive/details/tongcheng-travel/02-mashangyou-japan.jpg
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/同程内部/杂活/同程合伙人.jpg' public/images/archive/details/tongcheng-travel/03-tongcheng-partner.jpg
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/同程内部/杂活/出境游小程序.jpg' public/images/archive/details/tongcheng-travel/04-outbound-travel-mini-program.jpg
sips -g pixelWidth -g pixelHeight public/images/archive/details/tongcheng-travel/*
```

Expected: `cover.png` is 1920 x 1080 and all four gallery images are 1440 x 810.

- [ ] **Step 2: Register the new cover variant**

Extend `archiveCoverVariantSchema` in `content/home.ts`:

```ts
const archiveCoverVariantSchema = z.enum([
  'alibaba',
  'open-language',
  'doudou-fox',
  'mr-chong',
  'tongcheng-travel',
]);
```

- [ ] **Step 3: Append the real archive entry**

Append this object after `tongcheng-mr-chong` in `archiveProjects`:

```ts
{
  key: 'tongcheng-finance-ui',
  kind: 'real-entry',
  destination: 'lightbox-only',
  company: { en: 'Tongcheng Travel', zh: '同程旅游' },
  period: {
    start: { dateTime: '2019', label: { en: '2019', zh: '2019' } },
  },
  title: {
    primary: { en: 'Tongcheng Travel', zh: '同程旅游' },
  },
  description: {
    en: "Product and interface design across multiple offerings for distinct user groups within Tongcheng Travel's Financial Business Unit.",
    zh: '在同程旅游金融事业部，面向不同用户群体，参与多类产品的体验与界面设计。',
  },
  skills: ['UI设计'],
  coverVariant: 'tongcheng-travel',
  image: {
    src: '/images/archive/details/tongcheng-travel/cover.png',
    width: 1920,
    height: 1080,
    alt: {
      en: 'Tongcheng Travel finance visual collection cover with a purple and yellow fish',
      zh: '紫黄色鱼形视觉的同程旅游金融作品合集封面',
    },
  },
  gallery: [
    {
      src: '/images/archive/details/tongcheng-travel/01-crowdfunding-2.png',
      width: 1440,
      height: 810,
      alt: {
        en: 'Crowdfunding 2.0 travel finance product screens and performance metrics',
        zh: '众筹 2.0 旅游金融产品界面与转让数据',
      },
    },
    {
      src: '/images/archive/details/tongcheng-travel/02-mashangyou-japan.jpg',
      width: 1440,
      height: 810,
      alt: { en: 'Mashangyou Japan travel product design', zh: '码上游日本旅游产品设计' },
    },
    {
      src: '/images/archive/details/tongcheng-travel/03-tongcheng-partner.jpg',
      width: 1440,
      height: 810,
      alt: { en: 'Tongcheng Partner product design', zh: '同程合伙人产品设计' },
    },
    {
      src: '/images/archive/details/tongcheng-travel/04-outbound-travel-mini-program.jpg',
      width: 1440,
      height: 810,
      alt: { en: 'Outbound travel mini program design', zh: '出境游小程序界面设计' },
    },
  ],
},
```

- [ ] **Step 4: Run the focused content tests and verify GREEN**

Run:

```bash
npm test -- tests/unit/home-content.test.ts
```

Expected: all tests in `home-content.test.ts` pass.

- [ ] **Step 5: Commit the content and media**

```bash
git add content/home.ts tests/unit/home-content.test.ts public/images/archive/details/tongcheng-travel
git commit -m "feat: add Tongcheng visual archive content"
```

### Task 3: Render The Fifth Card And Its Cover Composition

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `components/home/visual-archive.tsx`
- Modify: `components/home/home.module.css`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Update the component contract to five cards**

In the VisualArchive tests, update card, Lightbox-trigger, skills, and localized skills-label counts from `4` to `5`. Update the variant list and initial position:

```ts
expect(
  Array.from(container.querySelectorAll<HTMLElement>('[data-cover-variant]')).map(
    (card) => card.dataset.coverVariant,
  ),
).toEqual([
  'alibaba',
  'open-language',
  'doudou-fox',
  'mr-chong',
  'tongcheng-travel',
]);
expect(container.querySelector('[data-archive-position]')).toHaveTextContent(
  '01 / 05',
);
```

Add localized content checks scoped to the new card:

```ts
const tongchengCard = within(
  container.querySelector<HTMLElement>(
    '[data-cover-variant="tongcheng-travel"]',
  ) as HTMLElement,
);
expect(tongchengCard.getByRole('heading', { name: '同程旅游' })).toBeVisible();
expect(tongchengCard.getByText(
  '在同程旅游金融事业部，面向不同用户群体，参与多类产品的体验与界面设计。',
)).toBeVisible();
expect(tongchengCard.getByText('UI设计')).toBeVisible();
```

Add a Lightbox ordering test:

```ts
it('opens the four-image Tongcheng gallery with crowdfunding first', () => {
  const { baseElement } = render(<VisualArchive locale="zh" />);

  fireEvent.click(screen.getByRole('button', {
    name: '打开项目图片: 同程旅游',
  }));

  expect(screen.getByRole('status', { name: '画廊位置: 01 / 04' })).toHaveTextContent(
    '01 / 04',
  );
  expect(baseElement.querySelectorAll('[data-gallery-mobile] img')).toHaveLength(4);
  expect(screen.getAllByRole('img', {
    name: '众筹 2.0 旅游金融产品界面与转让数据',
  }).length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the focused component test and verify RED**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL on `01 / 05` because `VisualArchive` currently renders `total - 1` as the total.

- [ ] **Step 3: Correct the displayed total**

In `components/home/visual-archive.tsx`, replace both total displays:

```tsx
<span className={styles.archiveCount}>
  {formatIndex(total)} {copy.projectCount}
</span>
```

```tsx
{formatIndex(activeIndex)} / {formatIndex(total)}
```

- [ ] **Step 4: Add the Tongcheng cover positioning**

Add the variant-specific rules after the Mr Chong rules in `components/home/home.module.css`:

```css
.archiveItem[data-cover-variant='tongcheng-travel'] .archiveCoverIndex {
  inset-block-start: 5%;
  inset-inline-start: 4.5%;
  color: #fff;
}

.archiveItem[data-cover-variant='tongcheng-travel'] .archiveCoverTitle {
  inset-block-start: 67%;
  inset-inline-start: 12%;
  width: 34%;
  color: #fff;
}
```

Keep the shared `.archiveCoverTitle h3` font sizing unchanged. The percentage positioning places the baseline below the fish's white oval while retaining the same title scale as every other cover.

- [ ] **Step 5: Run the focused component test and verify GREEN**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: all tests in `homepage.test.tsx` pass.

- [ ] **Step 6: Commit the rendered card**

```bash
git add components/home/visual-archive.tsx components/home/home.module.css tests/component/homepage.test.tsx
git commit -m "feat: render Tongcheng visual archive card"
```

### Task 4: Update Carousel Acceptance Coverage

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Update archive counts and positions**

Change archive card and cover-variant counts from `4` to `5`, initial position assertions from `01 / 04` to `01 / 05`, and second position assertions from `02 / 04` to `02 / 05`.

Update the final-card test to click four times and expect the fifth card:

```ts
await next.click();
await next.click();
await next.click();
await next.click();

await expect(archive.locator('[data-archive-position]')).toContainText('05 / 05');
await expect(archive.locator('[data-archive-card]').last()).toHaveAttribute(
  'data-active',
  'true',
);
await expect(next).toBeDisabled();
```

- [ ] **Step 2: Add a browser-level Tongcheng Lightbox check**

Add a desktop-only test that opens the new card and verifies the lead image:

```ts
test('opens the Tongcheng gallery with crowdfunding first', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One desktop Lightbox viewport is sufficient.');
  await page.goto('/zh/', { waitUntil: 'networkidle' });

  const trigger = page.getByRole('button', { name: '打开项目图片: 同程旅游' });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  await expect(page.getByRole('status', { name: '画廊位置: 01 / 04' })).toBeVisible();
  await expect(page.getByRole('img', {
    name: '众筹 2.0 旅游金融产品界面与转让数据',
  }).first()).toBeVisible();
});
```

- [ ] **Step 3: Run the focused Playwright checks**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep 'Visual Archive|Tongcheng gallery|approved hierarchy'
```

Expected: all selected desktop tests pass.

- [ ] **Step 4: Commit the acceptance coverage**

```bash
git add tests/e2e/homepage.spec.ts
git commit -m "test: cover fifth Visual Archive card"
```

### Task 5: Verify Responsive Composition And Regression Scope

**Files:**
- Verify: `components/home/home.module.css`
- Verify: `content/home.ts`
- Verify: `components/home/visual-archive.tsx`

- [ ] **Step 1: Run static and focused automated checks**

Run:

```bash
npm run lint
npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx
npm run build
```

Expected: lint, focused Vitest files, publication validation, and Next.js build all pass.

- [ ] **Step 2: Inspect the card at desktop width**

Start the app on an unused local port:

```bash
npm run dev -- --port 50211
```

Open `http://localhost:50211/zh/#archive` at 1440 x 1000, navigate to card five, and verify:

- `同程旅游` is below the fish/white oval with roughly one title-line of clear space.
- The title uses the same computed font size and weight as another archive cover title.
- The title does not overlap the fish, left metadata, or right-side geometric artwork.
- The card reports `05 / 05` and Next is disabled.
- The Lightbox opens on `众筹20` and advances to `码上游日本` second.

- [ ] **Step 3: Inspect the card at mobile width**

Open the same URL at 390 x 844 and verify the title remains below the fish, fits inside the cover, and does not overlap adjacent content. Confirm the page has no horizontal overflow outside the archive scroller.

- [ ] **Step 4: Run the focused desktop and mobile acceptance suite**

Stop the manual dev server, then run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile --grep 'Visual Archive|Tongcheng gallery|horizontal overflow|approved hierarchy'
```

Expected: all selected desktop and mobile tests pass.

- [ ] **Step 5: Review the final diff and preserve unrelated changes**

Run:

```bash
git diff --check
git status --short
git diff origin/main...HEAD -- content/home.ts components/home/visual-archive.tsx components/home/home.module.css tests/unit/home-content.test.ts tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
```

Expected: the implementation changes only the Visual Archive files, focused tests, the five new assets, and the approved documentation. Existing `next-env.d.ts` and `output/` changes remain unstaged and unchanged.
