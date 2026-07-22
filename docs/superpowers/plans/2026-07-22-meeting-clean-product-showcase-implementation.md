# Meeting Clean Product Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove explanatory production notes and secondary navigation from Meeting while keeping a concise product-film portfolio structure.

**Architecture:** Keep the nine-chapter MDX and media readiness system intact. Remove unwanted content at its render boundaries, delete unused presentation primitives and styles, and update tests to make the simplified page contract explicit.

**Tech Stack:** Next.js 16, React 19, MDX, CSS Modules, Vitest, Testing Library, Playwright

---

### Task 1: Define the simplified page contract

**Files:**
- Modify: `tests/unit/meeting-content.test.ts`
- Modify: `tests/component/meeting-layout.test.tsx`
- Modify: `tests/component/meeting-showcase.test.tsx`
- Modify: `tests/e2e/meeting.spec.ts`

- [x] Replace assertions that require disclosures and deep dives with assertions that prohibit them.
- [x] Add assertions that project-neighbor navigation and evidence-boundary output are absent.
- [x] Run the focused Vitest files and confirm they fail against the current implementation.

Run: `npm test -- tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx`

Expected: FAIL because the current page still renders the removed material.

### Task 2: Simplify Meeting content and components

**Files:**
- Modify: `content/work/meeting.en.mdx`
- Modify: `content/work/meeting.zh.mdx`
- Modify: `components/meeting/meeting-layout.tsx`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/meeting/meeting-showcase.tsx`
- Modify: `components/meeting/meeting-showcase.module.css`
- Modify: `components/meeting/meeting-evidence.tsx`
- Modify: `components/meeting/meeting-evidence.module.css`
- Delete: `components/meeting/meeting-orientation-evidence.server.tsx`
- Modify: `components/meeting/meeting-print.css`

- [x] Remove all `DeepDive`, `MeetingOrientationEvidence`, and `EvidenceBoundary` imports and instances from both MDX files.
- [x] Remove hero disclosure and project-neighbor rendering from Meeting layout.
- [x] Render concise product descriptions under static media without pending-source language.
- [x] Delete now-unused component code and CSS.
- [x] Run focused Vitest and confirm the simplified contract passes.

Run: `npm test -- tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx tests/component/meeting-evidence.test.tsx`

Expected: PASS.

### Task 3: Verify the page and global shell

**Files:**
- Modify: `tests/e2e/meeting.spec.ts`

- [x] Assert both locales contain no removed notes or Meeting project navigation.
- [x] Assert the shared global footer remains visible after the Meeting article.
- [x] Run lint, Meeting tests, framework build, and Meeting Playwright coverage.
- [x] Inspect the final diff and keep `next-env.d.ts` unstaged.

Run: `npm run lint`

Run: `npm test -- tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx tests/component/meeting-evidence.test.tsx`

Run: `npm run build:framework`

Run: `npx playwright test tests/e2e/meeting.spec.ts`

Expected: all commands exit successfully, aside from any explicitly reported unrelated existing warnings.
