# Convo AI Studio Scroll Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Call Agent virtual browser into a horizontally filled, Figma-asset-backed console with a fixed sidebar and a slowly scrolling right panel.

**Architecture:** The standalone localized demo documents retain shared CSS and JavaScript. CSS establishes a fixed-height responsive console split; JavaScript measures the right panel and drives a visibility-aware Web Animations cycle, while the parent React card remains responsible only for locale selection, pointer drift, and navigation.

**Tech Stack:** Next.js, React, static HTML/CSS/JavaScript, Figma MCP assets, Vitest, Playwright.

---

### Task 1: Lock the new media contract in tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] Assert that the localized iframe source, non-interactive attributes, single overlay link, and 20px media radius remain intact.
- [ ] Assert on desktop that the sidebar position is stable while the right content panel changes its vertical transform.
- [ ] Assert on mobile that both the media and console stage remain untransformed and the document width does not exceed 390px.
- [ ] Run `npm test -- --run tests/component/homepage.test.tsx` and the two focused homepage Playwright cases; confirm the new scroll assertion fails before implementation.

### Task 2: Localize approved Figma assets

**Files:**
- Create: `public/demos/convo-ai-studio/assets/metric-icons-source.png`
- Create: `public/demos/convo-ai-studio/assets/service-ai.png`
- Create: `public/demos/convo-ai-studio/assets/news-grid.png`
- Create: `public/demos/convo-ai-studio/assets/official-avatar.png`

- [ ] Download the MCP-provided short-lived URLs into the demo asset directory.
- [ ] Verify each file using `file` and `sips -g pixelWidth -g pixelHeight`.
- [ ] Keep only the assets referenced by the standalone documents.

### Task 3: Refactor the standalone console layout

**Files:**
- Modify: `public/demos/convo-ai-studio/zh/index.html`
- Modify: `public/demos/convo-ai-studio/en/index.html`
- Modify: `public/demos/convo-ai-studio/studio.css`

- [ ] Introduce stable `data-studio-sidebar` and `data-studio-scroll-panel` selectors in both localized documents.
- [ ] Replace placeholder metric, service, avatar, and news visuals with the localized Figma assets.
- [ ] Change the console from two-axis fit scaling to width-fit layout with a full-height fixed sidebar and clipped right viewport.
- [ ] Preserve the full localized content order inside the right panel.

### Task 4: Implement the right-panel motion

**Files:**
- Modify: `public/demos/convo-ai-studio/studio.js`

- [ ] Measure the available right viewport and content overflow after fonts and images settle.
- [ ] Animate only `data-studio-scroll-panel` from `translateY(0)` to the measured negative overflow over approximately 20 seconds.
- [ ] Use start/end holds and an opacity reset frame to conceal the loop boundary.
- [ ] Rebuild the animation on resize, pause it while the page is hidden, and disable it for compact viewports or reduced motion.

### Task 5: Verify and commit

**Files:**
- Verify all files above plus `components/home/convo-ai-studio-window.tsx`, `components/home/flagship-projects.tsx`, and `components/home/home.module.css`.

- [ ] Run `npm test -- --run tests/component/homepage.test.tsx`.
- [ ] Run the focused desktop and mobile Playwright homepage tests.
- [ ] Capture desktop and 390px screenshots and confirm sidebar stability, readable right-panel framing, and no overflow.
- [ ] Run `npm run lint`, `npm run build:framework`, and `git diff --check`.
- [ ] Commit the complete approved Call Agent media-card implementation without staging unrelated files.

