# ConvoAI Black Cinematic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the shipped ConvoAI case study as a near-black, motion-led evidence narrative and make the global Footer the only ending for every Work and Build detail.

**Architecture:** Keep the existing content registry, shared shell, chapter navigation, verified media catalog, and global Footer. Remove the neighbor contract at schema, route, and layout boundaries; then extend the ConvoAI client media layer with accessible evidence carousel, horizontal voiceprint modes, inline product imagery, and a scoped GSAP controller with responsive and reduced-motion fallbacks.

**Tech Stack:** Next.js App Router, React 19, TypeScript, MDX, CSS Modules, GSAP + ScrollTrigger, Vitest + Testing Library, Playwright.

---

### Task 1: Remove Project Neighbor Navigation Globally

**Files:**
- Modify: `content/schema.ts`
- Modify: `content/registry.ts`
- Modify: `app/(localized)/[locale]/work/[slug]/page.tsx`
- Modify: `app/(localized)/[locale]/build/[slug]/page.tsx`
- Modify: `components/case-study/case-layout.tsx`
- Modify: `components/case-study/case-layout.module.css`
- Modify: `components/convo-ai/convo-ai-layout.tsx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `components/meeting/meeting-layout.tsx`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `content/work/*.mdx`
- Modify: `content/build/*.mdx`
- Test: `tests/unit/content-schema.test.ts`
- Test: `tests/unit/case-neighbor.test.tsx`
- Test: affected case component and E2E tests

- [ ] Write tests proving neighbor fields are rejected/absent and no case layout renders `data-project-previous` or `data-project-next`.
- [ ] Run focused tests and confirm they fail against the old model.
- [ ] Delete neighbor fields, canonical-neighbor validation, route lookup, props, markup, and CSS without changing global Footer mounting.
- [ ] Update fixtures to the neighbor-free contract and run focused tests to green.
- [ ] Commit only the neighbor-removal files.

### Task 2: Establish the ConvoAI Black Editorial System

**Files:**
- Modify: `components/convo-ai/convo-ai-layout.tsx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `content/work/convo-ai.en.mdx`
- Test: `tests/component/convo-ai-layout.test.tsx`
- Test: `tests/unit/convo-ai-content.test.ts`

- [ ] Add failing assertions for near-black surfaces, large chapter numerals, removed small section labels, seven occupied state cells, and the existing seven chapter IDs.
- [ ] Run the focused component/content tests and confirm the new assertions fail.
- [ ] Add scoped Outfit typography, black elevation tokens, giant numeral composition, wide headings, dense seven-cell state strip, and semantic cyan/blue/red color rules.
- [ ] Rewrite only awkward unsupported presentation copy; preserve designer-reported ownership, launch status, and evidence boundaries.
- [ ] Run the focused tests to green and commit the visual foundation.

### Task 3: Build Accessible Evidence Carousels

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `content/work/convo-ai.en.mdx`
- Test: `tests/component/convo-ai-media.test.tsx`
- Test: `tests/e2e/convo-ai.spec.ts`

- [ ] Add failing tests for previous/next arrow controls, active slide status, wrap-around selection, stable stage dimensions, one mounted active video, 1x enforcement, full source metadata, and 20px media-card corners.
- [ ] Run focused media tests and confirm the carousel expectations fail.
- [ ] Replace playlist queue layout with a large evidence carousel while retaining every complete recording, CPDI description, poster, controls, and error recovery state.
- [ ] Apply low-luminance dark cyan, red, forest, and violet-gray surfaces by stable media position and retain accessible direct selection.
- [ ] Run focused tests to green and commit the carousel work.

### Task 4: Add Voiceprint Accordion and Inline Product Imagery

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `content/work/convo-ai.en.mdx`
- Test: `tests/component/convo-ai-media.test.tsx`
- Test: `tests/component/convo-ai-layout.test.tsx`

- [ ] Add failing tests for a keyboard-operable three-mode voiceprint accordion and real orb/avatar imagery embedded in chapter headings.
- [ ] Run focused tests and confirm failure.
- [ ] Implement the desktop expanding slices with click/focus state and a fully visible stacked mobile presentation; use supplied product posters for the two inline heading images.
- [ ] Verify focus styling, labels, and mobile content visibility; run tests to green and commit.

### Task 5: Add Scoped Cinematic Motion

**Files:**
- Create: `components/convo-ai/convo-ai-motion.tsx`
- Modify: `components/convo-ai/convo-ai-layout.tsx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Test: `tests/component/convo-ai-layout.test.tsx`
- Test: `tests/e2e/convo-ai.spec.ts`

- [ ] Add failing assertions for motion hooks, realtime stage hooks, and reduced-motion/mobile static contracts.
- [ ] Run the focused tests and confirm failure.
- [ ] Register GSAP/ScrollTrigger in a client-only controller; add one hero depth timeline and one realtime pinned/scrubbed split timeline using `gsap.matchMedia()` cleanup.
- [ ] Disable long pins below desktop and for reduced motion; preserve App scroll activation and prevent transformed elements from increasing page width.
- [ ] Run focused tests to green and commit.

### Task 6: Verify the Complete Experience

**Files:**
- Modify only if verification exposes an in-scope defect.

- [ ] Run ConvoAI component/unit tests, neighbor/schema tests, TypeScript, and lint.
- [ ] Start or reuse the Next.js preview on an available localhost port.
- [ ] Run desktop, tablet, and mobile Playwright coverage; verify all 16 sources, no horizontal overflow, stable App switching, carousel operation, reduced-motion behavior, and absent neighbor navigation.
- [ ] Capture desktop/tablet/mobile screenshots and inspect hero, chapter numerals, inline imagery, media cards, realtime split, and Footer transition for blank media or overlap.
- [ ] Run the full build and record only pre-existing external asset/publication blockers if they remain.
- [ ] Perform a final evidence-language scan and confirm no invented research, metrics, testimonial, customer feedback, or business outcome appears.
