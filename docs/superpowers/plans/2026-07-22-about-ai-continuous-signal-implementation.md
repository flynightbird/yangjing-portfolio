# About AI Continuous Signal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About AI card's generic transformation diagram with a refined continuous workflow graphic using Visual System modules at both endpoints.

**Architecture:** Keep `CapabilityGraphic` and its shared SVG styling. Replace only the `ai` SVG branch, add scoped CSS classes for its path and modules, and update the existing component contract tests.

**Tech Stack:** Next.js, React, SVG, CSS Modules, Vitest, Testing Library

---

### Task 1: Replace obsolete test contracts

- [ ] Assert the AI graphic exposes `data-ai-workflow="continuous-signal"`.
- [ ] Assert both endpoint modules are present.
- [ ] Assert the old transform spark is absent.
- [ ] Run the focused test and confirm it fails before implementation.

### Task 2: Implement the continuous workflow SVG

- [ ] Replace the prompt, arrow, sparkle, and fake dashboard shapes.
- [ ] Add refined start and end Visual System modules.
- [ ] Connect them with one continuous curved path and four semantic nodes.
- [ ] Add scoped motion that communicates workflow progression.
- [ ] Add a reduced-motion fallback.
- [ ] Run the focused component test and confirm it passes.

### Task 3: Verify rendering

- [ ] Capture desktop and 390px screenshots.
- [ ] Confirm the graphic is balanced, labels remain legible, and no shape is clipped.
- [ ] Run targeted lint and the focused component test.

