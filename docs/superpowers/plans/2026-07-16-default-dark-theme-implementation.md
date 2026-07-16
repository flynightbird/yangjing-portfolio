# Default Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio use a default dark theme while retaining light-theme tokens and adding no visible switcher.

**Architecture:** Add stable light and dark palette tokens in `app/globals.css`, then map active semantic theme tokens to dark. Migrate the shared shell and homepage surfaces to semantic tokens while leaving artwork-specific and Xuelang-specific colors intact.

**Tech Stack:** Next.js, React, CSS Modules, Playwright, agent-browser.

---

### Task 1: Theme Contract

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] Add a browser assertion that the page canvas resolves to `rgb(17, 19, 17)` and primary text to `rgb(242, 244, 240)`.
- [ ] Add named `--theme-light-*` and `--theme-dark-*` values plus active semantic aliases.
- [ ] Map the global page canvas and text to the active semantic aliases.

### Task 2: Shared Shell And Homepage

**Files:**
- Modify: `components/shell/site-header.module.css`
- Modify: `components/shell/site-footer.module.css`
- Modify: `components/home/home.module.css`
- Modify: `components/ui/action-link.module.css`

- [ ] Replace general page surfaces, text, borders, menus, and controls with active theme aliases.
- [ ] Keep signal-color buttons and all cover-specific overlay colors unchanged.
- [ ] Verify focus, hover, disabled, and reduced-motion states.

### Task 3: Visual Verification

**Files:**
- Test: `tests/e2e/homepage.spec.ts`

- [ ] Run focused lint and browser tests.
- [ ] Capture desktop and mobile screenshots in both locales.
- [ ] Verify all four archive cards, header controls, no overflow, and readable metadata.
