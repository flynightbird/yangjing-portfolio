# Core Project Entries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved six-project homepage order and the dark asymmetric Call Agent + ConvoAI flagship board on `codex/hero-redesign`.

**Architecture:** Keep the homepage route and existing downstream project components intact. Add one focused Client Component for the interactive flagship pair, keep project metadata in `content/home.ts`, and keep localized visible copy in the existing dictionaries. Use React state only for discrete focus, CSS transforms for animation, and a static stacked mobile fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright.

---

### Task 1: Lock the six-project content contract

**Files:**
- Modify: `tests/unit/home-content.test.ts`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `content/home.ts`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`

- [ ] **Step 1: Write the failing tests**

Assert the order `call-agent`, `convo-ai`, `aidx`, `meeting`, `xuelang`, `stt-demo`; assert ConvoAI is a temporary external entry; assert STT opens `/demos/stt-demo/index.html`; assert both dictionaries expose `convoAi`.

- [ ] **Step 2: Run the focused tests to verify RED**

Run: `npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: FAIL because ConvoAI and the approved order are not implemented.

- [ ] **Step 3: Implement the minimal typed content changes**

Add `convo-ai` to `HomepageProjectId`; add the six records in the approved order; set STT to the direct static demo; add equivalent English and Chinese ConvoAI copy including a visible temporary-media notice.

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: remaining failures are limited to the missing flagship component.

### Task 2: Build the dark flagship pair

**Files:**
- Create: `components/home/flagship-projects.tsx`
- Modify: `components/home/featured-work.tsx`
- Modify: `components/home/home.module.css`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Extend tests for the approved interaction contract**

Assert each flagship has separate title, media, and CTA links; secure new-tab attributes; Call Agent is the default focus; ConvoAI carries `data-publication-state="temporary-media"`; and both media cards expose the 20px-radius class contract.

- [ ] **Step 2: Run the component test to verify RED**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because `FlagshipProjects` does not exist.

- [ ] **Step 3: Implement the component and styles**

Render an asymmetric `1.12fr / .88fr` desktop grid on solid `#0d0e10`, Morandi media surfaces `#565b55` and `#494f58`, 20px radius, local Call Agent evidence, temporary ConvoAI web/app imagery, 700ms transform/opacity motion, pointer and keyboard focus, delayed reset, reduced-motion support, and single-column mobile behavior.

- [ ] **Step 4: Update `FeaturedWork`**

Render `FlagshipProjects`, then AIDX, Meeting, Xuelang, and STT. Preserve all unrelated homepage modules.

- [ ] **Step 5: Run focused tests to verify GREEN**

Run: `npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx`

Expected: PASS.

### Task 3: Verify, commit, and push

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`
- Verify: all relevant source files

- [ ] **Step 1: Update the homepage E2E contract**

Assert the six-entry order, direct STT destination, three flagship links per entry, desktop focus changes, mobile stacking, loaded images, and no horizontal overflow.

- [ ] **Step 2: Run static verification**

Run: `npm run lint`

Run: `npm test`

Run: `npm run build:framework`

- [ ] **Step 3: Run browser verification**

Run the local server and execute the homepage Playwright tests on desktop and mobile, then inspect screenshots for clipping, overlap, media loading, and transition continuity.

- [ ] **Step 4: Review the diff and publication boundary**

Confirm `next-env.d.ts` remains unstaged. Confirm ConvoAI is labeled temporary and Meeting remains draft. Confirm no gradients are introduced in the flagship section.

- [ ] **Step 5: Commit and push**

Stage only this plan, content, component, CSS, and tests. Commit on `codex/hero-redesign`, then push the branch to `origin`.
