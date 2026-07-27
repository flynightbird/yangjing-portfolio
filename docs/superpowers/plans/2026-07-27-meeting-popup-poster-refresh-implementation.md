# Meeting Popup Poster Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Meeting popup expression block into a darker poster-style composition with clearer hierarchy and cleaner styling.

**Architecture:** Keep the existing `MeetingPolishShowcase` entry point and popup asset list, but encode the poster hierarchy directly in the rendered markup using layer metadata. Replace the old ghost-outline treatment with a darker single-surface card and a lead/support composition in `meeting-showcase.module.css`.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Vitest, Testing Library

---

### Task 1: Protect the new popup composition contract

**Files:**
- Modify: `tests/component/meeting-evidence.test.tsx`

- [ ] Add a failing test that expects the popup composition to expose two support cards and two lead cards through data attributes.
- [ ] Run `npm test -- tests/component/meeting-evidence.test.tsx` and verify the new assertion fails before implementation.

### Task 2: Rebuild the popup structure

**Files:**
- Modify: `components/meeting/meeting-showcase.tsx`

- [ ] Add per-card layer metadata to the popup asset list.
- [ ] Render the popup poster without ghost-outline spans.
- [ ] Expose explicit `data-meeting-popup-layer` attributes for support and lead cards.

### Task 3: Refresh the poster styling

**Files:**
- Modify: `components/meeting/meeting-showcase.module.css`
- Modify: `tests/unit/portfolio-detail-system.test.ts`

- [ ] Replace the old washed gradient + outline treatment with a darker poster surface and focused purple glow.
- [ ] Recompose the four cards into an upper support layer and lower lead layer with subtler tilt and overlap.
- [ ] Add a source-level CSS assertion that protects the spacing contract below the final capability group and the new poster surface expectations.

### Task 4: Verify behavior and live appearance

**Files:**
- None

- [ ] Run the focused Vitest coverage for the popup component and CSS contract.
- [ ] Inspect `http://localhost:4194/zh/work/meeting/` to confirm the poster reads darker, cleaner, and more hierarchical than before.
