# Call Agent Publication and Xuelang Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved Call Agent video-story polish on the canonical Homepage destination and align Xuelang with the shared portfolio detail navigation.

**Architecture:** Keep `/{locale}/work/call-agent/` as the single canonical route and integrate only the already reviewed `a021ed5` change set onto the latest `main`. Xuelang continues to consume the shared `SiteHeader` and `ChapterNav`; removing its legacy props makes shared defaults the only navigation behavior.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, GitHub Pages deployment from `main`.

---

## File Map

- `components/call-agent/*`: receive the approved Hero sequence, browser-video polish, and layout integration from `a021ed5`.
- `public/videos/call-agent/agent-preview.mp4`: receive the complete, untrimmed Preview recording from `a021ed5`.
- `evidence/call-agent/video-manifest.json` and `evidence/call-agent/checksums.json`: preserve the full-source publication contract.
- `scripts/prepare-call-agent-videos.mjs`: validate full-source conversion separately from explicit trim inputs.
- `components/xuelang/xuelang-layout.tsx`: stop opting into legacy chapter numbering and project-specific variants.
- `tests/component/xuelang-layout.test.tsx`: define the shared Xuelang navigation contract.
- Existing Call Agent, Homepage, SiteHeader, portfolio-system, and Playwright tests: verify canonical routing and prevent regressions.

### Task 1: Integrate the approved Call Agent detail commit

**Files:**
- Modify: `components/call-agent/call-agent-browser-video.module.css`
- Modify: `components/call-agent/call-agent-browser-video.tsx`
- Create: `components/call-agent/call-agent-hero-sequence.module.css`
- Create: `components/call-agent/call-agent-hero-sequence.tsx`
- Modify: `components/call-agent/call-agent-layout.module.css`
- Modify: `components/call-agent/call-agent-layout.tsx`
- Modify: `evidence/call-agent/checksums.json`
- Modify: `evidence/call-agent/video-manifest.json`
- Modify: `public/videos/call-agent/agent-preview.mp4`
- Modify: `scripts/prepare-call-agent-videos.mjs`
- Test: `tests/component/call-agent-browser-video.test.tsx`
- Test: `tests/component/call-agent-layout.test.tsx`
- Test: `tests/e2e/call-agent.visual.spec.ts`
- Test: `tests/unit/call-agent-video-assets.test.ts`
- Test: `tests/unit/portfolio-detail-system.test.ts`

- [ ] **Step 1: Confirm the integration base is clean and current**

Run:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Expected: no status output, branch `main`, and the latest local `main` commit.

- [ ] **Step 2: Cherry-pick the approved commit**

Run:

```bash
git cherry-pick a021ed5
```

Expected: a new commit on `main` with subject `feat: polish call agent video storytelling`. If a touched file conflicts, preserve newer unrelated `main` behavior and the complete approved Call Agent behavior from `a021ed5`, then continue with `git cherry-pick --continue`.

- [ ] **Step 3: Run the focused Call Agent contract tests**

Run:

```bash
node node_modules/vitest/vitest.mjs run \
  tests/unit/call-agent-video-assets.test.ts \
  tests/component/call-agent-browser-video.test.tsx \
  tests/component/call-agent-layout.test.tsx \
  tests/unit/portfolio-detail-system.test.ts \
  --maxWorkers=1
```

Expected: 4 test files and 31 tests pass.

### Task 2: Move Xuelang onto shared navigation defaults

**Files:**
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `components/xuelang/xuelang-layout.tsx`

- [ ] **Step 1: Write the failing shared-navigation assertions**

Replace the two legacy assertions in `tests/component/xuelang-layout.test.tsx` with:

```tsx
expect(container.querySelector('[data-chapter-variant="default"]')).toBeInTheDocument();
expect(container.querySelector('[data-chapter-index="01"]')).toHaveTextContent('01');
expect(container.querySelector('[data-chapter-variant="xuelang"]')).not.toBeInTheDocument();
expect(container.querySelector('[data-chapter-index="00"]')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the component test and verify it fails**

Run:

```bash
node node_modules/vitest/vitest.mjs run tests/component/xuelang-layout.test.tsx --maxWorkers=1
```

Expected: FAIL because the layout still emits `data-chapter-variant="xuelang"` and chapter index `00`.

- [ ] **Step 3: Remove Xuelang's legacy ChapterNav props**

Change the call in `components/xuelang/xuelang-layout.tsx` to:

```tsx
<ChapterNav
  chapters={meta.chapters ?? []}
  locale={locale}
  compactAt="wide"
  surface="light"
/>
```

- [ ] **Step 4: Run focused navigation tests**

Run:

```bash
node node_modules/vitest/vitest.mjs run \
  tests/component/xuelang-layout.test.tsx \
  tests/component/site-header.test.tsx \
  tests/unit/portfolio-detail-system.test.ts \
  --maxWorkers=1
```

Expected: all tests pass; Xuelang begins at `01`, uses the default variant, and remains on the light shared header surface.

- [ ] **Step 5: Commit the Xuelang alignment**

Run:

```bash
git add components/xuelang/xuelang-layout.tsx tests/component/xuelang-layout.test.tsx
git commit -m "fix: align xuelang detail navigation"
```

Expected: one focused commit containing only the layout prop removal and its regression assertions.

### Task 3: Verify the canonical Homepage-to-detail workflow and publish

**Files:**
- Verify: `components/home/flagship-projects.tsx`
- Verify: `content/home.ts`
- Verify: `tests/component/homepage.test.tsx`
- Verify: `tests/e2e/homepage.spec.ts`
- Verify: `tests/e2e/call-agent.visual.spec.ts`
- Verify: `tests/e2e/portfolio-detail-system.spec.ts`

- [ ] **Step 1: Run the combined component and unit regression set**

Run:

```bash
node node_modules/vitest/vitest.mjs run \
  tests/component/homepage.test.tsx \
  tests/component/call-agent-browser-video.test.tsx \
  tests/component/call-agent-layout.test.tsx \
  tests/component/xuelang-layout.test.tsx \
  tests/component/site-header.test.tsx \
  tests/unit/call-agent-video-assets.test.ts \
  tests/unit/portfolio-detail-system.test.ts \
  --maxWorkers=1
```

Expected: all selected tests pass.

- [ ] **Step 2: Validate content and staged publication assets**

Run:

```bash
npm run validate:content
git diff --check
```

Expected: content validation exits successfully and `git diff --check` prints nothing.

- [ ] **Step 3: Run the relevant browser flows when the local runtime starts**

Run:

```bash
npx playwright test \
  tests/e2e/homepage.spec.ts \
  tests/e2e/call-agent.visual.spec.ts \
  tests/e2e/portfolio-detail-system.spec.ts \
  --project=desktop-chromium
```

Expected: Homepage navigation reaches `/en/work/call-agent/`, the latest Call Agent Hero sequence is present, and Xuelang navigation matches the shared detail geometry and styling. If the known machine-level Next native-module stall recurs before the browser server starts, record that limitation and rely on the passing focused component/unit contracts rather than claiming E2E passed.

- [ ] **Step 4: Inspect final branch state**

Run:

```bash
git status --short
git log --oneline -4
git diff origin/main..HEAD --stat
```

Expected: clean worktree and only the approved design, Call Agent integration, Xuelang alignment, and implementation-plan commits ahead of `origin/main`.

- [ ] **Step 5: Push the production branch**

Run:

```bash
git push origin main
```

Expected: the verified `main` head is pushed and the existing GitHub Pages workflow is triggered.
