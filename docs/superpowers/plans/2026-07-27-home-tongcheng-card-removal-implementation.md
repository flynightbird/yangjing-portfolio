# Homepage Tongcheng Card Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the standalone Tongcheng Travel card from the homepage Visual Archive while keeping MR CHONG and all source assets intact.

**Architecture:** Treat `archiveProjects` as the publication boundary. Remove only `tongcheng-finance-ui` from that array, then update unit, component, and end-to-end contracts to the resulting four-card carousel without changing shared UI components.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, Playwright

---

### Task 1: Lock The Four-Card Publication Contract

**Files:**
- Modify: `tests/unit/home-content.test.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Replace the five-project assertion with the approved four-card order**

Expect these keys and variants and reject the removed key:

```ts
expect(archiveProjects.map((project) => project.key)).toEqual([
  'alibaba-meipingmeiwu',
  'bytedance-open-language',
  'bytedance-doudou-fox',
  'tongcheng-mr-chong',
]);
expect(archiveProjects.map((project) => project.coverVariant)).toEqual([
  'alibaba',
  'open-language',
  'doudou-fox',
  'mr-chong',
]);
expect(archiveProjects).toHaveLength(4);
expect(archiveProjects.some((project) => project.key === 'tongcheng-finance-ui')).toBe(false);
```

Delete the obsolete test that requires the Tongcheng Travel finance gallery to be published.

- [ ] **Step 2: Run the focused unit test and verify RED**

Run: `npx vitest run tests/unit/home-content.test.ts -t "four approved archive projects"`

Expected: FAIL because `archiveProjects` still contains `tongcheng-finance-ui`.

### Task 2: Remove The Homepage Publication Entry

**Files:**
- Modify: `content/home.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Delete only the `tongcheng-finance-ui` object from `archiveProjects`**

Keep the preceding `tongcheng-mr-chong` entry and do not delete anything under `public/images/archive/details/tongcheng-travel/`.

- [ ] **Step 2: Run the focused unit test and verify GREEN**

Run: `npx vitest run tests/unit/home-content.test.ts -t "four approved archive projects"`

Expected: PASS with no failures.

### Task 3: Update Homepage Rendering And Carousel Tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Update component expectations to four cards**

Change card, trigger, skills, and label counts from 5 to 4; remove `tongcheng-travel` cover assertions and the standalone Tongcheng gallery test. Keep all MR CHONG visibility and four-image-gallery assertions. In English, expect one visible `Tongcheng Travel` company label and no `Tongcheng Travel` heading; in Chinese, expect no `同程旅游` heading or `打开项目图片: 同程旅游` trigger.

- [ ] **Step 2: Update end-to-end carousel expectations**

Change archive counters from `01 / 05` and `05 / 05` to `01 / 04` and `04 / 04`; navigate to the end with three next clicks. Delete the Tongcheng cover-geometry and Tongcheng gallery tests. Preserve the final-card-active assertion, which now targets MR CHONG.

- [ ] **Step 3: Run focused unit and component tests**

Run: `npx vitest run tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: both files pass with zero failures.

- [ ] **Step 4: Run the affected desktop end-to-end tests**

Run: `npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "Visual Archive|final Visual Archive"`

Expected: affected archive tests pass with no failures.

- [ ] **Step 5: Run focused lint**

Run: `npx eslint content/home.ts tests/unit/home-content.test.ts tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts`

Expected: exit code 0 with no errors.

### Task 4: Verify And Commit

**Files:**
- Verify: `content/home.ts`
- Verify: `tests/unit/home-content.test.ts`
- Verify: `tests/component/homepage.test.tsx`
- Verify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests pass with the existing jsdom Canvas/Media warnings only.

- [ ] **Step 2: Run a production build**

Run: `npm run build`

Expected: publication validation and the Next.js static build complete successfully.

- [ ] **Step 3: Inspect the diff and confirm retained assets**

Run: `git diff --check && git status --short && test -f public/images/archive/details/tongcheng-travel/cover.png`

Expected: four code/test files are modified, the retained Tongcheng asset check succeeds, and no image file is deleted.

- [ ] **Step 4: Commit the removal**

```bash
git add content/home.ts tests/unit/home-content.test.ts tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "fix: remove Tongcheng homepage card"
```
