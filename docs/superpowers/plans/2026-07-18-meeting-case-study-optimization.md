# Agora Meeting Case Study Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the bilingual Agora Meeting page into a tighter, decision-led portfolio case study while preserving its routes, eight chapter anchors, shipped-product claims, and temporary media.

**Architecture:** Keep the existing MDX-driven case-study architecture and light editorial theme. Make focused changes to meeting content/models, add a compact linked Figma evidence component, and correct shared navigation tokens only where the current light-page state is unreadable.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, CSS Modules, Vitest/Testing Library, agent-browser.

---

### Task 1: Lock The Approved Narrative In Tests

**Files:**
- Modify: `tests/component/meeting-models.test.tsx`
- Modify: `tests/unit/meeting-content.test.ts`
- Modify: `tests/unit/meeting-assets.test.ts`
- Modify: `tests/component/meeting-layout.test.tsx`

- [x] **Step 1: Write failing model tests**

Assert that the stage matrix has exactly three body rows for Screen Share, Whiteboard Open, and Participant Count; assert that participant priority is exactly Active Speaker, Self, Camera + Microphone, Camera, and Microphone; remove imports and expectations for `FocusPinComparison`.

- [x] **Step 2: Write failing content and asset tests**

Read both MDX sources and assert that `Host Focus`, `Personal Pin`, `主持人聚焦`, `个人 Pin`, `FocusPinComparison`, and `focus-vs-pin` are absent. Assert that the manifest no longer requires `focus-vs-pin`, while retaining all eight chapter IDs.

- [x] **Step 3: Write compact-title coverage**

Update the meeting layout fixture to `Agora Meeting: A Real-time Collaboration System` and assert that the rendered H1 exposes the compact title without introducing manual line-break elements.

- [x] **Step 4: Run focused tests and verify RED**

Run: `npx vitest run tests/component/meeting-models.test.tsx tests/component/meeting-layout.test.tsx tests/unit/meeting-content.test.ts tests/unit/meeting-assets.test.ts`

Expected: FAIL because the current model contains four triggers, seven priorities, Focus/Pin content, and the old asset requirement.

### Task 2: Simplify The Meeting Models And Asset Contract

**Files:**
- Modify: `components/meeting/meeting-models.tsx`
- Modify: `components/meeting/meeting-models.module.css`
- Modify: `evidence/meeting/manifest.json`
- Modify: `scripts/generate-meeting-static-evidence.mjs`

- [x] **Step 1: Implement the three-trigger matrix**

Delete the Host Focus row in both locales and retain Screen Share, Whiteboard Open, and Participant Count.

- [x] **Step 2: Implement the five-item participant priority**

Delete Focus/Pin copy and the `FocusPinComparison` export. Begin both locale priority arrays with Active Speaker/current speaker and keep Self, Camera + Microphone, Camera, and Microphone.

- [x] **Step 3: Remove obsolete presentation styles**

Delete `.comparison` and `.comparisonItem` selectors and remove them from grouped selectors and mobile rules, preserving language and capability layouts.

- [x] **Step 4: Remove Focus/Pin from generated assets**

Delete the `focusPinSvg` generator, its `writeSvgPng` call, and the `focus-vs-pin` manifest entry. Update the generated matrix and participant-priority image data to match the approved model; do not delete user-owned source images.

- [x] **Step 5: Run focused tests and verify GREEN**

Run the Task 1 Vitest command. Expected: model and asset assertions pass; content assertions may remain red until Task 4.

### Task 3: Add Compact Figma Decision Evidence

**Files:**
- Modify: `components/meeting/meeting-evidence.tsx`
- Modify: `components/meeting/meeting-evidence.module.css`
- Modify: `tests/component/meeting-evidence.test.tsx`

- [x] **Step 1: Write the failing evidence test**

Render a new `BreakoutDecisionEvidence` component in both locales and assert a link to Figma node `1-15037`, the 50-group and 24-character constraints, disabled-state handling, empty/occupied deletion behavior, and designer-attributed product/engineering/QA alignment copy.

- [x] **Step 2: Run the evidence test and verify RED**

Run: `npx vitest run tests/component/meeting-evidence.test.tsx`

Expected: FAIL because `BreakoutDecisionEvidence` is not exported.

- [x] **Step 3: Implement the evidence component**

Create a semantic, compact evidence block with one heading, four concise rules, an attribution note, and a clearly labeled external Figma link. Do not embed the full canvas or claim that Figma proves approval authorship.

- [x] **Step 4: Style the evidence block**

Use the existing coral accent, 6px radius, sparse dividers, responsive two-column rules on desktop and one column below 720px. Preserve focus visibility and avoid nested cards.

