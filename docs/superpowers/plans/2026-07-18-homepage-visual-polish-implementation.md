# Homepage Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved navigation morph, project metadata and CTA hierarchy, Soft Silk liquid fields, light AIDX browser chrome, and rounded Xuelang media without changing Visual Archive internals.

**Architecture:** Keep the existing homepage component boundaries. Add one reusable project metadata row, replace the header's direct scroll listener with a top sentinel observed by `IntersectionObserver`, and keep the shared Canvas 2D liquid component while changing its renderer from filled wave polygons to blurred oversized ellipses. CSS Modules own visual states and responsive geometry.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, CSS Modules, Canvas 2D, Vitest, Testing Library, Playwright.

---

### Task 1: Lock Navigation And Project Contracts

**Files:**
- Modify: `tests/component/site-header.test.tsx`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`

- [ ] **Step 1: Write failing component tests**

Assert that the header renders `Yang Jing`, exposes a top sentinel, and enters its compact state when the sentinel is not intersecting. Assert that all six projects render `[data-project-meta]`, and that only Call Agent, ConvoAI, and Meeting render `[data-cta-treatment="white"]`.

- [ ] **Step 2: Run tests and verify RED**

Run `npx vitest run tests/component/site-header.test.tsx tests/component/homepage.test.tsx`. Expected: failures for the absent sentinel, full home label, metadata hooks, and CTA hooks.

- [ ] **Step 3: Implement the header state without a scroll listener**

Render an inert top sentinel and observe it with `IntersectionObserver`. Use the result for `data-scrolled`. Recompose the bar into left, centered, and right regions while preserving mobile menu behavior and locale switching.

- [ ] **Step 4: Verify focused tests pass**

Run `npx vitest run tests/component/site-header.test.tsx`. Expected: all header tests pass.

### Task 2: Unify Six Project Metadata Rows And CTA Hierarchy

**Files:**
- Create: `components/home/project-meta.tsx`
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `components/home/build-lab-preview.tsx`
- Modify: `components/home/live-website-project.tsx`
- Modify: `components/home/featured-project.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Add the reusable row**

Create `ProjectMeta` that composes `CompanyMark`, a slash separator, and the project kind in one semantic row with `data-project-meta`.

- [ ] **Step 2: Apply it to all six projects**

Replace vertically separated company/type elements in every core project. Add `data-cta-treatment="white"` to the first three CTA links only. Keep STT green and AIDX/Xuelang secondary.

- [ ] **Step 3: Add exact visual hierarchy**

Align company and kind typography, make the first three actions white filled buttons, and reserve at least 32px before following media/content. Ensure the metadata row wraps at 390px.

- [ ] **Step 4: Run focused tests**

Run `npx vitest run tests/component/homepage.test.tsx`. Expected: all homepage component tests pass.

### Task 3: Replace Hard Liquid Waves With Soft Silk Fields

**Files:**
- Modify: `tests/unit/aidx-showcase.test.ts`
- Modify: `components/ui/liquid-field.tsx`
- Modify: `components/home/aidx-showcase.module.css`
- Modify: `components/shell/site-footer.module.css`

- [ ] **Step 1: Write a failing source contract**

Assert that the liquid renderer contains the approved AIDX palette, uses radial gradients, and does not use polygon path APIs such as `lineTo`.

- [ ] **Step 2: Run the unit test and verify RED**

Run `npx vitest run tests/unit/aidx-showcase.test.ts`. Expected: failure because the current renderer uses hard wave polygons.

- [ ] **Step 3: Implement Soft Silk rendering**

Draw oversized animated radial-gradient ellipses on an offscreen canvas, blur them before compositing, and drift them slowly with low-amplitude pointer response. Use the brighter AIDX palette and a darker Footer variant. Keep IntersectionObserver pause and reduced-motion behavior.

- [ ] **Step 4: Match AIDX browser chrome to STT**

Change the AIDX browser chrome to a light gray surface with subtle gray controls and low-contrast dark URL text. Preserve the browser's 20px radius and safe non-interactive iframe.

- [ ] **Step 5: Run focused tests**

Run `npx vitest run tests/unit/aidx-showcase.test.ts tests/component/homepage.test.tsx tests/component/site-footer.test.tsx`. Expected: all pass.

### Task 4: Finish Xuelang Geometry And Responsive Verification

**Files:**
- Modify: `components/home/home.module.css`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add the visual E2E contract**

Assert the top and scrolled navigation geometry, six metadata rows, three white CTA hooks, AIDX light chrome, Xuelang 20px media radius, and no horizontal overflow at desktop and 390px.

- [ ] **Step 2: Implement Xuelang media framing**

Give the Xuelang media page gutters, a 20px radius, low-contrast border, stable aspect ratio, and clipping without adding a card around the text or changing its route/content.

- [ ] **Step 3: Run complete verification**

Run `npx vitest run tests/component/site-header.test.tsx tests/component/homepage.test.tsx tests/component/site-footer.test.tsx tests/unit/aidx-showcase.test.ts`, `npm run lint`, and `npm run build:framework`. Then use Playwright screenshots at desktop and 390px to verify non-overlap, media loading, and horizontal overflow.

- [ ] **Step 4: Commit and push**

Stage only the files named in this plan. Commit the implementation and push `codex/portfolio-nextjs` to origin.

