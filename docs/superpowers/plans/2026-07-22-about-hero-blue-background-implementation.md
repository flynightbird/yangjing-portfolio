# About Hero Blue Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place the supplied blue artwork behind the existing About capability orbit while limiting dark translucency to text-bearing circles.

**Architecture:** Keep `CapabilityOrbit` and its SVG interaction structure intact. Add the raster artwork as a CSS background on the existing frame, then change only the hub and node circle fills to translucent black so the artwork remains visible elsewhere.

**Tech Stack:** Next.js, React, CSS Modules, Vitest, Testing Library

---

### Task 1: Lock the background contract in a component test

**Files:**
- Modify: `tests/component/about-page.test.tsx`

- [ ] **Step 1: Add a failing assertion**

Render the About page and assert that the capability frame exposes `/images/about/about-hero-blue-bg.png` through its computed class contract or a stable data attribute.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/component/about-page.test.tsx`

Expected: FAIL because the About capability frame does not yet reference the new background.

### Task 2: Add the artwork and focused styling

**Files:**
- Create: `public/images/about/about-hero-blue-bg.png`
- Modify: `components/about/about-page.tsx`
- Modify: `components/about/about-page.module.css`

- [ ] **Step 1: Copy the approved square source asset**

Copy the supplied 750 by 750 PNG to `public/images/about/about-hero-blue-bg.png` without recompression.

- [ ] **Step 2: Expose the capability frame background contract**

Add `data-about-orbit-background` to the existing orbit frame without changing its accessible presentation.

- [ ] **Step 3: Apply the background and localized translucency**

Set the frame background to the new asset using centered cover sizing. Keep the SVG canvas transparent, and use translucent black only for `.orbitHub` and the four node circles.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- tests/component/about-page.test.tsx`

Expected: PASS.

### Task 3: Verify rendering and regression safety

**Files:**
- Verify: `app/(localized)/[locale]/about/page.tsx`

- [ ] **Step 1: Run lint and component tests**

Run: `npm run lint` and `npm test -- tests/component/about-page.test.tsx`

Expected: both exit successfully.

- [ ] **Step 2: Build the application**

Run: `npm run build`

Expected: build exits successfully and emits both locale routes.

- [ ] **Step 3: Inspect desktop and mobile screenshots**

Open `/en/about/` and `/zh/about/` at desktop and 390px widths. Confirm the image fills the frame, only text-bearing circles are darkened, animations remain present, labels stay readable, and there is no horizontal overflow.