- [x] **Step 5: Run the evidence test and verify GREEN**

Run the Task 3 Vitest command. Expected: PASS.

### Task 4: Tighten The Bilingual Case Study

**Files:**
- Modify: `content/work/meeting.en.mdx`
- Modify: `content/work/meeting.zh.mdx`

- [x] **Step 1: Shorten hero metadata**

Use `Agora Meeting: A Real-time Collaboration System` in English and `Agora Meeting：跨四端的实时协作系统` in Chinese. Keep the shipped disclosure, facts, media, and all eight chapter IDs.

- [x] **Step 2: Compress chapters one through three**

Remove repeated descriptions of changing meeting state while preserving the business trigger, sole-designer scope, customer requirements, default/configurable strategy, and context-to-priority-to-interface model.

- [x] **Step 3: Rewrite adaptive stage and whiteboard copy**

Describe exactly three stage triggers, remove all visible Focus/Pin language and comparison rendering, update video descriptions, and state the five-item whiteboard participant priority without unsupported outcome claims.

- [x] **Step 4: Consolidate evidence and disclosure**

Render `BreakoutDecisionEvidence` in the capability chapter. Remove repeated statements that quantitative data is unavailable, leaving the overview disclosure as the single source of truth and retaining concise delivery language later.

- [x] **Step 5: Run content validation and focused tests**

Run: `npx vitest run tests/unit/meeting-content.test.ts tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx`

Run: `npm run validate:content`

Expected: PASS with eight stable chapters and no Focus/Pin terms in published meeting content.

### Task 5: Correct Hero And Navigation Readability

**Files:**
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/case-study/chapter-nav.module.css`
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`
- Modify: `tests/component/site-header.test.tsx`

- [x] **Step 1: Write the failing header-state test**

Add a page-theme input or document-context expectation showing that the initial header uses dark ink on a light meeting hero while the scrolled capsule remains light-on-dark.

- [x] **Step 2: Run the header test and verify RED**

Run: `npx vitest run tests/component/site-header.test.tsx`

Expected: FAIL because the current initial capsule always inherits paper-colored text.

- [x] **Step 3: Implement light-hero header context**

Detect the page theme through an existing route/layout signal if available; otherwise add a narrowly scoped document marker from `MeetingLayout`. Keep unrelated dark-hero routes unchanged and preserve the current scrolled capsule.

- [x] **Step 4: Compact the hero**

Reduce top spacing and title scale so the title stays within two desktop lines, set mobile type to 42-48px, use `word-break: normal` and `overflow-wrap: break-word`, narrow metadata gaps, and pull the top of hero media earlier without changing the temporary image.

- [x] **Step 5: Correct chapter-nav colors**

Give inactive links explicit dark muted ink on the paper background in desktop and drawer states; retain coral/cobalt focus affordances and current-location emphasis.

- [x] **Step 6: Run component tests and lint touched files**

Run: `npx vitest run tests/component/meeting-layout.test.tsx tests/component/site-header.test.tsx`

Run: `npx eslint components/meeting components/case-study/chapter-nav.tsx components/case-study/chapter-nav.module.css components/shell/site-header.tsx`

Expected: PASS with no new lint errors.

### Task 6: Verify The Full Page

**Files:**
- Modify if required by a reproduced regression: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Run the full relevant suite**

Run: `npx vitest run tests/component/meeting-models.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-evidence.test.tsx tests/component/site-header.test.tsx tests/unit/meeting-content.test.ts tests/unit/meeting-assets.test.ts`

Run: `npm run validate:content`

Run: `npm run build`

- [x] **Step 2: Load the current agent-browser workflow**

Run: `agent-browser skills get core --full` before any browser command.

- [x] **Step 3: Verify Chinese and English desktop**

At 1440x1000, check initial header contrast, a maximum two-line H1, a visible hint of hero media, readable chapter links, all eight anchors, and absence of Focus/Pin visible text.

- [x] **Step 4: Verify Chinese and English mobile**

At 390x844, open the chapter drawer and check all links are readable, English words do not split mid-word, the page has no horizontal overflow, and the Figma evidence collapses coherently.

- [x] **Step 5: Separate known temporary-media failures**

Report the pre-existing missing MP4/caption responses separately from implementation regressions. Do not replace temporary media as part of this task.

- [x] **Step 6: Run the design pre-flight and copy audit**

Re-read every changed visible string; verify a single light theme, consistent coral accent and 6px radius, zero new decorative animation, accessible focus states, explicit mobile collapse, and no unsupported metrics or collaboration claims.
