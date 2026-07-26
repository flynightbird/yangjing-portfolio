# Visual Archive Wheel Passthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make dominant vertical mouse-wheel input over the Visual Archive move the page immediately without changing the carousel's horizontal position or the site's global smooth-scroll behavior.

**Architecture:** Keep the existing passive wheel listener and animation-frame delta coalescing because Chromium consumes vertical wheel input over the horizontal overflow container. Around the single forwarded page scroll, temporarily override the document element's inline `scrollBehavior` to `auto`, then restore it through `try/finally`; leave horizontal-dominant input untouched for native carousel scrolling.

**Tech Stack:** React 19, TypeScript, Playwright, Next.js 16

---

## File Map

- Modify `tests/e2e/homepage.spec.ts`: turn the permissive archive wheel check into exact vertical passthrough and horizontal-isolation contracts.
- Modify `components/home/visual-archive.tsx`: make the existing forwarded page scroll instantaneous without changing global CSS.

### Task 1: Define the immediate wheel passthrough contract

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Strengthen the existing vertical wheel test**

Replace the loose `scrollY > before + 100` assertion in `keeps vertical page scrolling active over the Visual Archive` with state captured before and `100ms` after the wheel:

```ts
const before = await page.evaluate(() => ({
  pageY: window.scrollY,
  archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
    ?.scrollLeft ?? 0,
  inlineScrollBehavior: document.documentElement.style.scrollBehavior,
}));
const maximum = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight,
);
expect(maximum - before.pageY).toBeGreaterThan(550);

await page.mouse.wheel(0, 500);
await page.waitForTimeout(100);

const after = await page.evaluate(() => ({
  pageY: window.scrollY,
  archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
    ?.scrollLeft ?? 0,
  inlineScrollBehavior: document.documentElement.style.scrollBehavior,
}));
expect(after.pageY - before.pageY).toBeGreaterThanOrEqual(450);
expect(after.pageY - before.pageY).toBeLessThanOrEqual(550);
expect(Math.abs(after.archiveX - before.archiveX)).toBeLessThanOrEqual(1);
expect(after.inlineScrollBehavior).toBe(before.inlineScrollBehavior);
```

- [ ] **Step 2: Add a horizontal-dominant wheel isolation test**

Add this desktop-only test beside the vertical wheel test:

```ts
test('leaves horizontal-dominant archive wheel input on the carousel', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'Fine-pointer wheel behavior is verified at the desktop viewport.',
  );
  await page.goto('/en/', { waitUntil: 'networkidle' });

  const scroller = page.locator('[data-archive-scroller]');
  await scroller.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 120), behavior: 'instant' });
  });
  const box = await scroller.boundingBox();
  if (!box) throw new Error('Missing Visual Archive scroller bounds');

  await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 160));
  const before = await page.evaluate(() => ({
    pageY: window.scrollY,
    archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
      ?.scrollLeft ?? 0,
  }));
  await page.mouse.wheel(400, 0);
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => ({
    pageY: window.scrollY,
    archiveX: document.querySelector<HTMLElement>('[data-archive-scroller]')
      ?.scrollLeft ?? 0,
  }));

  expect(Math.abs(after.pageY - before.pageY)).toBeLessThanOrEqual(1);
  expect(after.archiveX).toBeGreaterThan(before.archiveX + 1);
});
```

- [ ] **Step 3: Run both tests and confirm RED**

Run:

```bash
PW_PORT=4175 PW_REUSE_SERVER=1 npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "vertical page scrolling|horizontal-dominant archive"
```

Expected: the vertical test fails because the current smooth forwarding has not completed a `450px` move within `100ms`; the horizontal test passes and protects the existing carousel behavior.

- [ ] **Step 4: Commit the failing regression contract**

```bash
git add tests/e2e/homepage.spec.ts
git commit -m "test: define Visual Archive wheel passthrough"
```

### Task 2: Make the forwarded vertical scroll immediate

**Files:**
- Modify: `components/home/visual-archive.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Apply the local scroll-behavior override**

Replace the body of `flushVerticalWheel` with:

```tsx
const flushVerticalWheel = () => {
  const top = pendingDelta;
  pendingDelta = 0;
  frame = 0;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  try {
    window.scrollBy({ top, behavior: 'auto' });
  } finally {
    root.style.scrollBehavior = previousScrollBehavior;
  }
};
```

Do not change the dominant-axis check, listener passivity, requestAnimationFrame coalescing, horizontal scroll handling, or cleanup.

- [ ] **Step 2: Rebuild the static preview**

Run:

```bash
npm run build:framework
```

Expected: TypeScript passes and 17 static pages are generated. The existing preview at port `4175` serves the refreshed export.

- [ ] **Step 3: Run the focused wheel tests and confirm GREEN**

Run:

```bash
PW_PORT=4175 PW_REUSE_SERVER=1 npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "vertical page scrolling|horizontal-dominant archive"
```

Expected: both tests pass. The vertical wheel moves the page `450px` to `550px` within `100ms`, preserves carousel `scrollLeft`, and restores the document's inline style; the horizontal wheel moves the carousel by more than `1px` without moving the page.

- [ ] **Step 4: Run the affected homepage interaction regressions**

Run:

```bash
PW_PORT=4175 PW_REUSE_SERVER=1 npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "Visual Archive|archive gallery"
npx vitest run tests/component/homepage.test.tsx
npm run lint
git diff --check
```

Expected: affected homepage interaction and component tests pass; lint has no errors. The three pre-existing Xuelang `<img>` warnings may remain.

- [ ] **Step 5: Commit the implementation**

```bash
git add components/home/visual-archive.tsx
git commit -m "fix: release Visual Archive vertical wheel"
```

- [ ] **Step 6: Confirm the preview and worktree**

Run:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:4175/en/
git status --short --branch
```

Expected: preview returns `200` and the worktree is clean.
