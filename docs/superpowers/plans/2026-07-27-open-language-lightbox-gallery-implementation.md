# Open Language Lightbox Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Open Language homepage lightbox content with the three supplied portfolio screenshots in the approved order while preserving the existing card cover.

**Architecture:** Keep the shared `Lightbox` and `VisualArchive` components unchanged. Add three static PNG assets under the existing archive detail-media hierarchy, then give the Open Language content entry an ordered `gallery` array that uses those assets; a focused unit test locks the order.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Vitest, Testing Library, Playwright

---

### Task 1: Lock The Open Language Gallery Contract

**Files:**
- Modify: `tests/unit/home-content.test.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Write the failing gallery-order test**

Add this test inside `describe('Visual Archive contract', ...)`:

```ts
it('publishes the approved Open Language lightbox gallery order', () => {
  const openLanguage = archiveProjects.find(
    (project) => project.key === 'bytedance-open-language',
  );

  expect(openLanguage?.gallery?.map((image) => image.src)).toEqual([
    '/images/archive/details/open-language/01-design-principles.png',
    '/images/archive/details/open-language/02-lightweight-brand.png',
    '/images/archive/details/open-language/03-warm-friend.png',
  ]);
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the missing gallery**

Run: `npx vitest run tests/unit/home-content.test.ts -t "approved Open Language lightbox gallery order"`

Expected: FAIL because `openLanguage.gallery` is currently undefined.

### Task 2: Add The Approved Screenshots And Gallery Metadata

**Files:**
- Create: `public/images/archive/details/open-language/01-design-principles.png`
- Create: `public/images/archive/details/open-language/02-lightweight-brand.png`
- Create: `public/images/archive/details/open-language/03-warm-friend.png`
- Modify: `content/home.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Copy the supplied source screenshots without resizing or recompression**

Copy the three supplied files to the matching numbered destinations above:

```text
开言设计原则.png -> 01-design-principles.png
86.png           -> 02-lightweight-brand.png
87.png           -> 03-warm-friend.png
```

- [ ] **Step 2: Add the ordered gallery to the Open Language archive entry**

Add this `gallery` immediately after the existing Open Language `image` object in `content/home.ts`:

```ts
gallery: [
  {
    src: '/images/archive/details/open-language/01-design-principles.png',
    width: 4695,
    height: 2641,
    alt: {
      en: 'Open Language design principles overview',
      zh: '开言英语设计原则总览',
    },
  },
  {
    src: '/images/archive/details/open-language/02-lightweight-brand.png',
    width: 2880,
    height: 1620,
    alt: {
      en: 'Open Language lightweight brand expression examples',
      zh: '开言英语轻松自由的品牌视觉案例',
    },
  },
  {
    src: '/images/archive/details/open-language/03-warm-friend.png',
    width: 2880,
    height: 1620,
    alt: {
      en: 'Open Language warm and encouraging learning experience examples',
      zh: '开言英语温暖鼓励的学习体验案例',
    },
  },
],
```

- [ ] **Step 3: Run the focused test and verify it passes**

Run: `npx vitest run tests/unit/home-content.test.ts -t "approved Open Language lightbox gallery order"`

Expected: PASS with one matching test and no failures.

- [ ] **Step 4: Verify the copied files**

Run `sips -g pixelWidth -g pixelHeight public/images/archive/details/open-language/*.png` and compare each source/destination pair with `shasum -a 256`.

Expected: dimensions are `4695x2641`, `2880x1620`, and `2880x1620`; each source/destination pair has the same SHA-256 digest.

- [ ] **Step 5: Commit the gallery content change**

```bash
git add tests/unit/home-content.test.ts content/home.ts public/images/archive/details/open-language/*.png
git commit -m "feat: add Open Language lightbox gallery"
```

### Task 3: Verify Homepage Lightbox Behavior

**Files:**
- Verify: `content/home.ts`
- Verify: `components/home/visual-archive.tsx`
- Verify: `components/media/lightbox.tsx`
- Test: `tests/unit/home-content.test.ts`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Run the focused suites**

Run: `npx vitest run tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: both test files pass with zero failures.

- [ ] **Step 2: Run focused lint**

Run: `npx eslint content/home.ts tests/unit/home-content.test.ts`

Expected: exit code 0 with no errors.

- [ ] **Step 3: Start the local site**

Run: `npm run dev -- --hostname 127.0.0.1`

Expected: Next.js reports a local URL and accepts homepage requests.

- [ ] **Step 4: Verify desktop lightbox behavior**

At `1440x1000`, open the Chinese homepage, scroll to Visual Archive, open the `开言设计原则` card, and verify the counter starts at `1 / 3`; next navigation shows the supplied `86.png` and then `87.png`; images and controls do not clip or overlap.

- [ ] **Step 5: Verify mobile lightbox behavior**

At `390x844`, open the same card and verify all three screenshots appear in the approved vertical order, retain their aspect ratios, and do not overlap the sticky controls.

- [ ] **Step 6: Inspect the final diff**

Run: `git status --short && git diff --check HEAD~1..HEAD && git show --stat --oneline HEAD`

Expected: only the three new PNGs, `content/home.ts`, and `tests/unit/home-content.test.ts` belong to the implementation commit; unrelated files remain untouched.
