# Visual Archive Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tall Visual Archive grid with a compact, accessible horizontal carousel that preserves Draft publication boundaries.

**Architecture:** Convert `VisualArchive` into a client-side scroll-snap component with a DOM-ref based active index and explicit previous/next controls. Keep the existing archive entry schema and Lightbox path for real entries. Draft entries use a component-local, presentation-only map of existing local screenshots and remain blocked from publication.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, Next.js 16.

---

### Task 1: Define carousel behavior with failing tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] Add a component test requiring eight carousel cards, localized previous and next buttons, a live position label, Draft labels, and decorative placeholder images.
- [ ] Add browser assertions for horizontal scroll movement, disabled end states, scroll snap, section height, and mobile next-card visibility.
- [ ] Run `npm test -- tests/component/homepage.test.tsx` and confirm the new component test fails because the controls and carousel structure do not exist.

### Task 2: Implement the component contract

**Files:**
- Modify: `components/home/visual-archive.tsx`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`

- [ ] Add localized labels for previous, next, position, count, and visual placeholders.
- [ ] Add a presentation-only Draft image map using existing local screenshots.
- [ ] Add the scroll viewport, track, card refs, active-index state, previous and next controls, and progress variables.
- [ ] Preserve the real-entry Lightbox and external action behavior.
- [ ] Run `npm test -- tests/component/homepage.test.tsx` and confirm the focused component test passes.

### Task 3: Build the responsive visual system

**Files:**
- Modify: `components/home/home.module.css`

- [ ] Replace the 12-column archive grid with a full-bleed horizontal viewport and controlled card widths.
- [ ] Add wide, standard, and portrait card variants derived from layout index.
- [ ] Add Johnyvino-inspired circular arrow controls, position counter, thin progress rail, adjacent-card reveal, and restrained media motion using existing tokens.
- [ ] Add responsive mobile widths, touch scrolling, focus-visible styles, and reduced-motion overrides.
- [ ] Keep the section below one viewport at target desktop and mobile sizes.

### Task 4: Verify behavior and production compatibility

**Files:**
- Modify only if a verified regression requires it.

- [ ] Run `npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build:framework`.
- [ ] Run the focused homepage Playwright tests.
- [ ] Start a local static or development server and inspect 1440x900, 768x1024, and 390x844.
- [ ] Verify card movement, disabled buttons, focus states, touch-sized controls, no page-level overflow, and reduced motion.
- [ ] Capture desktop and mobile screenshots and compare the section height and next-card reveal against the approved design.
