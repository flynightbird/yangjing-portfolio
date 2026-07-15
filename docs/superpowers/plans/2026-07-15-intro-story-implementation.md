# Intro Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localized, scroll-driven Editorial Aperture introduction between the formal Hero and selected projects, with desktop type capped at 60px.

**Architecture:** A server component supplies localized semantic content to a focused client motion component. GSAP ScrollTrigger controls the pinned forward sequence and reverse-entry shortcut, while scoped CSS provides the visual system, responsive type, and reduced-motion stack.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, GSAP, ScrollTrigger, Vitest, Testing Library, Playwright.

---

### Task 1: Lock The Semantic Contract

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Create: `components/home/intro-story.tsx`

- [ ] **Step 1: Write the failing component tests**

Add tests that import `IntroStory`, require four localized scenes, assert that each scene contains exactly two line elements, require four labeled navigation buttons, and assert that the homepage source orders `DualIdentityHero`, `IntroStory`, and `FeaturedWork`.

- [ ] **Step 2: Run the focused test and verify red**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because `@/components/home/intro-story` does not exist.

- [ ] **Step 3: Implement the server component**

Create `IntroStory` with an explicit localized four-scene tuple and pass it to `IntroStoryMotion`. Keep all copy visible in semantic markup and mark each physical line with `data-intro-line`.

- [ ] **Step 4: Run the focused test and verify green**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: PASS.

### Task 2: Implement The Motion Boundary

**Files:**
- Create: `components/home/intro-story-motion.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Add the four-scene client interaction**

Register ScrollTrigger once, create a pinned timeline only for `(prefers-reduced-motion: no-preference)`, update current-scene semantics during forward scroll, and use guarded `onEnterBack` logic to jump internally to scene one without replaying the intermediate reverse sequence.

- [ ] **Step 2: Add direct anchor navigation**

Each right-rail button maps its index to the pinned trigger range and scrolls there. Buttons expose `aria-current="step"` only for the active scene.

- [ ] **Step 3: Add reduced-motion cleanup**

In reduced motion, do not create a ScrollTrigger. Render all scenes as a normal vertical stack and keep the rail out of the reading flow.

### Task 3: Apply Editorial Aperture Styling

**Files:**
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Build the low-density frame**

Use the existing page paper and carbon tokens, full-width hairline geometry, a centered statement aperture, and a compact right rail. Add no cards, imagery, gradients, or unrelated accent colors.

- [ ] **Step 2: Enforce responsive typography**

Use `font-size: clamp(2.5rem, 4.17vw, 3.75rem)` on desktop so the computed maximum is exactly `60px`; scale mobile type up to approximately `34px`, reducing on narrow phones when required to preserve two physical lines beside the progress rail.

- [ ] **Step 3: Define scene transitions**

Use coherent opacity and vertical-translation transitions with one clear easing curve. Prevent inactive scenes from intercepting pointer events, and remove all transitions under reduced motion.

### Task 4: Insert And Verify

**Files:**
- Modify: `app/(localized)/[locale]/page.tsx`
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Insert the section**

Render `<IntroStory locale={locale} />` immediately after `<DualIdentityHero />` and before `<FeaturedWork />` without editing either adjacent component.

- [ ] **Step 2: Run code verification**

Run: `npm test -- tests/component/homepage.test.tsx`

Run: `npm run lint`

Run: `npm run build:framework`

Expected: all focused tests, lint, and framework build pass. Record unrelated pre-existing publication-validation failures separately if the full suite is run.

- [ ] **Step 3: Run browser verification**

At `1440x900`, `768x1024`, and `390x844`, verify four forward scenes, the 60px desktop cap, direct rail navigation, reverse skip to scene one, reduced-motion stack, no horizontal overflow, and no console errors.

- [ ] **Step 4: Commit the implementation**

Stage only the introduction documents, components, scoped styles, page insertion, and component tests. Commit with `feat: add kinetic portfolio introduction` on `codex/hero-redesign`.
