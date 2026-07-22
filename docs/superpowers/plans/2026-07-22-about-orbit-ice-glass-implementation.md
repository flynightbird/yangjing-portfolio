# About Orbit Ice Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harmonize the About capability orbit with its bright blue background by replacing black node treatments with a coherent ice-blue glass material system.

**Architecture:** Preserve the existing SVG and animation structure. Expose a stable material contract on the orbit frame, then update only the orbit-related CSS tokens and fills.

**Tech Stack:** Next.js, React, CSS Modules, Vitest, Testing Library

---

### Task 1: Lock the material contract

**Files:**
- Modify: `tests/component/about-page.test.tsx`

- [ ] Add an assertion that the orbit frame uses `data-orbit-material="ice-glass"`.
- [ ] Run `npm test -- tests/component/about-page.test.tsx` and confirm the assertion fails because the material is not yet exposed.

### Task 2: Implement the ice-glass orbit

**Files:**
- Modify: `components/about/about-page.tsx`
- Modify: `components/about/about-page.module.css`

- [ ] Add `data-orbit-material="ice-glass"` to the existing orbit frame.
- [ ] Replace the black center hub with translucent cobalt and a cool-white edge.
- [ ] Replace the four black nodes with translucent pale blue and a shared cool-white edge.
- [ ] Unify orbit lines, marker, labels, and captions into the approved blue and cool-white palette.
- [ ] Run the focused component test and confirm it passes.

### Task 3: Verify the rendered result

**Files:**
- Verify: `components/about/about-page.module.css`

- [ ] Run lint and the focused About component test.
- [ ] Capture desktop and 390px screenshots for both locale routes.
- [ ] Confirm the frame remains square, labels are readable over cyan and clouds, animation remains active, and no horizontal overflow appears.

